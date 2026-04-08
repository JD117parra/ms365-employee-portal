const { ConfidentialClientApplication } = require('@azure/msal-node')

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET,
  },
}

const cca = new ConfidentialClientApplication(msalConfig)

// In-memory OBO token cache keyed by user OID.
// Avoids a round-trip to Microsoft on every request for the same user.
const oboTokenCache = new Map()

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Used only to extract the stable user identifier (oid claim).
 */
function extractOid(jwtToken) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwtToken.split('.')[1], 'base64url').toString()
    )
    return payload.oid ?? payload.sub ?? null
  } catch {
    return null
  }
}

function getCachedToken(oid) {
  const entry = oboTokenCache.get(oid)
  if (!entry) return null
  // Treat tokens expiring within 5 minutes as stale
  if (Date.now() >= entry.expiresAt - 5 * 60 * 1000) {
    oboTokenCache.delete(oid)
    return null
  }
  return entry.accessToken
}

function setCachedToken(oid, accessToken, expiresOn) {
  oboTokenCache.set(oid, {
    accessToken,
    // expiresOn is a Date from MSAL; fall back to 55 min if missing
    expiresAt: expiresOn ? new Date(expiresOn).getTime() : Date.now() + 55 * 60 * 1000,
  })
}

/**
 * Acquires an On-Behalf-Of (OBO) token for Microsoft Graph using the
 * access token forwarded by the client in the Authorization header.
 * Caches the resulting Graph token by user OID to avoid redundant
 * round-trips to Microsoft on consecutive requests.
 */
async function acquireGraphToken(req, res, next) {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Malformed Authorization header' })
  }
  const userToken = parts[1]

  const oid = extractOid(userToken)
  if (oid) {
    const cached = getCachedToken(oid)
    if (cached) {
      req.graphToken = cached
      return next()
    }
  }

  try {
    const oboRequest = {
      oboAssertion: userToken,
      scopes: ['https://graph.microsoft.com/.default'],
    }

    const tokenResponse = await cca.acquireTokenOnBehalfOf(oboRequest)
    req.graphToken = tokenResponse.accessToken

    if (oid) {
      setCachedToken(oid, tokenResponse.accessToken, tokenResponse.expiresOn)
    }

    next()
  } catch (error) {
    // Log only the error code to avoid leaking token details in logs
    console.error('OBO token acquisition failed — code:', error.errorCode ?? 'unknown')
    return res.status(401).json({ error: 'Token acquisition failed' })
  }
}

module.exports = { acquireGraphToken }

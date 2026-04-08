const { ConfidentialClientApplication } = require('@azure/msal-node')

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET,
  },
}

const cca = new ConfidentialClientApplication(msalConfig)

/**
 * Acquires an On-Behalf-Of (OBO) token for Microsoft Graph using the
 * access token forwarded by the client in the Authorization header.
 *
 * The client sends its own MSAL-issued access token; the server exchanges
 * it for a Graph-scoped token without storing user credentials.
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

  try {
    const oboRequest = {
      oboAssertion: userToken,
      scopes: ['https://graph.microsoft.com/.default'],
    }

    const tokenResponse = await cca.acquireTokenOnBehalfOf(oboRequest)
    req.graphToken = tokenResponse.accessToken
    next()
  } catch (error) {
    // Log only the error code to avoid leaking token details in logs
    console.error('OBO token acquisition failed — code:', error.errorCode ?? 'unknown')
    return res.status(401).json({ error: 'Token acquisition failed' })
  }
}

module.exports = { acquireGraphToken }

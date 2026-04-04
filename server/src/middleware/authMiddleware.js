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

  const userToken = authHeader.split(' ')[1]

  try {
    const oboRequest = {
      oboAssertion: userToken,
      scopes: ['https://graph.microsoft.com/.default'],
    }

    const tokenResponse = await cca.acquireTokenOnBehalfOf(oboRequest)
    req.graphToken = tokenResponse.accessToken
    next()
  } catch (error) {
    console.error('OBO token acquisition failed:', error.message)
    return res.status(401).json({ error: 'Token acquisition failed', details: error.message })
  }
}

module.exports = { acquireGraphToken }

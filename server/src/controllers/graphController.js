const axios = require('axios')

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0'

/**
 * GET /api/graph/me
 * Returns the authenticated user's profile from Microsoft Graph.
 */
async function getMe(req, res, next) {
  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${req.graphToken}` },
    })
    res.json(response.data)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/graph/me/photo
 * Returns the authenticated user's profile photo as a base64 data URL.
 */
async function getMyPhoto(req, res, next) {
  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/me/photo/$value`, {
      headers: { Authorization: `Bearer ${req.graphToken}` },
      responseType: 'arraybuffer',
    })

    const base64 = Buffer.from(response.data).toString('base64')
    const contentType = response.headers['content-type'] || 'image/jpeg'
    res.json({ photo: `data:${contentType};base64,${base64}` })
  } catch (error) {
    // Not all M365 accounts have a profile photo — Graph returns 404 in that case
    if (error.response?.status === 404) {
      return res.json({ photo: null })
    }
    next(error)
  }
}

/**
 * GET /api/graph/me/events
 * Returns the authenticated user's upcoming calendar events (top 10, UTC).
 */
async function getMyEvents(req, res, next) {
  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/me/events`, {
      headers: {
        Authorization: `Bearer ${req.graphToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
      params: {
        $select: 'subject,start,end,location,organizer',
        $orderby: 'start/dateTime',
        $top: 10,
      },
    })
    res.json(response.data)
  } catch (error) {
    next(error)
  }
}

module.exports = { getMe, getMyPhoto, getMyEvents }

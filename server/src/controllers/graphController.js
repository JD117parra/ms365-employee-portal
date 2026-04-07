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

/**
 * GET /api/graph/users
 * Returns a list of users in the tenant (top 50).
 * Supports ?search=term for filtering by displayName or mail.
 */
async function getUsers(req, res, next) {
  try {
    const { search } = req.query
    const params = {
      $select: 'id,displayName,jobTitle,department,mail,userPrincipalName',
      $top: 50,
      $orderby: 'displayName',
    }

    const headers = {
      Authorization: `Bearer ${req.graphToken}`,
    }

    if (search) {
      headers.ConsistencyLevel = 'eventual'
      params.$search = `"displayName:${search}" OR "mail:${search}"`
      params.$orderby = undefined
      params.$count = true
    }

    const response = await axios.get(`${GRAPH_BASE_URL}/users`, {
      headers,
      params,
    })
    res.json(response.data)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/graph/users/:id
 * Returns a specific user's full profile.
 */
async function getUserById(req, res, next) {
  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/users/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.graphToken}` },
      params: {
        $select: 'id,displayName,jobTitle,department,officeLocation,mobilePhone,mail,userPrincipalName',
      },
    })
    res.json(response.data)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/graph/users/:id/photo
 * Returns a specific user's profile photo as a base64 data URL.
 */
async function getUserPhoto(req, res, next) {
  try {
    const response = await axios.get(`${GRAPH_BASE_URL}/users/${req.params.id}/photo/$value`, {
      headers: { Authorization: `Bearer ${req.graphToken}` },
      responseType: 'arraybuffer',
    })
    const base64 = Buffer.from(response.data).toString('base64')
    const contentType = response.headers['content-type'] || 'image/jpeg'
    res.json({ photo: `data:${contentType};base64,${base64}` })
  } catch (error) {
    if (error.response?.status === 404) {
      return res.json({ photo: null })
    }
    next(error)
  }
}

module.exports = { getMe, getMyPhoto, getMyEvents, getUsers, getUserById, getUserPhoto }

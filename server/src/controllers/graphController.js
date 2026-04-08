const axios = require('axios')

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sanitizeKqlTerm(term) {
  return term.replace(/["\\]/g, '')
}

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
      const sanitized = sanitizeKqlTerm(search)
      params.$search = `"displayName:${sanitized}" OR "mail:${sanitized}"`
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
  if (!UUID_REGEX.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user ID format' })
  }
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
  if (!UUID_REGEX.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user ID format' })
  }
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

/**
 * Fetches incomplete tasks from Microsoft To Do.
 * Requires Tasks.Read permission.
 */
async function fetchTodoTasks(graphToken) {
  const listsResponse = await axios.get(`${GRAPH_BASE_URL}/me/todo/lists`, {
    headers: { Authorization: `Bearer ${graphToken}` },
    params: { $select: 'id,displayName' },
  })

  const lists = listsResponse.data.value || []

  // Fire all list-task requests in parallel instead of sequentially.
  // With N lists this reduces wall time from O(N) serial to O(1) concurrent.
  const listTaskPromises = lists.map(async (list) => {
    try {
      const tasksResponse = await axios.get(
        `${GRAPH_BASE_URL}/me/todo/lists/${list.id}/tasks`,
        {
          headers: { Authorization: `Bearer ${graphToken}` },
          params: {
            $select: 'id,title,status,importance,dueDateTime,createdDateTime',
            $filter: "status ne 'completed'",
            $orderby: 'createdDateTime desc',
            $top: 20,
          },
        }
      )
      return (tasksResponse.data.value || []).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        importance: task.importance,
        dueDateTime: task.dueDateTime,
        createdDateTime: task.createdDateTime,
        source: 'todo',
        listName: list.displayName,
      }))
    } catch {
      return [] // Skip lists that fail without blocking the others
    }
  })

  const results = await Promise.all(listTaskPromises)
  return results.flat()
}

/**
 * Fetches tasks assigned to the user from Microsoft Planner.
 * Requires Group.Read.All and Tasks.Read permission.
 */
async function fetchPlannerTasks(graphToken) {
  const response = await axios.get(`${GRAPH_BASE_URL}/me/planner/tasks`, {
    headers: { Authorization: `Bearer ${graphToken}` },
    params: {
      $select: 'id,title,percentComplete,priority,dueDateTime,createdDateTime,planId',
    },
  })

  const tasks = (response.data.value || [])
    .filter((task) => task.percentComplete < 100)
    .map((task) => {
      // Planner priority: 0-1 = Urgent, 2-3 = Important, 4-5 = Medium, 6-10 = Low
      let importance = 'normal'
      if (task.priority <= 1) importance = 'high'
      else if (task.priority >= 6) importance = 'low'

      return {
        id: task.id,
        title: task.title,
        status: task.percentComplete === 0 ? 'notStarted' : 'inProgress',
        importance,
        dueDateTime: task.dueDateTime
          ? { dateTime: task.dueDateTime, timeZone: 'UTC' }
          : undefined,
        createdDateTime: task.createdDateTime,
        source: 'planner',
        percentComplete: task.percentComplete,
      }
    })
  return tasks
}

/**
 * GET /api/graph/me/tasks
 * Returns the authenticated user's incomplete tasks from both
 * Microsoft To Do and Planner, merged and sorted.
 */
async function getMyTasks(req, res, next) {
  try {
    const results = await Promise.allSettled([
      fetchTodoTasks(req.graphToken),
      fetchPlannerTasks(req.graphToken),
    ])

    const allTasks = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allTasks.push(...result.value)
      }
    }

    // If both sources failed, return an error
    if (results.every((r) => r.status === 'rejected')) {
      return res.status(403).json({
        error: 'Cannot access tasks. Ensure Tasks.Read and Group.Read.All permissions are granted in Azure Portal.',
      })
    }

    // Sort by importance (high first), then by due date
    allTasks.sort((a, b) => {
      const impOrder = { high: 0, normal: 1, low: 2 }
      const aImp = impOrder[a.importance] ?? 1
      const bImp = impOrder[b.importance] ?? 1
      if (aImp !== bImp) return aImp - bImp
      if (a.dueDateTime && b.dueDateTime) {
        return new Date(a.dueDateTime.dateTime) - new Date(b.dueDateTime.dateTime)
      }
      return a.dueDateTime ? -1 : 1
    })

    res.json({ value: allTasks.slice(0, 25) })
  } catch (error) {
    next(error)
  }
}

module.exports = { getMe, getMyPhoto, getMyEvents, getMyTasks, getUsers, getUserById, getUserPhoto }

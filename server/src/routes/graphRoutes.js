const { Router } = require('express')
const { acquireGraphToken } = require('../middleware/authMiddleware')
const { getMe, getMyPhoto, getMyEvents, getUsers, getUserById, getUserPhoto } = require('../controllers/graphController')

const router = Router()

// All graph routes require a valid OBO token
router.use(acquireGraphToken)

router.get('/me', getMe)
router.get('/me/photo', getMyPhoto)
router.get('/me/events', getMyEvents)
router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.get('/users/:id/photo', getUserPhoto)

module.exports = router

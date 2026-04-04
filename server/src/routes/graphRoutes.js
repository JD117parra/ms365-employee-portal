const { Router } = require('express')
const { acquireGraphToken } = require('../middleware/authMiddleware')
const { getMe, getMyPhoto, getMyEvents } = require('../controllers/graphController')

const router = Router()

// All graph routes require a valid OBO token
router.use(acquireGraphToken)

router.get('/me', getMe)
router.get('/me/photo', getMyPhoto)
router.get('/me/events', getMyEvents)

module.exports = router

const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/resources', bookingController.getResources);
router.post('/resources', requirePermission('manage_organization'), bookingController.createResource);

router.get('/', bookingController.getBookings);
router.get('/my', bookingController.getUserBookings);
router.post('/', requirePermission('book_resource'), bookingController.createBooking);
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;

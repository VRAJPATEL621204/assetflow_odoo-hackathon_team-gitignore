const { z } = require('zod');
const bookingService = require('../services/bookingService');

const createBookingSchema = z.object({
  resourceId: z.number().int(),
  startTime: z.string().datetime({ message: 'Invalid start time format' }),
  endTime: z.string().datetime({ message: 'Invalid end time format' }),
});

const createResourceSchema = z.object({
  name: z.string().min(2, 'Resource name must be at least 2 characters').max(100),
  type: z.enum(['ROOM', 'VEHICLE', 'EQUIPMENT']),
  description: z.string().max(250).optional().nullable(),
});

class BookingController {
  getResources = async (req, res, next) => {
    try {
      const resources = await bookingService.getResources();
      return res.status(200).json({ success: true, data: resources });
    } catch (error) {
      next(error);
    }
  };

  createResource = async (req, res, next) => {
    try {
      const validatedData = createResourceSchema.parse(req.body);
      const resource = await bookingService.createResource(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: resource });
    } catch (error) {
      next(error);
    }
  };

  getBookings = async (req, res, next) => {
    try {
      const bookings = await bookingService.getBookings();
      return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  };

  getUserBookings = async (req, res, next) => {
    try {
      const bookings = await bookingService.getUserBookings(req.user.id);
      return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  };

  createBooking = async (req, res, next) => {
    try {
      const validatedData = createBookingSchema.parse(req.body);
      const booking = await bookingService.createBooking(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  };

  cancelBooking = async (req, res, next) => {
    try {
      const cancelled = await bookingService.cancelBooking(req.user.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: cancelled });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BookingController();

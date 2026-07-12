const bookingRepository = require('../repositories/bookingRepository');
const { logActivity, createNotification } = require('../utils/activity');

class BookingService {
  async getResources() {
    return bookingRepository.findAllResources();
  }

  async createResource(userId, data) {
    const resource = await bookingRepository.createResource(data);
    await logActivity(userId, 'RESOURCE_CREATE', 'resource', resource.id, `Created shared resource ${resource.name}`);
    return resource;
  }

  async getBookings() {
    return bookingRepository.findAllBookings();
  }

  async getUserBookings(userId) {
    return bookingRepository.findBookingsByUserId(userId);
  }

  async createBooking(userId, data) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // 1. Validation: End time must be after start time
    if (start >= end) {
      throw new Error('Booking end time must be after start time');
    }

    // 2. Validation: Booking must be in the future
    if (start < new Date()) {
      throw new Error('Cannot book resources in the past');
    }

    // 3. Overlap Check: Find conflicting booking
    const conflict = await bookingRepository.findConflictingBooking(data.resourceId, data.startTime, data.endTime);
    if (conflict) {
      throw new Error(
        `Time slot is already booked for this resource by employee ${conflict.bookedBy.name} (${conflict.bookedBy.email})`
      );
    }

    // 4. Save Booking
    const booking = await bookingRepository.createBooking({
      resourceId: data.resourceId,
      bookedById: userId,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    // 5. Log activity & create notification
    await logActivity(
      userId,
      'BOOKING_CREATE',
      'resource_booking',
      booking.id,
      `Reserved resource "${booking.resource.name}"`
    );

    await createNotification(
      userId,
      'BOOKING_START',
      `Your reservation for ${booking.resource.name} is confirmed.`
    );

    return booking;
  }

  async cancelBooking(userId, id) {
    const booking = await bookingRepository.cancelBooking(id);
    await logActivity(userId, 'BOOKING_CANCEL', 'resource_booking', booking.id, `Cancelled booking ID ${booking.id}`);
    return booking;
  }
}

module.exports = new BookingService();

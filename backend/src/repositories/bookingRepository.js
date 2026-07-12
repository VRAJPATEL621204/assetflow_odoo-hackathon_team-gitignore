const prisma = require('../config/prisma');

class BookingRepository {
  async findAllResources() {
    return prisma.resource.findMany({
      include: {
        bookings: {
          include: {
            bookedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findResourceById(id) {
    return prisma.resource.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async createResource(data) {
    return prisma.resource.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
      },
    });
  }

  async findConflictingBooking(resourceId, startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return prisma.resourceBooking.findFirst({
      where: {
        resourceId: parseInt(resourceId),
        status: { in: ['UPCOMING', 'ONGOING'] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      include: {
        bookedBy: true,
      },
    });
  }

  async createBooking(data) {
    return prisma.resourceBooking.create({
      data: {
        resourceId: parseInt(data.resourceId),
        bookedById: parseInt(data.bookedById),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: 'UPCOMING',
      },
      include: {
        resource: true,
      },
    });
  }

  async findBookingsByUserId(userId) {
    return prisma.resourceBooking.findMany({
      where: { bookedById: parseInt(userId) },
      include: { resource: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async findAllBookings() {
    return prisma.resourceBooking.findMany({
      include: {
        resource: true,
        bookedBy: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async cancelBooking(id) {
    return prisma.resourceBooking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
    });
  }
}

module.exports = new BookingRepository();

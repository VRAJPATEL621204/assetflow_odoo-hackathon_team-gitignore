const prisma = require('../config/prisma');

class ReportRepository {
  async getDashboardKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // 1. Assets Available
    const assetsAvailable = await prisma.asset.count({
      where: { status: 'AVAILABLE' },
    });

    // 2. Assets Allocated
    const assetsAllocated = await prisma.asset.count({
      where: { status: 'ALLOCATED' },
    });

    // 3. Maintenance Today
    const maintenanceToday = await prisma.maintenanceRequest.count({
      where: {
        status: { in: ['APPROVED', 'IN_PROGRESS'] },
      },
    });

    // 4. Active Bookings
    const activeBookings = await prisma.resourceBooking.count({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] },
      },
    });

    // 5. Pending Transfers
    const pendingTransfers = await prisma.transferRequest.count({
      where: { status: 'PENDING' },
    });

    // 6. Upcoming Returns (active allocations due within next 7 days)
    const upcomingReturns = await prisma.assetAllocation.count({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: {
          gte: today,
          lte: sevenDaysLater,
        },
      },
    });

    // 7. Overdue Returns (active allocations where expectedReturnDate is in the past)
    const overdueReturns = await prisma.assetAllocation.count({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: {
          lt: new Date(),
        },
      },
    });

    return {
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
    };
  }

  async getRecentActivities() {
    return prisma.activityLog.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  async getCategoryUtilizationReport() {
    const categories = await prisma.assetCategory.findMany({
      include: { assets: true },
    });
    return categories.map((cat) => {
      const total = cat.assets.length;
      const allocated = cat.assets.filter(a => a.status === 'ALLOCATED').length;
      const maintenance = cat.assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
      const utilizationRate = total > 0 ? ((allocated / total) * 100).toFixed(1) : '0.0';
      return { category: cat.name, totalAssets: total, allocated, underMaintenance: maintenance, utilizationRate: parseFloat(utilizationRate) };
    });
  }

  async getDeptUtilizationReport() {
    // Pull active allocations with employee → department and asset status
    const allocations = await prisma.assetAllocation.findMany({
      where: { status: 'ACTIVE' },
      include: {
        asset: { select: { status: true } },
        employee: {
          include: { department: { select: { id: true, name: true } } },
        },
      },
    });

    // Also pull all assets to count totals per dept (via direct departmentId)
    const assets = await prisma.asset.findMany({
      select: { status: true, departmentId: true },
    });

    // Seed from department table so all depts appear
    const depts = await prisma.department.findMany({ select: { id: true, name: true } });
    const deptMap = {};
    depts.forEach(d => {
      deptMap[d.id] = { name: d.name, allocated: 0, available: 0, maintenance: 0, total: 0 };
    });

    // Count direct asset.departmentId assignments
    assets.forEach(a => {
      if (a.departmentId && deptMap[a.departmentId]) {
        deptMap[a.departmentId].total++;
        if (a.status === 'AVAILABLE') deptMap[a.departmentId].available++;
        else if (a.status === 'UNDER_MAINTENANCE') deptMap[a.departmentId].maintenance++;
      }
    });

    // Count active allocations → attribute to employee's department
    allocations.forEach(alloc => {
      const deptId = alloc.employee?.department?.id;
      if (deptId && deptMap[deptId]) {
        deptMap[deptId].allocated++;
        if (deptMap[deptId].total < deptMap[deptId].allocated) {
          deptMap[deptId].total = deptMap[deptId].allocated;
        }
      }
    });

    return Object.values(deptMap)
      .filter(d => d.total > 0 || d.allocated > 0)
      .map(d => ({
        department: d.name.length > 11 ? d.name.substring(0, 11) + '\u2026' : d.name,
        allocated: d.allocated,
        available: d.available,
        maintenance: d.maintenance,
        total: d.total,
      }));
  }

  async getMaintenanceFrequencyReport() {
    // Group maintenance requests by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const requests = await prisma.maintenanceRequest.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true, priority: true },
    });

    // Build month buckets
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        total: 0,
        resolved: 0,
        pending: 0,
      });
    }

    requests.forEach(r => {
      const m = r.createdAt.getMonth();
      const y = r.createdAt.getFullYear();
      const bucket = months.find(b => b.monthIndex === m && b.year === y);
      if (bucket) {
        bucket.total++;
        if (r.status === 'RESOLVED') bucket.resolved++;
        else bucket.pending++;
      }
    });

    return months.map(({ month, total, resolved, pending }) => ({ month, total, resolved, pending }));
  }
}

module.exports = new ReportRepository();

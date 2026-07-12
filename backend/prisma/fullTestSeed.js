/**
 * fullTestSeed.js  —  Corrected to match actual Prisma schema field names.
 * Run with: node prisma/fullTestSeed.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Pre-computed bcrypt hash for 'password123'
const PASSWORD_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

async function main() {
  console.log('=== FULL TEST DATA SEEDING ===\n');

  // ─── 1. DEPARTMENTS ──────────────────────────────────────────────────────────
  console.log('Creating departments...');
  const depts = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering',     status: 'ACTIVE' } }),
    prisma.department.create({ data: { name: 'Finance',         status: 'ACTIVE' } }),
    prisma.department.create({ data: { name: 'Human Resources', status: 'ACTIVE' } }),
    prisma.department.create({ data: { name: 'Operations',      status: 'ACTIVE' } }),
    prisma.department.create({ data: { name: 'Marketing',       status: 'ACTIVE' } }),
    prisma.department.create({ data: { name: 'Legal',           status: 'ACTIVE' } }),
  ]);
  await prisma.department.update({ where: { id: depts[3].id }, data: { parentId: depts[0].id } });
  console.log(`  ✓ ${depts.length} departments`);

  // ─── 2. LOCATIONS ────────────────────────────────────────────────────────────
  console.log('Creating locations...');
  const locs = await Promise.all([
    prisma.location.create({ data: { name: 'Bengaluru HQ',   address: '123 Tech Park, Bengaluru' } }),
    prisma.location.create({ data: { name: 'Mumbai Office',  address: '456 BKC, Mumbai' } }),
    prisma.location.create({ data: { name: 'Warehouse A',    address: 'Plot 7, Industrial Estate' } }),
    prisma.location.create({ data: { name: 'Delhi Branch',   address: '789 Connaught Place, Delhi' } }),
    prisma.location.create({ data: { name: 'HQ Server Room', address: 'B1 Floor, Bengaluru HQ' } }),
    prisma.location.create({ data: { name: 'Chennai Office', address: '22 Anna Salai, Chennai' } }),
  ]);
  console.log(`  ✓ ${locs.length} locations`);

  // ─── 3. TECHNICIANS ──────────────────────────────────────────────────────────
  console.log('Creating technicians...');
  const techs = await Promise.all([
    prisma.technician.create({ data: { name: 'Ravi Kumar',   email: 'ravi@tech.com',    specialty: 'IT Hardware', status: 'ACTIVE' } }),
    prisma.technician.create({ data: { name: 'Amit Singh',   email: 'amit@tech.com',    specialty: 'Electrical',  status: 'ACTIVE' } }),
    prisma.technician.create({ data: { name: 'Priya Nair',   email: 'priya@tech.com',   specialty: 'Networking',  status: 'ACTIVE' } }),
    prisma.technician.create({ data: { name: 'Sanjay Gupta', email: 'sanjay@tech.com',  specialty: 'Mechanical',  status: 'ACTIVE' } }),
    prisma.technician.create({ data: { name: 'Lakshmi Rao',  email: 'lakshmi@tech.com', specialty: 'HVAC',        status: 'ACTIVE' } }),
  ]);
  console.log(`  ✓ ${techs.length} technicians`);

  // ─── 4. ASSET CATEGORIES + CUSTOM FIELDS ─────────────────────────────────────
  console.log('Creating categories...');
  const cats = await Promise.all([
    prisma.assetCategory.create({ data: { name: 'Laptops' } }),
    prisma.assetCategory.create({ data: { name: 'Vehicles' } }),
    prisma.assetCategory.create({ data: { name: 'Office Furniture' } }),
    prisma.assetCategory.create({ data: { name: 'Servers' } }),
    prisma.assetCategory.create({ data: { name: 'Projectors' } }),
    prisma.assetCategory.create({ data: { name: 'Network Equipment' } }),
  ]);
  await Promise.all([
    prisma.assetCustomField.create({ data: { categoryId: cats[0].id, fieldName: 'Warranty Months', fieldType: 'number', isRequired: true } }),
    prisma.assetCustomField.create({ data: { categoryId: cats[0].id, fieldName: 'OS Version',       fieldType: 'string', isRequired: false } }),
    prisma.assetCustomField.create({ data: { categoryId: cats[1].id, fieldName: 'Registration No',  fieldType: 'string', isRequired: true } }),
    prisma.assetCustomField.create({ data: { categoryId: cats[1].id, fieldName: 'Fuel Type',        fieldType: 'string', isRequired: false } }),
    prisma.assetCustomField.create({ data: { categoryId: cats[3].id, fieldName: 'RAM (GB)',          fieldType: 'number', isRequired: true } }),
    prisma.assetCustomField.create({ data: { categoryId: cats[3].id, fieldName: 'CPU Cores',        fieldType: 'number', isRequired: true } }),
    prisma.assetCustomField.create({ data: { categoryId: cats[4].id, fieldName: 'Resolution',       fieldType: 'string', isRequired: false } }),
  ]);
  console.log(`  ✓ ${cats.length} categories + custom fields`);

  // ─── 5. RESOURCES (bookable rooms/vehicles) ───────────────────────────────────
  console.log('Creating bookable resources...');
  const resources = await Promise.all([
    prisma.resource.create({ data: { name: 'Conference Room A', type: 'ROOM',      description: '10-person boardroom, projector + whiteboard', status: 'ACTIVE' } }),
    prisma.resource.create({ data: { name: 'Conference Room B', type: 'ROOM',      description: '6-person meeting room', status: 'ACTIVE' } }),
    prisma.resource.create({ data: { name: 'Pool Car – Innova', type: 'VEHICLE',   description: 'Toyota Innova for field visits', status: 'ACTIVE' } }),
    prisma.resource.create({ data: { name: 'Training Lab',      type: 'ROOM',      description: '20-seat computer lab', status: 'ACTIVE' } }),
    prisma.resource.create({ data: { name: 'Epson Projector',   type: 'EQUIPMENT', description: 'Portable 4K projector + HDMI cable', status: 'ACTIVE' } }),
  ]);
  console.log(`  ✓ ${resources.length} bookable resources`);

  // ─── 6. USERS ────────────────────────────────────────────────────────────────
  console.log('Creating users...');
  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map(r => [r.name, r]));

  const usersInput = [
    { name: 'John Doe',     email: 'john@company.com',   role: 'ASSET_MANAGER', deptIdx: 0 },
    { name: 'Priya Sharma', email: 'priya@company.com',  role: 'DEPT_HEAD',     deptIdx: 1 },
    { name: 'Aditya Verma', email: 'aditya@company.com', role: 'EMPLOYEE',      deptIdx: 0 },
    { name: 'Sneha Patil',  email: 'sneha@company.com',  role: 'EMPLOYEE',      deptIdx: 2 },
    { name: 'Rahul Mehta',  email: 'rahul@company.com',  role: 'DEPT_HEAD',     deptIdx: 3 },
    { name: 'Kavita Singh', email: 'kavita@company.com', role: 'EMPLOYEE',      deptIdx: 4 },
  ];
  const users = [];
  for (const u of usersInput) {
    const user = await prisma.user.create({
      data: {
        name: u.name, email: u.email, passwordHash: PASSWORD_HASH,
        status: 'ACTIVE', departmentId: depts[u.deptIdx].id,
        userRoles: { create: { roleId: roleMap[u.role].id } },
      },
    });
    users.push(user);
  }
  console.log(`  ✓ ${users.length} users`);

  // ─── 7. ASSETS ───────────────────────────────────────────────────────────────
  console.log('Creating assets...');
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const assetsInput = [
    { tag: 'AF-0001', name: 'Dell Latitude 5420',  serial: 'SN-DELL-001', cost: 1200,    cat: 0, loc: 0, status: 'ALLOCATED',         cond: 'GOOD'      },
    { tag: 'AF-0002', name: 'HP EliteBook 840',     serial: 'SN-HP-002',   cost: 950,     cat: 0, loc: 0, status: 'AVAILABLE',          cond: 'GOOD'      },
    { tag: 'AF-0003', name: 'Toyota Innova MH12',   serial: 'MH12AB1234',  cost: 1500000, cat: 1, loc: 1, status: 'ALLOCATED',          cond: 'EXCELLENT' },
    { tag: 'AF-0004', name: 'Dell PowerEdge R740',  serial: 'SN-SRV-004',  cost: 8500,    cat: 3, loc: 4, status: 'AVAILABLE',          cond: 'GOOD'      },
    { tag: 'AF-0005', name: 'Epson EB-2265U',       serial: 'SN-PROJ-005', cost: 750,     cat: 4, loc: 0, status: 'UNDER_MAINTENANCE',  cond: 'FAIR'      },
    { tag: 'AF-0006', name: 'Boardroom Table Set',  serial: 'SN-FURN-006', cost: 3200,    cat: 2, loc: 0, status: 'AVAILABLE',          cond: 'GOOD'      },
    { tag: 'AF-0007', name: 'Cisco Catalyst 2960',  serial: 'SN-NET-007',  cost: 1800,    cat: 5, loc: 4, status: 'AVAILABLE',          cond: 'GOOD'      },
  ];
  const assets = [];
  for (const a of assetsInput) {
    const asset = await prisma.asset.create({
      data: {
        tag: a.tag, name: a.name, serialNumber: a.serial,
        acquisitionCost: a.cost, acquisitionDate: sixMonthsAgo,
        condition: a.cond, status: a.status,
        categoryId: cats[a.cat].id, locationId: locs[a.loc].id,
      },
    });
    assets.push(asset);
  }
  console.log(`  ✓ ${assets.length} assets`);

  // ─── 8. ALLOCATIONS ──────────────────────────────────────────────────────────
  // Schema fields: assetId, employeeId, departmentId, expectedReturnDate,
  //                actualReturnDate, returnCondition, checkInNotes, status
  console.log('Creating allocations...');
  const now = new Date();
  const d = (days) => { const d = new Date(now); d.setDate(d.getDate() + days); return d; };

  const allocations = await Promise.all([
    // AF-0001 Dell → John Doe (ACTIVE)
    prisma.assetAllocation.create({
      data: { assetId: assets[0].id, employeeId: users[0].id, status: 'ACTIVE', expectedReturnDate: d(7) },
    }),
    // AF-0003 Toyota → Rahul Mehta (ACTIVE)
    prisma.assetAllocation.create({
      data: { assetId: assets[2].id, employeeId: users[4].id, status: 'ACTIVE', expectedReturnDate: d(30) },
    }),
    // AF-0002 HP → Aditya (RETURNED)
    prisma.assetAllocation.create({
      data: {
        assetId: assets[1].id, employeeId: users[2].id, status: 'RETURNED',
        expectedReturnDate: d(-5), actualReturnDate: now,
        returnCondition: 'GOOD', checkInNotes: 'Returned after training week in good condition',
      },
    }),
    // AF-0004 Server → Aditya (ACTIVE, overdue)
    prisma.assetAllocation.create({
      data: { assetId: assets[3].id, employeeId: users[2].id, status: 'ACTIVE', expectedReturnDate: d(-3) },
    }),
    // AF-0006 Table → Sneha (ACTIVE - dept allocation)
    prisma.assetAllocation.create({
      data: { assetId: assets[5].id, departmentId: depts[2].id, status: 'ACTIVE', expectedReturnDate: d(60) },
    }),
  ]);
  console.log(`  ✓ ${allocations.length} allocations`);

  // ─── 9. TRANSFER REQUESTS ────────────────────────────────────────────────────
  // Schema fields: allocationId, requestedById, targetEmployeeId, targetDepartmentId, reason, status
  console.log('Creating transfer requests...');
  await Promise.all([
    prisma.transferRequest.create({
      data: {
        allocationId: allocations[0].id, requestedById: users[2].id,
        targetEmployeeId: users[2].id, status: 'PENDING',
        reason: 'Aditya needs the Dell laptop for client demo next week',
      },
    }),
    prisma.transferRequest.create({
      data: {
        allocationId: allocations[3].id, requestedById: users[4].id,
        targetEmployeeId: users[4].id, status: 'APPROVED',
        approvedById: users[0].id, actionedAt: now,
        reason: 'Server redeployment to operations team data center',
      },
    }),
  ]);
  console.log('  ✓ 2 transfer requests');

  // ─── 10. MAINTENANCE REQUESTS ─────────────────────────────────────────────────
  // Schema fields: assetId, raisedById, description, priority, status, approvedById, technicianId
  // Cost/actionTaken live in MaintenanceLog (child records)
  console.log('Creating maintenance requests...');
  const mReqs = await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        assetId: assets[4].id, raisedById: users[2].id, priority: 'HIGH',
        status: 'APPROVED', description: 'Projector bulb flickering during presentations',
        approvedById: users[0].id, technicianId: techs[0].id,
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        assetId: assets[1].id, raisedById: users[2].id, priority: 'MEDIUM',
        status: 'PENDING', description: 'Battery drains under 2 hours on full charge',
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        assetId: assets[2].id, raisedById: users[4].id, priority: 'CRITICAL',
        status: 'IN_PROGRESS', description: 'Engine oil leak observed after 200km highway drive',
        approvedById: users[0].id, technicianId: techs[3].id,
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        assetId: assets[3].id, raisedById: users[0].id, priority: 'HIGH',
        status: 'RESOLVED', description: 'NIC card dropping packets intermittently',
        approvedById: users[0].id, technicianId: techs[2].id,
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        assetId: assets[0].id, raisedById: users[0].id, priority: 'LOW',
        status: 'PENDING', description: 'Keyboard spacebar key needs replacement',
      },
    }),
  ]);

  // Maintenance logs (cost/action for resolved/approved)
  await Promise.all([
    prisma.maintenanceLog.create({
      data: { maintenanceRequestId: mReqs[0].id, actionTaken: 'Scheduled bulb replacement', cost: 120.00 },
    }),
    prisma.maintenanceLog.create({
      data: { maintenanceRequestId: mReqs[3].id, actionTaken: 'NIC card replaced with spare Intel X550-T1 unit', partsReplaced: 'Intel X550-T1 10GbE NIC', cost: 280.00 },
    }),
  ]);
  console.log(`  ✓ ${mReqs.length} maintenance requests + 2 logs`);

  // ─── 11. RESOURCE BOOKINGS ───────────────────────────────────────────────────
  // Schema fields: resourceId, bookedById, startTime, endTime, status
  console.log('Creating resource bookings...');
  const t = (hoursOffset, daysOffset = 0) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + daysOffset);
    dt.setHours(hoursOffset, 0, 0, 0);
    return dt;
  };
  await Promise.all([
    prisma.resourceBooking.create({ data: { resourceId: resources[0].id, bookedById: users[0].id, startTime: t(9),  endTime: t(11),  status: 'ONGOING'   } }),
    prisma.resourceBooking.create({ data: { resourceId: resources[0].id, bookedById: users[3].id, startTime: t(14), endTime: t(16),  status: 'UPCOMING'  } }),
    prisma.resourceBooking.create({ data: { resourceId: resources[1].id, bookedById: users[1].id, startTime: t(10, 1), endTime: t(12, 1), status: 'UPCOMING'  } }),
    prisma.resourceBooking.create({ data: { resourceId: resources[2].id, bookedById: users[4].id, startTime: t(9, -1), endTime: t(17, -1), status: 'COMPLETED' } }),
    prisma.resourceBooking.create({ data: { resourceId: resources[4].id, bookedById: users[2].id, startTime: t(10, -2), endTime: t(11, -2), status: 'COMPLETED' } }),
    prisma.resourceBooking.create({ data: { resourceId: resources[3].id, bookedById: users[5].id, startTime: t(9, 2), endTime: t(13, 2), status: 'UPCOMING' } }),
  ]);
  console.log('  ✓ 6 resource bookings');

  // ─── 12. AUDIT CYCLE + VERIFICATIONS ─────────────────────────────────────────
  // AuditCycle schema: name, startDate, endDate, status (no createdById)
  // AuditVerification schema: auditCycleId, assetId, auditorId, status, notes
  console.log('Creating audit cycle and verifications...');
  const cycleStart = new Date(now); cycleStart.setDate(1);
  const cycleEnd   = new Date(now); cycleEnd.setDate(28);

  const cycle = await prisma.auditCycle.create({
    data: { name: 'Q3 Asset Inventory 2026', startDate: cycleStart, endDate: cycleEnd, status: 'ACTIVE' },
  });

  await Promise.all([
    prisma.auditVerification.create({ data: { auditCycleId: cycle.id, assetId: assets[0].id, auditorId: users[0].id, status: 'VERIFIED', notes: 'Found at assigned desk, condition good' } }),
    prisma.auditVerification.create({ data: { auditCycleId: cycle.id, assetId: assets[1].id, auditorId: users[0].id, status: 'VERIFIED', notes: 'Stored in IT cabinet, fully charged' } }),
    prisma.auditVerification.create({ data: { auditCycleId: cycle.id, assetId: assets[2].id, auditorId: users[4].id, status: 'VERIFIED', notes: 'Vehicle in B2 parking, keys with security' } }),
    prisma.auditVerification.create({ data: { auditCycleId: cycle.id, assetId: assets[3].id, auditorId: users[0].id, status: 'DAMAGED',  notes: 'NIC card issue — maintenance request raised' } }),
    prisma.auditVerification.create({ data: { auditCycleId: cycle.id, assetId: assets[4].id, auditorId: users[2].id, status: 'DAMAGED',  notes: 'Projector bulb flickering — sent to technician' } }),
    prisma.auditVerification.create({ data: { auditCycleId: cycle.id, assetId: assets[5].id, auditorId: users[1].id, status: 'VERIFIED', notes: 'Boardroom table in excellent condition' } }),
  ]);
  console.log('  ✓ 1 audit cycle + 6 verifications');

  // ─── 13. ACTIVITY LOG ────────────────────────────────────────────────────────
  console.log('Creating activity logs...');
  await Promise.all([
    prisma.activityLog.create({ data: { userId: users[0].id, action: 'ASSET_REGISTERED',  entityName: assets[0].name,      entityId: assets[0].id,      details: 'Registered Dell Latitude 5420 (AF-0001)' } }),
    prisma.activityLog.create({ data: { userId: users[0].id, action: 'ASSET_ALLOCATED',   entityName: 'John Doe',          entityId: allocations[0].id, details: 'Allocated AF-0001 to John Doe' } }),
    prisma.activityLog.create({ data: { userId: users[2].id, action: 'MAINTENANCE_RAISE', entityName: assets[4].name,      entityId: mReqs[0].id,       details: 'Raised repair for Epson Projector — HIGH priority' } }),
    prisma.activityLog.create({ data: { userId: users[0].id, action: 'BOOKING_CREATED',   entityName: 'Conference Room A', entityId: 1,                  details: 'Booked Conference Room A for sprint review' } }),
    prisma.activityLog.create({ data: { userId: users[0].id, action: 'AUDIT_CREATED',     entityName: cycle.name,          entityId: cycle.id,           details: 'Started Q3 Asset Inventory 2026 cycle' } }),
    prisma.activityLog.create({ data: { userId: users[2].id, action: 'TRANSFER_REQUEST',  entityName: assets[0].name,      entityId: 1,                  details: 'Requested transfer of AF-0001 to Aditya Verma' } }),
  ]);
  console.log('  ✓ 6 activity logs');

  console.log('\n=== ALL DONE ===');
  console.log('\nLogin credentials (password: password123 for all):');
  console.log('  Admin:         admin@company.com');
  console.log('  Asset Manager: john@company.com');
  console.log('  Dept Head:     priya@company.com  |  rahul@company.com');
  console.log('  Employee:      aditya@company.com |  sneha@company.com  |  kavita@company.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

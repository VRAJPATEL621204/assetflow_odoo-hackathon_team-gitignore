const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PASSWORD_HASH = '$2a$10$Vq.B0Psn5N8pP9v9UqXgXeR9X67Rpe8F95s5R5tEpeM4a6L.xU0V.';

async function ensureUserRole(userId, roleId) {
  const existing = await prisma.userRole.findFirst({
    where: { userId, roleId },
  });

  if (!existing) {
    await prisma.userRole.create({
      data: { userId, roleId },
    });
  }
}

async function upsertLocation(name, address) {
  const existing = await prisma.location.findFirst({ where: { name } });
  if (existing) {
    return prisma.location.update({
      where: { id: existing.id },
      data: { address },
    });
  }

  return prisma.location.create({ data: { name, address } });
}

async function ensureCustomField(categoryId, fieldName, fieldType, isRequired) {
  const existing = await prisma.assetCustomField.findFirst({
    where: { categoryId, fieldName },
  });

  if (existing) {
    return prisma.assetCustomField.update({
      where: { id: existing.id },
      data: { fieldType, isRequired },
    });
  }

  return prisma.assetCustomField.create({
    data: {
      categoryId,
      fieldName,
      fieldType,
      isRequired,
    },
  });
}

async function ensureAssetFieldValue(assetId, customFieldId, value) {
  const existing = await prisma.assetFieldValue.findFirst({
    where: { assetId, customFieldId },
  });

  if (existing) {
    return prisma.assetFieldValue.update({
      where: { id: existing.id },
      data: { value },
    });
  }

  return prisma.assetFieldValue.create({
    data: { assetId, customFieldId, value },
  });
}

async function upsertAsset(data) {
  return prisma.asset.upsert({
    where: { tag: data.tag },
    update: {
      name: data.name,
      serialNumber: data.serialNumber,
      acquisitionDate: data.acquisitionDate,
      acquisitionCost: data.acquisitionCost,
      condition: data.condition,
      status: data.status,
      categoryId: data.categoryId,
      locationId: data.locationId,
      departmentId: data.departmentId ?? null,
      isShared: data.isShared,
    },
    create: data,
  });
}

async function main() {
  console.log('--- RUNNING CURRENT STATE TEST SEED ---');

  const department = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: { status: 'ACTIVE' },
    create: {
      name: 'Engineering',
      status: 'ACTIVE',
    },
  });
  console.log('Department [Engineering] ready.');

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@company.com' },
    update: {
      name: 'John Doe',
      status: 'ACTIVE',
      passwordHash: PASSWORD_HASH,
      departmentId: department.id,
    },
    create: {
      name: 'John Doe',
      email: 'staff@company.com',
      passwordHash: PASSWORD_HASH,
      status: 'ACTIVE',
      departmentId: department.id,
    },
  });
  console.log('User [staff@company.com] ready.');

  const managerRole = await prisma.role.findUnique({ where: { name: 'ASSET_MANAGER' } });
  if (managerRole) {
    await ensureUserRole(staffUser.id, managerRole.id);
    console.log('Role [ASSET_MANAGER] linked.');
  } else {
    console.log('Role [ASSET_MANAGER] not found, skipping role mapping.');
  }

  const category = await prisma.assetCategory.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: { name: 'Laptops' },
  });
  console.log('Category [Laptops] ready.');

  const customField = await ensureCustomField(category.id, 'Warranty Months', 'number', true);
  console.log('Custom Field [Warranty Months] ready.');

  const location = await upsertLocation('Bengaluru HQ', '123 Tech Park, Bengaluru');
  console.log('Location [Bengaluru HQ] ready.');

  await prisma.technician.upsert({
    where: { email: 'ravi@tech.com' },
    update: {
      name: 'Ravi Kumar',
      specialty: 'IT Hardware',
      status: 'ACTIVE',
    },
    create: {
      name: 'Ravi Kumar',
      email: 'ravi@tech.com',
      specialty: 'IT Hardware',
      status: 'ACTIVE',
    },
  });
  console.log('Technician [Ravi Kumar] ready.');

  const now = new Date();

  const baseAsset = await upsertAsset({
    tag: 'AF-0001',
    name: 'Dell Latitude 5420',
    serialNumber: 'SN-DELL-98765',
    acquisitionCost: 1200.0,
    acquisitionDate: now,
    condition: 'GOOD',
    status: 'AVAILABLE',
    categoryId: category.id,
    locationId: location.id,
    departmentId: null,
    isShared: true,
  });

  await ensureAssetFieldValue(baseAsset.id, customField.id, '36');
  console.log('Asset [AF-0001] and custom values ready.');

  const utilizationAssetAllocated = await upsertAsset({
    tag: 'AF-UTIL-001',
    name: 'Utilization Laptop 1',
    serialNumber: 'AF-UTIL-001-SN',
    acquisitionCost: 1000.0,
    acquisitionDate: now,
    condition: 'GOOD',
    status: 'ALLOCATED',
    categoryId: category.id,
    locationId: location.id,
    departmentId: department.id,
    isShared: false,
  });

  await upsertAsset({
    tag: 'AF-UTIL-002',
    name: 'Utilization Laptop 2',
    serialNumber: 'AF-UTIL-002-SN',
    acquisitionCost: 1000.0,
    acquisitionDate: now,
    condition: 'GOOD',
    status: 'AVAILABLE',
    categoryId: category.id,
    locationId: location.id,
    departmentId: department.id,
    isShared: false,
  });

  await upsertAsset({
    tag: 'AF-UTIL-003',
    name: 'Utilization Laptop 3',
    serialNumber: 'AF-UTIL-003-SN',
    acquisitionCost: 1000.0,
    acquisitionDate: now,
    condition: 'GOOD',
    status: 'UNDER_MAINTENANCE',
    categoryId: category.id,
    locationId: location.id,
    departmentId: department.id,
    isShared: false,
  });

  const activeAllocation = await prisma.assetAllocation.findFirst({
    where: {
      assetId: utilizationAssetAllocated.id,
      status: 'ACTIVE',
    },
  });

  if (!activeAllocation) {
    const expectedReturnDate = new Date();
    expectedReturnDate.setDate(expectedReturnDate.getDate() + 7);

    await prisma.assetAllocation.create({
      data: {
        assetId: utilizationAssetAllocated.id,
        employeeId: staffUser.id,
        status: 'ACTIVE',
        expectedReturnDate,
      },
    });
  }

  console.log('Department utilization sample assets and allocation ready.');
  console.log('--- CURRENT STATE TEST SEED COMPLETE ---');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

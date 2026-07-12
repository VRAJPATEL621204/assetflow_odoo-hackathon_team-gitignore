const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- RUNNING TEST DATA SEEDING ---');

  // 1. Create Department
  const dept = await prisma.department.create({
    data: {
      name: 'Engineering',
      status: 'ACTIVE',
    },
  });
  console.log(`Department [${dept.name}] created.`);

  // 2. Create User (Asset Manager)
  // Pre-calculated bcrypt hash for 'password123'
  const passwordHash = '$2a$10$Vq.B0Psn5N8pP9v9UqXgXeR9X67Rpe8F95s5R5tEpeM4a6L.xU0V.';
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'staff@company.com',
      passwordHash,
      status: 'ACTIVE',
      departmentId: dept.id,
    },
  });
  console.log(`User [${user.name}] created.`);

  // Assign ASSET_MANAGER role
  const managerRole = await prisma.role.findUnique({
    where: { name: 'ASSET_MANAGER' },
  });
  if (managerRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: managerRole.id,
      },
    });
    console.log(`Role [ASSET_MANAGER] mapped to John Doe.`);
  }

  // 3. Create Asset Category & Custom Fields
  const category = await prisma.assetCategory.create({
    data: {
      name: 'Laptops',
    },
  });
  console.log(`Category [${category.name}] created.`);

  const customField = await prisma.assetCustomField.create({
    data: {
      categoryId: category.id,
      fieldName: 'Warranty Months',
      fieldType: 'number',
      isRequired: true,
    },
  });
  console.log(`Custom Field [${customField.fieldName}] registered.`);

  // 4. Create Location
  const location = await prisma.location.create({
    data: {
      name: 'Bengaluru HQ',
      address: '123 Tech Park, Bengaluru',
    },
  });
  console.log(`Location [${location.name}] registered.`);

  // 5. Create Technician
  const technician = await prisma.technician.create({
    data: {
      name: 'Ravi Kumar',
      email: 'ravi@tech.com',
      specialty: 'IT Hardware',
      status: 'ACTIVE',
    },
  });
  console.log(`Technician [${technician.name}] registered.`);

  // 6. Create Registered Asset
  const asset = await prisma.asset.create({
    data: {
      tag: 'AF-0001',
      name: 'Dell Latitude 5420',
      serialNumber: 'SN-DELL-98765',
      acquisitionCost: 1200.00,
      acquisitionDate: new Date(),
      condition: 'GOOD',
      status: 'AVAILABLE',
      categoryId: category.id,
      locationId: location.id,
      isShared: true, // Make it eligible for shared bookings (resource pooling)
    },
  });
  console.log(`Asset [${asset.name}] registered with Tag [${asset.tag}].`);

  // Map Custom Field Value
  await prisma.assetFieldValue.create({
    data: {
      assetId: asset.id,
      customFieldId: customField.id,
      value: '36',
    },
  });
  console.log('Custom attributes mapped successfully.');

  console.log('--- TEST DATA SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

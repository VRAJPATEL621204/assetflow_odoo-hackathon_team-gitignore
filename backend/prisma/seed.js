const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING ROLES AND PERMISSIONS ---');

  // 1. Create Roles
  const roles = [
    { name: 'ADMIN', description: 'System Administrator - manages master data and promotes roles' },
    { name: 'ASSET_MANAGER', description: 'Asset Manager - registers assets, approves maintenance & audit cycles' },
    { name: 'DEPT_HEAD', description: 'Department Head - manages department allocations & approves transfers' },
    { name: 'EMPLOYEE', description: 'Regular Employee - views allocated assets, books resources, raises repair requests' },
  ];

  // Seed empty arrays to let the user add them dynamically from the UI

  const roleMap = {};
  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roleMap[role.name] = dbRole;
    console.log(`Role [${role.name}] upserted.`);
  }

  // 2. Create Permissions
  const permissions = [
    { name: 'manage_organization', description: 'Configure departments, asset categories, and promotions' },
    { name: 'register_asset', description: 'Register, edit, and retire assets' },
    { name: 'allocate_asset', description: 'Assign custody of assets to staff or departments' },
    { name: 'approve_transfer', description: 'Approve or reject asset custody transfer requests' },
    { name: 'approve_maintenance', description: 'Approve repair requests and assign technicians' },
    { name: 'create_audit', description: 'Create periodic audit cycles and assign auditors' },
    { name: 'perform_audit', description: 'Mark asset status check-ins during audit cycles' },
    { name: 'book_resource', description: 'Reserve meeting rooms, vehicles, or equipment' },
    { name: 'raise_maintenance', description: 'Report asset damage and request repairs' },
  ];

  const permMap = {};
  for (const perm of permissions) {
    const dbPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    permMap[perm.name] = dbPerm;
    console.log(`Permission [${perm.name}] upserted.`);
  }

  // 3. Associate Permissions with Roles (RolePermission)
  const rolePermissionMappings = {
    ADMIN: ['manage_organization'],
    ASSET_MANAGER: [
      'register_asset',
      'allocate_asset',
      'approve_transfer',
      'approve_maintenance',
      'create_audit',
      'perform_audit',
      'book_resource',
      'raise_maintenance',
    ],
    DEPT_HEAD: [
      'approve_transfer',
      'book_resource',
    ],
    EMPLOYEE: [
      'book_resource',
      'raise_maintenance',
      'perform_audit',
    ],
  };

  // Clear existing role permissions mappings to avoid duplicates during re-runs
  await prisma.rolePermission.deleteMany({});

  for (const [roleName, permNames] of Object.entries(rolePermissionMappings)) {
    const roleId = roleMap[roleName].id;
    for (const permName of permNames) {
      const permissionId = permMap[permName].id;
      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId,
        },
      });
      console.log(`Mapped Role [${roleName}] -> Permission [${permName}]`);
    }
  }

  const bcrypt = require('bcryptjs');
  console.log('--- SEEDING DEFAULT ADMIN USER ---');
  const adminEmail = 'admin@company.com';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: 'Admin User',
      passwordHash,
      status: 'ACTIVE',
    },
  });

  const adminRoleId = roleMap['ADMIN'].id;
  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      roleId: adminRoleId,
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRoleId,
      },
    });
    console.log(`Default admin user linked to ADMIN role.`);
  } else {
    console.log(`Default admin user already linked to ADMIN role.`);
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULY ---');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

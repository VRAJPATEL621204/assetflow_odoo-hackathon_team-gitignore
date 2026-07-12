const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      activity_logs, system_notifications, audit_discrepancies, audit_verifications,
      audit_assignments, audit_cycles, resource_bookings, maintenance_logs,
      maintenance_requests, transfer_requests, allocation_history, asset_allocations,
      asset_documents, asset_components, asset_field_values, assets,
      user_roles, users, resources, resource_availabilities,
      asset_custom_fields, asset_categories, technicians, locations, departments
    RESTART IDENTITY CASCADE
  `);
  console.log('All tables truncated.');
}
main().catch(console.error).finally(() => prisma.$disconnect());

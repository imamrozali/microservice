import { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const adminRole = await knex('roles').where({ role_name: 'Administrator' }).first();
  const employeeRole = await knex('roles').where({ role_name: 'Employee' }).first();
  const managerRole = await knex('roles').where({ role_name: 'Manager' }).first();

  if (!adminRole || !employeeRole || !managerRole) {
    throw new Error('Roles not found. Please run roles seed first.');
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const employeePassword = process.env.EMPLOYEE_PASSWORD || 'employee123';
  const managerPassword = process.env.MANAGER_PASSWORD || 'manager123';

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedEmployeePassword = await bcrypt.hash(employeePassword, 10);
  const hashedManagerPassword = await bcrypt.hash(managerPassword, 10);

  await knex('users').insert([
    {
      
      email: 'admin@dexa.com',
      password: hashedAdminPassword,
      full_name: 'System Administrator',
      job_position: 'Administrator',
      photo_url: null,
      role_id: adminRole.id,
      is_active: true,
    },
    {
      email: 'employee@dexa.com',
      password: hashedEmployeePassword,
      full_name: 'John Doe',
      job_position: 'Software Engineer',
      photo_url: null,
      role_id: employeeRole.id,
      is_active: true,
    },
    {
      email: 'manager@dexa.com',
      password: hashedManagerPassword,
      full_name: 'Jane Smith',
      job_position: 'Project Manager',
      photo_url: null,
      role_id: managerRole.id,
      is_active: true,
    },
  ]);

  console.log('✓ Users seeded successfully');
  console.log('✓ admin@dexa.com /', adminPassword);
  console.log('✓ employee@dexa.com /', employeePassword);
  console.log('✓ manager@dexa.com /', managerPassword);
}

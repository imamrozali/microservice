import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const roles = [
    {
     
      name: 'Administrator',
      description: 'Full access to all system features and settings.',
      permissions: JSON.stringify(['*']),
      is_active: true,
    },
    {
     
      name: 'Employee',
      description: 'Limited access to assigned tasks and resources.',
      permissions: JSON.stringify(['view_tasks', 'update_profile']),
      is_active: true,
    },
    {
     
      name: 'Manager',
      description: 'Manage teams and oversee operations.',
      permissions: JSON.stringify(['view_tasks', 'assign_tasks', 'view_reports']),
      is_active: true,
    },
  ];

  for (const role of roles) {
    await knex('roles')
      .insert({
        role_name: role.name,
        description: role.description,
        permissions: role.permissions,
        is_active: role.is_active,
      })
      .onConflict('role_name')
      .merge();
  }

  console.log('✓ Roles seeded successfully');
}

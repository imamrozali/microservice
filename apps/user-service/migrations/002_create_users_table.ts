import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
   table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('full_name', 100).notNullable();
    table.string('job_position', 100).nullable();
    table.string('phone_number', 20).nullable();
    table.text('photo_url').nullable();
    table.uuid('role_id').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    table.foreign('role_id').references('id').inTable('roles').onDelete('RESTRICT').onUpdate('CASCADE');
    
    table.index(['email']);
    table.index(['role_id']);
    table.index(['is_active']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}

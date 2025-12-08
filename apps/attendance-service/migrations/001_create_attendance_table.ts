import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.date('attendance_date').notNullable();
    table.time('check_in_time').nullable();
    table.time('check_out_time').nullable();
    table.enum('status', ['MASUK', 'PULANG', 'INCOMPLETE']).notNullable().defaultTo('INCOMPLETE');
    table.string('notes', 255).nullable();
    table.string('ip_address', 50).nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'attendance_date']);
    table.index(['user_id']);
    table.index(['attendance_date']);
    table.index(['status']);
    table.index(['created_at']);

  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attendance');
}

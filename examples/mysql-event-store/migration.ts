import { Knex } from 'knex'

const TABLE_NAME = 'events'

export async function up(knex: Knex) {
  let exists = await knex.schema.hasTable(TABLE_NAME)
  if (exists) return

  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.bigIncrements('id').primary().notNullable()

    table.uuid('aggregate_id').notNullable().index()
    table.bigInteger('version').unsigned().notNullable()

    table.uuid('event_id').notNullable()
    table.string('event_name').notNullable()

    table.jsonb('payload').notNullable()

    table.timestamp('recorded_at', { precision: 3 }).notNullable()

    // Optimistic locking
    table.unique(['aggregate_id', 'version'])
  })
}

export async function down(knex: Knex) {
  await Promise.all([knex.schema.dropTableIfExists(TABLE_NAME)])
}

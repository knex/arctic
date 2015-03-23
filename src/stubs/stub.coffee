
exports.up = (knex, Promise) ->
  <% if (d.tableName) { %>
  knex.schema.createTable "<%= d.tableName %>", (t) ->
    t.increments()
    t.timestamp()
  <% } %>


exports.down = (knex, Promise) ->
  <% if (d.tableName) { %>
  knex.schema.dropTable "<%= d.tableName %>"
  <% } %>
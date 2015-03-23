'use strict';

import extend from 'xtend';
import mutate from 'xtend/mutable';

const defaults = {
  extension: 'js',
  tableName: 'knex_migrations',
  directory: './migrations'
};

export default class Migrator {
  constructor (knex) {
    this.knex = knex;
    this.config = extend(defaults, knex.client.migrationConfig);
  }
  configure (config) {
    mutate(this.config, config);
    return this;
  }
}
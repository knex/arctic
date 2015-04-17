'use strict'

import extend from 'xtend'
import mutate from 'xtend/mutable'
import {resolve, extname} from 'path'
import {jsVariants} from 'interpret'
import assert from 'assert'
import Promise from 'bluebird'
import fs from 'fs'
import MigrationFile from './file'

Promise.promisifyAll(fs)

const extensions = Object.keys(jsVariants)

const defaults = {
  extension: 'js',
  tableName: 'knex_migrations',
  directory: './migrations'
}

export default class Migrator {
  constructor (knex) {
    this.knex = knex
    this.config = extend(defaults, knex.client.migrationConfig)
  }
  configure (config) {
    mutate(this.config, config)
    return this
  }
  directory () {
    return resolve(process.cwd(), this.config.directory)
  }
  @configurable
  make (name) {
    assert(name, 'A name must be specified for the generated migration')
    return new MigrationFile(name, this.config).write(this.directory())
  }
  @configurable
  all () {
    return fs.readdirAsync(this.directory())
      .filter((file) => {
        return extensions.indexOf(extname(file)) > -1
      })
      .call('sort')
  }
  table () {
    const {tableName} = this.config
    return this.knex.schema.hasTable(tableName)
      .then((exists) => {
        if (!exists) return this.knex.schema.createTable(tableName, migrationTable)
      })
      .return(tableName)
  }
  completed () {
    return this.table()
      .then((tableName) => {
        return this.knex(tableName).orderBy('id').pluck('name')
      })
  }
}

/*eslint-disable no-unused-vars*/
function configurable (target, name, descriptor) {
  const fn = descriptor.value
  descriptor.value = function (...args) {
    const config = args[fn.length]
    this.configure(config)
    return Promise.try(fn, args.slice(0, config ? -1 : undefined), this)
  }
}
/*eslint-enable no-unused-vars*/

function migrationTable (t) {
  t.increments()
  t.string('name')
  t.integer('batch')
  t.timestamp('migration_time')
}

'use strict'

import extend from 'xtend'
import mutate from 'xtend/mutable'
import {resolve} from 'path'
import assert from 'assert'
import Promise from 'bluebird'
import MigrationFile from './file'

const defaults = {
  extension: 'js',
  tableName: 'knex_migrations',
  directory: './migrations'
}

class Migrator {
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
}

export default Migrator

Migrator.prototype.make = configurable(function (name) {
  assert(name, 'A name must be specified for the generated migration')
  return new MigrationFile(name, this.config).write(this.directory())
})

function configurable (fn) {
  return function (...args) {
    const config = args[fn.length]
    this.configure(config)
    return Promise.try(fn, args.slice(0, config ? -1 : undefined), this)
  }
}

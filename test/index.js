'use strict'

import test from 'blue-tape'
import sinon from 'sinon'
import 'sinon-as-promised'
import proxyquire from 'proxyquire'
import {isAbsolute} from 'path'
import 'babel/polyfill'

const MockFile = sinon.spy()
const Migrator = proxyquire('../', {
  './file': MockFile
})

test('Constructor', (t) => {
  const knex = {
    client: {}
  }
  const migrate = new Migrator(knex)
  t.equal(migrate.knex, knex, 'stores knex instance')
  t.equal(migrate.config.extension, 'js', 'applies defaults')
  knex.client.migrationConfig = {
    extension: 'ts'
  }
  t.equal(new Migrator(knex).config.extension, 'ts', 'applies config')
  t.end()
})

test('configure', (t) => {
  const migrate = new Migrator({
    client: {}
  })
  migrate.configure({extension: 'coffee'})
  t.equal(migrate.config.extension, 'coffee', 'mutates config')
  t.equal(migrate.configure(), migrate, 'returns self')
  t.end()
})

test('directory', (t) => {
  const migrate = new Migrator({
    client: {}
  })
  migrate.config.directory = 'dir'
  const dir = migrate.directory()
  t.ok(isAbsolute(dir), 'absolute dir')
  t.ok(/\/dir$/.test(dir))
  t.end()
})

test('make', (t) => {
  const migrate = new Migrator({
    client: {}
  })
  MockFile.prototype.write = sinon.stub().resolves()
  t.test('name requried', (t) => {
    let err
    return migrate.make()
      .catch((e) => {
        err = e
      })
      .finally(() => {
        t.ok(err)
      })
  })
  t.test('creating migration file', (t) => {
    sinon.stub(migrate, 'directory').returns('dir')
    return migrate.make('users')
      .then(() => {
        sinon.assert.calledWith(MockFile, 'users', migrate.config)
        sinon.assert.calledWith(MockFile.prototype.write, 'dir')
      })
      .finally(() => {
        MockFile.reset()
      })
  })
  t.test('passing configuration', (t) => {
    return migrate.make('users', {
      extension: 'ts'
    })
    .then(() => {
      t.equal(migrate.config.extension, 'ts', 'applies final arg as config')
    })
  })
  t.end()
})

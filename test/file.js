'use strict'

import test from 'blue-tape'
import sinon from 'sinon'
import 'sinon-as-promised'
import template from 'lodash.template'
import {isAbsolute} from 'path'
import fs from 'fs'
import File from '../src/file'

test('Constructor', (t) => {
  const clock = sinon.useFakeTimers()
  const variables = {}
  const file = new File('f', {
    extension: 'js',
    variables
  })
  t.equal(file.filename, '19700101190000_f.js', 'generates filename with timestamp')
  t.equal(file.variables, variables, 'assigns variables')
  t.ok(isAbsolute(file.stub), 'absolute path to stub')
  t.ok(/\/stubs\/stub\.js$/.test(file.stub), 'path to stub')
  t.equal(new File('f', {
    stub: 'thestub.js'
  }).stub, 'thestub.js', 'custom stub')
  clock.restore()
  t.end()
})

test('template', (t) => {
  const stub = 'stub.js'
  sinon.stub(fs, 'readFile')
    .withArgs(stub)
    .yields(null, new Buffer('<%= d.tableName %>'))

  return new File('name', {stub})
    .template()
    .then((template) => {
      t.equal(typeof template, 'function', 'creates template fn')
      return template({
        tableName: 'table'
      })
    })
    .then((output) => {
      t.equal(output, 'table')
    })
    .finally(() => {
      fs.readFile.restore()
    })
})

test('write', (t) => {
  const file = new File('name', {
    variables: {
      tableName: 'table'
    }
  })
  file.filename = 'name.js'
  sinon.stub(file, 'template')
    .resolves(template('<%= d.tableName %>', {
      variable: 'd'
    }))
  sinon.stub(fs, 'writeFile').yields(null)
  return file.write('thedir')
    .then((path) => {
      t.equal(path, 'thedir/name.js', 'resolves file path')
      sinon.assert.calledWith(
        fs.writeFile,
        'thedir/name.js',
        'table'
      )
    })
    .finally(() => {
      fs.writeFile.restore()
    })
})

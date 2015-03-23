'use strict';

import fs from 'fs';
import Promise from 'bluebird';
import {join, resolve} from 'path';
import date from 'easydate';
import template from 'lodash.template';

fs = Promise.promisifyAll(fs);

module.exports = class MigrationFile {
  constructor (name, config) {
    const extension = config.extension;
    this.filename = filename(name, extension);
    this.variables = config.variables || {};
    this.stub = config.stub || join(__dirname, 'stubs', `stub.${extension}`);
  }
  template () {
    return fs.readFile(this.stub)
      .call('toString')
      .then(function (stub) {
        return template(stub, {
          variable: 'd'
        });
      });
  }
  write (directory) {
    return this.template()
      .bind(this)
      .then(function (template) {
        return fs.writeFile(
          join(directory, this.filename),
          template(this.variables)
        );
      })
      .return(join(directory, this.filename));
  }
};

function filename (name, extension) {
  if (name.charAt(0) === '-') name = name.slice(1);
  return `${date('YMdhms')}_${name}.${extension}`;
}
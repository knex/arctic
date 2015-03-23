'use strict';

import fs from 'fs';
import Promise from 'bluebird';
import {join, resolve} from 'path';
import date from 'easydate';
import template from 'lodash.template';

fs = Promise.promisifyAll(fs);

export default class MigrationFile {
  constructor (name, config) {
    const extension = config.extension;
    this.filename = filename(name, extension);
    this.variables = config.variables || {};
    this.stub = config.stub || join(__dirname, 'stubs', `stub.${extension}`);
  }
  template () {
    return fs.readFileAsync(this.stub)
      .call('toString')
      .then(function (stub) {
        return template(stub, {
          variable: 'd'
        });
      });
  }
  write (directory) {
    const destination = join(directory, this.filename);
    return this.template()
      .bind(this)
      .then(function (template) {
        return fs.writeFileAsync(
          destination,
          template(this.variables)
        );
      })
      .return(destination);
  }
};

function filename (name, extension) {
  return `${date('YMdhms')}_${name}.${extension}`;
}
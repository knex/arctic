'use strict';

import {expect} from 'chai';
import Migrator from '../';

describe('Migrator', () => {

  let knex, migrate;
  beforeEach(() => {
    knex = {
      client: {}
    };
    migrate = new Migrator(knex);
  });

  describe('Constructor', () => {

    it('stores the knex instance', () => {
      expect(migrate.knex).to.equal(knex);
    });

    it('applies default configuration', () => {
      expect(migrate.config.extension).to.equal('js');
    });

    it('applies client migration configuration', () => {
      knex.client.migrationConfig = {
        extension: 'ts'
      };
      expect(new Migrator(knex).config.extension).to.equal('ts');
    });

  });

  describe('#configure', () => {

    it('mutates the configuration', () => {
      migrate.configure({extension: 'coffee'});
      expect(migrate.config.extension).to.equal('coffee');
    });

    it('is a noop with no arguments', () => {
      migrate.configure();
      expect(migrate.config.extension).to.equal('js');
    });

    it('returns the migrator', () => {
      expect(migrate.configure()).to.equal(migrate);
    });

  });

});
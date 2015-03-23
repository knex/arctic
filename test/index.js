'use strict';

import chai from 'chai';
import sinon from 'sinon';
import 'sinon-as-promised';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import proxyquire from 'proxyquire';
import {isAbsolute} from 'path';
import 'babel/polyfill';

const expect = chai.use(sinonChai).use(chaiAsPromised).expect;

const MockFile = sinon.spy();

const Migrator = proxyquire('../', {
  './file': MockFile
});

describe('Migrator', () => {

  let knex, migrate;
  beforeEach(() => {
    knex = {
      client: {}
    };
    migrate = new Migrator(knex);
    sinon.spy(migrate, 'configure');
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

  describe('#directory', function () {

    it('returns an absolute config dir path', () => {
      migrate.config.directory = 'dir';
      const dir = migrate.directory();
      expect(isAbsolute(dir)).to.equal(true);
      expect(dir.endsWith('/dir')).to.equal(true);
    });

  });

  describe('#make', function () {

    beforeEach(() => {
      MockFile.prototype.write = sinon.stub().resolves();
      MockFile.reset();
    });

    it('must receive a "name"', () => {
      return expect(migrate.make())
        .to.be.rejectedWith('A name must be specified');
    });

    it('creates the migration file', () => {
      sinon.stub(migrate, 'directory').returns('dir');
      return migrate.make('users')
        .then(() => {
          expect(MockFile).to.have.been.calledWith('users', migrate.config);
          expect(MockFile.prototype.write)
            .to.be.calledWith('dir');
        });
    });

    it('can receive configuration', () => {
      const config = {};
      return migrate.make('users', config)
        .then(() => {
          expect(migrate.configure).to.have.been.calledWith(config);
        });
    });

  });

});
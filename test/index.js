'use strict';

import {expect} from 'chai';
import Migrator from '../';

describe('Migrator', () => {

  describe('Constructor', () => {

    it('stores the knex instance', () => {
      const knex = {};
      expect(new Migrator(knex).knex).to.equal(knex);
    });

  });

});
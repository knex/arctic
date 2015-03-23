'use strict';

import {expect} from 'chai';
import sinon from 'sinon';
import {isAbsolute} from 'path';
import 'babel/polyfill';
import File from '../lib/file';

describe('Migration file', () => {

  describe('Constructor', () => {

    it('generates a filename with the timestamp', () => {
      const clock = sinon.useFakeTimers();
      const file = new File('name', {
        extension: 'js'
      });
      expect(file.filename).to.equal('19700101160000_name.js');
    });

    it('stores variables', () => {
      const variables = {};
      expect(new File('name', {
        variables
      }))
      .to.have.property('variables', variables);
    });

    it('finds the stub', () => {
      const file = new File('name', {
        extension: 'js'
      });
      expect(isAbsolute(file.stub)).to.equal(true);
      expect(file.stub.endsWith('/stubs/stub.js')).to.equal(true);
    });

    it('can use a custom stub', () => {
      expect(new File('name', {
        stub: 'thestub.js'
      }))
      .to.have.property('stub', 'thestub.js');
    });

  });

});
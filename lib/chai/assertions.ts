import { use } from 'chai';
import hashRole from '../roles';
import getAddress from '../utils/getAddress';

function getRole(role: string) {
  return role.match(/^0x[\da-fA-F]+$/) ? role : hashRole(role);
}

use(function (chai: Chai.ChaiStatic) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chai.Assertion.addMethod('revertedMissingRole', function (this: any, subject: any, role: string) {
    return new chai.Assertion(this._obj).to.be.revertedWith(
      `AccessControl: account ${getAddress(subject).toLowerCase()} is missing role ${getRole(role)}`,
    );
  });
});

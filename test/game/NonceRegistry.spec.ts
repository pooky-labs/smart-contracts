import { faker } from '@faker-js/faker';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { utils } from 'ethers';
import range from 'lodash/range';
import { DEFAULT_ADMIN_ROLE, OPERATOR } from '../../lib/roles';
import getTestAccounts from '../../lib/testing/getTestAccounts';
import { expectMissingRole } from '../../lib/testing/roles';
import stackFixture from '../../lib/testing/stackFixture';
import { NonceRegistry, NonceRegistry__factory } from '../../typechain-types';

describe('NonceRegistry', () => {
  // Signers
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let player1: SignerWithAddress;

  // Contracts
  let NonceRegistry: NonceRegistry;

  let hash: string;

  beforeEach(async () => {
    ({ admin, operator, player1 } = await getTestAccounts());
    ({ NonceRegistry } = await loadFixture(stackFixture));
    hash = utils.solidityKeccak256(['string'], [faker.datatype.string()]);
  });

  describe('constructor', () => {
    it('should grant admin and operator roles to address in constructor', async () => {
      const deployed = await new NonceRegistry__factory().connect(admin).deploy([admin.address], [operator.address]);
      await deployed.deployed();
      expect(await deployed.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await deployed.hasRole(OPERATOR, operator.address)).to.be.true;
    });
  });

  describe('set', () => {
    it('should revert a non-operator tries to set a hash', async () => {
      await expectMissingRole(NonceRegistry.connect(player1).set(hash, true), player1, OPERATOR);
    });

    it('should allow operator to set a hash to true', async () => {
      await NonceRegistry.connect(operator).set(hash, true);
      expect(await NonceRegistry.has(hash)).to.be.true;
    });
  });

  describe('setBatch', () => {
    it('should revert a non-operator tries to set a hash', async () => {
      await expectMissingRole(NonceRegistry.connect(player1).setBatch([hash], [true]), player1, OPERATOR);
    });

    it('should allow operator to set multiple hashes to true', async () => {
      const hashes = range(20).map(() => utils.solidityKeccak256(['string'], [faker.datatype.string()]));
      const values = hashes.map(() => true);

      await NonceRegistry.connect(operator).setBatch(hashes, values);
      for (const hash of hashes) {
        expect(await NonceRegistry.has(hash)).to.be.true;
      }
    });
  });
});
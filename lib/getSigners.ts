import { ethers } from 'hardhat';

/**
 * Get the configured Hardhat signers mapped from indices to name.
 */
export default async function getSigners() {
  const [deployer, backendSigner, treasury, mod, player] = await ethers.getSigners();

  return {
    deployer,
    backendSigner,
    treasury,
    mod,
    player,
  };
}

import { ethers } from 'hardhat';

/**
 * Get the configured Hardhat signers mapped from indices to name.
 */
export default async function getTestAccounts() {
  const [deployer, admin, minter, game, backend, operator, seller, treasury, player1, player2, player3] =
    await ethers.getSigners();

  return {
    deployer,
    admin,
    minter,
    game,
    backend,
    operator,
    seller,
    treasury,
    player1,
    player2,
    player3,
  };
}

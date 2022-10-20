import { BallUpdatesStruct } from '../../typings/contracts/PookyGame';
import { BigNumberish, Signer, utils } from 'ethers';

/**
 * Sign the reward claim payload.
 * @param rewardNAT The amount of native currency to claim.
 * @param rewardPOK The amount of POK to claim.
 * @param ballUpdates The balls updates (PXP, level up).
 * @param ttl The data when the signature expires
 * @param nonce The signature nonce.
 * @param signer The ethers.js signer.
 */
export async function signRewardsClaim(
  rewardNAT: BigNumberish,
  rewardPOK: BigNumberish,
  ballUpdates: BallUpdatesStruct[],
  ttl: BigNumberish,
  nonce: BigNumberish,
  signer: Signer,
): Promise<string> {
  const message = utils.defaultAbiCoder.encode(
    ['uint256', 'uint256', 'tuple(uint256 tokenId, uint256 addPXP, bool shouldLevelUp)[]', 'uint256', 'uint256'],
    [rewardNAT, rewardPOK, ballUpdates, ttl, nonce],
  );
  const hash = utils.keccak256(message);
  return signer.signMessage(utils.arrayify(hash));
}

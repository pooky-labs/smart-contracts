import { BigNumberish, Signer, utils } from 'ethers';
import { RewardsDataStruct } from '../../typechain-types/contracts/game/Rewards';

/**
 * Sign the reward claim payload.
 * @param account The address of the user who is claiming the reward.
 * @param rewards The rewards object.
 * @param nonce The signature nonce.
 * @param data Arbitrary string to associate with the rewards.
 * @param signer The ethers.js signer.
 */
export async function signRewards(
  account: string,
  rewards: Partial<RewardsDataStruct>,
  nonce: BigNumberish,
  data: string,
  signer: Signer,
): Promise<[string, RewardsDataStruct]> {
  const fullRewards: RewardsDataStruct = {
    amountNAT: 0,
    amountPOK: 0,
    pxp: [],
    ...rewards,
  };

  const payload = utils.defaultAbiCoder.encode(
    [
      'address',
      'tuple(uint256 amountNAT, uint256 amountPOK, tuple(uint256 tokenId, uint256 amountPXP)[] pxp)',
      'uint256',
      'string',
    ],
    [account, fullRewards, nonce, data],
  );
  const hash = utils.keccak256(payload);
  const signature = await signer.signMessage(utils.arrayify(hash));
  return [signature, fullRewards];
}

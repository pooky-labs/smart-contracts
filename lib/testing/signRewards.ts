import { AbiCoder, Signer, getBytes, keccak256 } from 'ethers';
import { RewardsDataStruct } from '../../typechain-types/contracts/game/Rewards';

/**
 * Sign the reward claim payload.
 * @param account The address of the user who is claiming the reward.
 * @param rewards The rewards object.
 * @param data Arbitrary string to associate with the rewards.
 * @param signer The ethers.js signer.
 */
export async function signRewards(
  account: string,
  rewards: Partial<RewardsDataStruct>,
  data: string,
  signer: Signer,
): Promise<[string, RewardsDataStruct]> {
  const fullRewards: RewardsDataStruct = {
    amountNAT: 0,
    amountPOK: 0,
    pxp: [],
    pookyballs: [],
    nonces: [],
    ...rewards,
  };

  const payload = AbiCoder.defaultAbiCoder().encode(
    [
      'address',
      'tuple(uint256 amountNAT, uint256 amountPOK, tuple(uint256 tokenId, uint256 amountPXP)[] pxp, uint8[] pookyballs, bytes32[] nonces)',
      'string',
    ],
    [account, fullRewards, data],
  );
  const hash = keccak256(payload);
  const signature = await signer.signMessage(getBytes(hash));
  return [signature, fullRewards];
}

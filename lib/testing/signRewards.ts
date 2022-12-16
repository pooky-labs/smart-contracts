import { BigNumberish, Signer, utils } from 'ethers';

/**
 * Sign the reward claim payload.
 * @param account The address of the user who is claiming the reward.
 * @param amountNative The amount of native currency to claim.
 * @param amountPOK The amount of POK to claim.
 * @param tokenIds The token ids which will receive PXP.
 * @param tokenPXP The token PXP.
 * @param nonce The signature nonce.
 * @param signer The ethers.js signer.
 */
export async function signRewards(
  account: string,
  amountNative: BigNumberish,
  amountPOK: BigNumberish,
  tokenIds: BigNumberish[],
  tokenPXP: BigNumberish[],
  nonce: BigNumberish,
  signer: Signer,
): Promise<string> {
  const payload = utils.solidityPack(
    ['address', 'uint256', 'uint256', 'uint256[]', 'uint256[]', 'uint256'],
    [account, amountNative, amountPOK, tokenIds, tokenPXP, nonce],
  );
  const hash = utils.keccak256(payload);
  return signer.signMessage(utils.arrayify(hash));
}

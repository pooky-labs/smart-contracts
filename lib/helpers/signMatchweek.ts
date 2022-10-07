import { BallUpdatesStruct } from '../../typings/contracts/PookyGame';
import { BigNumberish, Signer, utils } from 'ethers';

/**
 * Sign the matchweek claim payload.
 * @param amount The amount of POK to claim.
 * @param ballUpdates The balls updates (PXP, level up).
 * @param ttl The data when the signature expires
 * @param nonce The signature nonce.
 * @param signer The ethers.js signer.
 */
export async function signMatchweek(
  amount: BigNumberish,
  ballUpdates: BallUpdatesStruct[],
  ttl: BigNumberish,
  nonce: BigNumberish,
  signer: Signer,
): Promise<string> {
  const message = utils.defaultAbiCoder.encode(
    ['uint256', 'tuple(uint256 ballId, uint256 addPxp, bool toLevelUp)[]', 'uint256', 'uint256'],
    [amount, ballUpdates, ttl, nonce],
  );
  const hash = utils.keccak256(message);
  return signer.signMessage(utils.arrayify(hash));
}

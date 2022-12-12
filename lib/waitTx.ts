import logger from './logger';
import { ContractReceipt } from '@ethersproject/contracts/src.ts';
import { ContractTransaction, utils } from 'ethers';

interface WaitTxOptions {
  confirmations?: number;
  log?: boolean;
}

/**
 * Wait for an {@see ContractTransaction}. This function allows to write the contract interactions more fluently.
 * @param tx The {@see ContractTransaction} to wait for.
 * @param confirmations The number of blocks to wait.
 * @param log If the transaction information should be printed.
 * @example
 *   const tx = await POK.grantRole(POOKY_CONTRACT, PookyMintEvent.address);
 *   await tx.wait();
 *
 *   Can be replaced by:
 *   await waitTx(POK.grantRole(POOKY_CONTRACT, PookyMintEvent.address));
 */
export default async function waitTx(
  tx: ContractTransaction | Promise<ContractTransaction>,
  { confirmations, log = true }: WaitTxOptions = {},
): Promise<ContractReceipt> {
  const waitedTx = await tx;

  if (log) {
    const args: unknown[] = ['Tx:', waitedTx.nonce, '- hash', waitedTx.hash];

    if (waitedTx.blockNumber) {
      args.push('in block', waitedTx.blockNumber);
    }

    logger.debug(...args);
  }

  const receipt = await waitedTx.wait(confirmations);

  if (log) {
    const fee = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
    const args: unknown[] = ['Tx:', waitedTx.nonce, '- total fees', utils.formatEther(fee), 'MATIC'];

    logger.debug(...args);
  }

  return receipt;
}

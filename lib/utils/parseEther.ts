import { BigNumber, BigNumberish, ethers } from 'ethers';

export default function parseEther(v: BigNumberish) {
  return ethers.utils.parseEther(BigNumber.from(v).toString());
}

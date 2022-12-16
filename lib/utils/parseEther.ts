import { BigNumber, BigNumberish, ethers, utils } from 'ethers';

export default function parseEther(v: BigNumberish) {
  if (typeof v === 'string') {
    return utils.parseEther(v);
  } else if (typeof v === 'number') {
    return utils.parseEther(v.toString());
  }

  return ethers.utils.parseEther(BigNumber.from(v).toString());
}

import PookyballLuxury from './PookyballLuxury';
import PookyballRarity from './PookyballRarity';
import { BigNumberish, BytesLike } from 'ethers';
import { ISettingsParam } from 'tslog/src/interfaces';

/**
 * Contract stack deployment configuration.
 */
export default interface Config {
  log?: ISettingsParam | false;

  state?: string;
  verify?: boolean;

  accounts: {
    tech: string;
    treasury: string;
    backend: string;
  };

  metadata: {
    baseURI: string;
    contractURI: string;
  };

  mint: {
    totalSupply: number;
    maxAccountsMints: number;
    templates: {
      rarity: PookyballRarity;
      luxury: PookyballLuxury;
      /** Over 10,000 tokens. */
      supply: number | null;
      price: BigNumberish;
    }[];
  };

  vrf: {
    coordinator: string;
    keyHash: BytesLike;
    subId: BigNumberish;
    minimumRequestConfirmations: number;
    gasLimit: BigNumberish;
  };
}

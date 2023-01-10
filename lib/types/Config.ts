import { BigNumberish, BytesLike } from 'ethers';
import { ISettingsParam } from 'tslog';
import PookyballLuxury from './PookyballLuxury';
import PookyballRarity from './PookyballRarity';

/**
 * Contract stack deployment configuration.
 */
export default interface Config {
  log?: ISettingsParam<unknown> | false;
  confirmations?: number;
  verify?: boolean;

  accounts: {
    admin: string;
    treasury: {
      primary: string;
      secondary: string;
      ingame: string;
    };

    backend: string;
    operators?: string[];
  };

  metadata: {
    baseURI: string;
    contractURI: string;
  };

  mint: {
    totalSupply: number;
    templates: {
      rarity: PookyballRarity;
      luxury: PookyballLuxury;
      /** Over a 10,000 tokens basis. */
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

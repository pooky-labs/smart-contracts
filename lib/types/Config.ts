import { BigNumberish, BytesLike } from 'ethers';
import { ISettingsParam } from 'tslog';
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

  tokens: {
    POK: string;
    Pookyball: string;
    Stickers: string;
  };

  metadata: {
    baseURI: string;
    contractURI: string;
  };

  templates: {
    rarity: PookyballRarity;
    price: bigint;
    supply: number;
  }[];

  vrf: {
    coordinator: string;
    keyHash: BytesLike;
    subId: BigNumberish;
    minimumRequestConfirmations: number;
    gasLimit: BigNumberish;
  };
}

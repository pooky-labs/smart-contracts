import { BigNumberish, BytesLike } from 'ethers';
import { ISettingsParam } from 'tslog';

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
    supply: {
      total: number;
      base: number;
      multiplier: number;
    };
    pricing: {
      base: BigNumberish;
      multiplier: number;
    };
  };

  vrf: {
    coordinator: string;
    keyHash: BytesLike;
    subId: BigNumberish;
    minimumRequestConfirmations: number;
    gasLimit: BigNumberish;
  };
}

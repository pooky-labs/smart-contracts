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
      discount: 1000; // over 10,000
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

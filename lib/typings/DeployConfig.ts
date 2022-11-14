import { BallLuxury, BallRarity } from './DataTypes';
import { BigNumberish, BytesLike } from 'ethers';
import { ISettingsParam } from 'tslog/src/interfaces';

/**
 * Contract stack deployment configuration.
 */
export default interface DeployConfig {
  log?: ISettingsParam | false;

  /** Deploy POKMock and PookyBallMock instead of POK and PookyBall contracts. */
  mocks?: boolean;
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
      rarity: BallRarity;
      luxury: BallLuxury;
      /** Over 10,000 tokens. */
      supply: number | null;
      price: BigNumberish;
    }[];
  };

  vrf: {
    coordinator: string;
    gasLimit: BigNumberish;
    minimumConfirmations: number;
    keyHash: BytesLike;
    subscriptionId: BigNumberish;
  };
}

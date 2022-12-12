import {
  POK,
  POK__factory,
  Pookyball,
  Pookyball__factory,
  PookyballGenesisMinter,
  PookyballGenesisMinter__factory,
  PookyGame,
  PookyGame__factory,
} from '../typings';
import { ZERO_ADDRESS } from './constants';
import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import get from 'lodash/get';
import merge from 'lodash/merge';
import set from 'lodash/set';
import { join } from 'path';
import YAML from 'yaml';

type ContractsStack = {
  POK: POK;
  Pookyball: Pookyball;
  PookyballGenesisMinter: PookyballGenesisMinter;
  PookyGame: PookyGame;
};

type Name = keyof ContractsStack;
type AddressBook = Record<Name, string>;
type StateData = Record<string, AddressBook>;

export default class State {
  private static readonly DEFAULT_STATE: StateData = {
    mumbai: {
      POK: ZERO_ADDRESS,
      Pookyball: ZERO_ADDRESS,
      PookyballGenesisMinter: ZERO_ADDRESS,
      PookyGame: ZERO_ADDRESS,
    },
    mainnet: {
      POK: ZERO_ADDRESS,
      Pookyball: ZERO_ADDRESS,
      PookyballGenesisMinter: ZERO_ADDRESS,
      PookyGame: ZERO_ADDRESS,
    },
  };
  private readonly data: StateData;

  constructor(private readonly network: string, readonly path = join(process.cwd(), 'state.yml')) {
    if (!existsSync(path)) {
      this.data = State.DEFAULT_STATE;
      this.write();
    } else {
      this.data = merge(State.DEFAULT_STATE, YAML.parse(readFileSync(this.path, { encoding: 'utf8' })));
    }
  }

  write() {
    writeFileSync(this.path, YAML.stringify(this.data));
  }

  setAddress(name: Name, address: string) {
    set(this.data, `${this.network}.${name}`, address);
    this.write();
  }

  getAddress(name: Name): string {
    const found = get(this.data, [this.network, name]);

    if (!found) {
      throw new Error(`Cannot find ${this.network}.${name} address in the state`);
    }

    return found;
  }

  connect<N extends keyof ContractsStack, C = ContractsStack[N]>(name: N, signerOrProvider: Signer | Provider): C {
    const address = this.getAddress(name);

    switch (name) {
      case 'POK':
        return POK__factory.connect(address, signerOrProvider) as C;
      case 'Pookyball':
        return Pookyball__factory.connect(address, signerOrProvider) as C;
      case 'PookyballGenesisMinter':
        return PookyballGenesisMinter__factory.connect(address, signerOrProvider) as C;
      case 'PookyGame':
        return PookyGame__factory.connect(address, signerOrProvider) as C;
      default:
        throw new Error(`Unknown contract "${name}")`);
    }
  }
}

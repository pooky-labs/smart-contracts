import State from '../lib/state';
import parseEther from '../lib/utils/parseEther';
import waitTx from '../lib/waitTx';
import { POKMock__factory } from '../typings';
import { task } from 'hardhat/config';
import prompts from 'prompts';

task('mintPOK', 'Mint POK to specific address')
  .addOptionalPositionalParam('amount', 'POK amount to mint in plain POK (not in wei)')
  .addOptionalPositionalParam('recipient', 'The address which will receive the POK')
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const { amount, recipient } = await prompts([
      {
        name: 'amount',
        type: args.amount ? false : 'text',
        message: 'Enter amount in plain POK',
      },
      {
        name: 'recipient',
        type: args.recipient ? false : 'text',
        message: 'Choose recipient',
        initial: signer.address,
      },
    ]);

    const state = new State(hre.network.name);
    const POKMock = POKMock__factory.connect(state.getAddress('POK'), signer);

    await waitTx(POKMock.mock_mint(recipient, parseEther(amount)));
  });

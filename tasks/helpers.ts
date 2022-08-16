import { BigNumber, utils, Wallet } from "ethers";

// export interface Sign {
//     _v: BigNumber,
//     _r: string,
//     _s: string
// }

export interface Sign {
    _v: BigNumber,
    _r: BigNumber,
    _s: BigNumber
}

function toHex(x:BigNumber) {
    let s = x.toHexString().substr(2);
    while(s.length < 64) s = '0' + s;
    s = '0x' + s;
    return s;
}

export interface BallUpdates {
    ballId: BigNumber,
    addPxp: BigNumber;
    toLevelUp: Boolean;
}

export async function signMatchweekClaimMessage(pookAmount:BigNumber, ballUpdates:BallUpdates[], ttl:BigNumber, signer:Wallet) : Promise<Sign> {
    let message = utils.defaultAbiCoder.encode( ["uint256", "tuple(uint256 ballId, uint256 addPxp, bool toLevelUp)[]", "uint256"], [pookAmount, ballUpdates, ttl] );
    let hashedMessage = utils.keccak256(message);

    // https://stackoverflow.com/questions/69576099/cant-validate-authenticated-message-with-ecdsa-recover
    let signedMessage = await signer.signMessage(utils.arrayify(hashedMessage));

    return {
        _v: BigNumber.from('0x' + signedMessage.substr(130,2)),
        _s: BigNumber.from('0x' + signedMessage.substr(66, 64)),
        _r: BigNumber.from(signedMessage.substr(0, 66))
        // _s: toHex(BigNumber.from('0x' + signedMessage.substr(66, 64))),
        // _r: toHex(BigNumber.from(signedMessage.substr(0, 66)))
    }
}

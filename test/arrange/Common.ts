import chalk from "chalk";
import { LogIf } from "../helper";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, constants as ethersConstants } from "ethers";

export function ArrangeFactory<T>() {
  return async function (summary: string,
    SET: T,
    owner: SignerWithAddress,
    log: boolean,
    f: (SET: T, owner: SignerWithAddress, logger: any, ...args: Array<any>) => Promise<void>,
    ...args: Array<any>) {
    const logger = LogIf(log);
    const boundaryLogger = LogIf(log, true);

    console.log(chalk.cyan(chalk.bold(`SETUP summary \n\t${summary}\n`)));
    boundaryLogger("\t\tSETUP LOG BEGIN");
    await f(SET, owner, logger, ...args);
    boundaryLogger("\t\tSETUP LOG END");
  };
}

export interface ConstantSet {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000";
  ONE: BigNumber;
  TEN: BigNumber;
  HUNDRED: BigNumber;
  THOUSAND: BigNumber;
  MILLION: BigNumber;
  FINNEY: BigNumber;
  MAX: BigNumber;
}

export const CONSTANTS: ConstantSet = {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
  ONE: BigNumber.from("10").pow("18"),
  TEN: BigNumber.from("10").pow("19"),
  HUNDRED: BigNumber.from("10").pow("20"),
  THOUSAND: BigNumber.from("10").pow("21"),
  MILLION: BigNumber.from("10").pow("24"),
  FINNEY: BigNumber.from("10").pow("15"),
  MAX: ethersConstants.MaxUint256,
};

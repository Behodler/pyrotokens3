import chalk from "chalk";
import { LogIf } from "../helper";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export function ArrangeFactory<T>() {
  return async function (summary: string,
    SET: T,
    owner: SignerWithAddress,
    log: boolean,
    f: (SET: T, owner: SignerWithAddress, logger: any, ...args: Array<any>) => Promise<void>,
    ...args: Array<any>) {
    const logger = LogIf(log);
    const boundaryLogger = LogIf(log, true);

    console.log(chalk.cyan(chalk.bold(`SETUP summary n\t${summary}\n`)));
    boundaryLogger("\t\tSETUP LOG BEGIN");
    await f(SET, owner, logger, ...args);
    boundaryLogger("\t\tSETUP LOG END");
  };
}

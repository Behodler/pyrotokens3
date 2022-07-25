import { TestSet } from "../V2Migrator.test";
import { ArrangeFactory } from "./Common";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
export const Arrange = ArrangeFactory<TestSet>();

export async function t1Setup(
  SET: TestSet,
  owner: SignerWithAddress,
  logger: any,
  ...args: Array<any>
) {
    
}

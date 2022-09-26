import { ethers } from "hardhat";
import { TestSet } from "../Rebase.test";
import * as TypeChainTypes from "../../typechain-types";
import { expect } from "chai";
import { executionResult, queryChain, LogIf } from "../helper";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ArrangeFactory, CONSTANTS } from "./Common";

export const Arrange = ArrangeFactory<TestSet>()

export async function t2Setup(SET: TestSet, owner: SignerWithAddress, logger: any) {
  await SET.BaseTokens.regularToken1.mint(CONSTANTS.TEN)

  await SET.BaseTokens.regularToken1.approve(SET.PyroTokens.pyroRegular1.address, CONSTANTS.MAX)

  await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.TEN)
}

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

export async function t4Setup(SET: TestSet, owner: SignerWithAddress, logger: any) {
  await SET.BaseTokens.regularToken1.mint(CONSTANTS.TEN)

  await SET.BaseTokens.regularToken1.approve(SET.PyroTokens.pyroRegular1.address, CONSTANTS.MAX)

  await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.TEN)
  await SET.RebaseWrapper.convertFromPyro(owner.address, CONSTANTS.ONE.mul(7))
}


export async function t6Setup(SET: TestSet, owner: SignerWithAddress, logger: any) {
  await SET.BaseTokens.regularToken1.mint(CONSTANTS.TEN)

  await SET.BaseTokens.regularToken1.approve(SET.PyroTokens.pyroRegular1.address, CONSTANTS.MAX)

  await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.ONE.mul(3))

  await SET.PyroTokens.pyroRegular1.burn(CONSTANTS.ONE.mul(3).div(2))

  await SET.RebaseWrapper.convertFromPyro(owner.address, CONSTANTS.ONE.mul(3).div(2))

  const rebaseBalance = await SET.RebaseWrapper.balanceOf(owner.address)
  expect(rebaseBalance).to.equal(CONSTANTS.ONE.mul(3))

  const pyroBalance = (await SET.PyroTokens.pyroRegular1.balanceOf(owner.address)).toString()
  expect(pyroBalance).to.equal("0")


  const redeemRate = await SET.PyroTokens.pyroRegular1.redeemRate()
  expect(redeemRate).to.equal(CONSTANTS.ONE.mul(2))
}





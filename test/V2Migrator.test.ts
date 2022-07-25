import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractFactory,
  constants as ethersConstants,
} from "ethers";
import { ethers } from "hardhat";
import * as TypeChainTypes from "../typechain-types";
import { burnEyeSnufferCapSol } from "../typechain-types/snufferCaps";
import { Arrange, t1Setup } from "./arrange/V2Migrator";

import { deploy, executionResult, numberClose, queryChain } from "./helper";

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
export interface TestSet {
  BaseToken: TypeChainTypes.BaseToken;
  PyroToken3: TypeChainTypes.PyroToken;
  PyroToken2: TypeChainTypes.PyroToken2;
  LiquidityReceiver: TypeChainTypes.LiquidityReceiver;
  lachesis: TypeChainTypes.Lachesis;
  CONSTANTS: ConstantSet;
}

describe("V2 Migrator test", async function () {
  let owner: SignerWithAddress, secondPerson: SignerWithAddress;
  let SET = {} as TestSet;
  SET.CONSTANTS = CONSTANTS;
  beforeEach(async function () {
    [owner, secondPerson] = await ethers.getSigners();

    var Lachesis = await ethers.getContractFactory("Lachesis");
    SET.lachesis = await deploy<TypeChainTypes.Lachesis>(Lachesis);
    const liquidityReceiverFactory = (await ethers.getContractFactory(
      "LiquidityReceiver"
    )) as TypeChainTypes.LiquidityReceiver__factory;

    SET.LiquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(
      liquidityReceiverFactory,
      SET.lachesis.address
    );

    const BaseTokenFactory = (await ethers.getContractFactory(
      "BaseToken"
    )) as TypeChainTypes.BaseToken__factory;
    SET.BaseToken = await deploy<TypeChainTypes.BaseToken>(
      BaseTokenFactory,
      "base",
      "BAS",
      0
    );

    await SET.lachesis.measure(SET.BaseToken.address, true, false);

    await SET.LiquidityReceiver.registerPyroToken(
      SET.BaseToken.address,
      "PyroBASE",
      "PBAS",
      18
    );
    SET.PyroToken3 = (await ethers.getContractAt(
      "PyroToken",
      await SET.LiquidityReceiver.getPyroToken(SET.BaseToken.address)
    )) as TypeChainTypes.PyroToken;

    const pyroToken2Factory = (await ethers.getContractFactory(
      "PyroToken2"
    )) as TypeChainTypes.PyroToken2__factory;

    SET.PyroToken2 = await deploy<TypeChainTypes.PyroToken2>(
      pyroToken2Factory,
      SET.BaseToken.address
    );
  });

  it("t-1. migrates whole balance", async function () {
    //ARRANGE
    await Arrange(
      "Mint P2 pyro tokens, instantiate P3 and register both with lachesis.",
      SET,
      owner,
      false,
      t1Setup
    );
    throw "not implemented";
  });

  it("t-2. pyrotoken3 prediction mismatch fails", async function () {
    throw "not implemented";
  });

  it("t-3. attempts to grief by unsettling with transfers to migrator fails", async function () {
    throw "not implemented";
  });

  it("t-4. migrate many reverts all if one fails", async function () {
    throw "not implemented";
  });

  it("t-5. migrate many succeeds", async function () {
    throw "not implemented";
  });

  it("t-6. attempting with tokens that aren't lachesis validated fails", async function () {
    throw "not implemented";
  });
});

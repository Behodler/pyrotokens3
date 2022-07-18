import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

import * as TypeChainTypes from "../typechain-types";
import { deploy } from "./helper";

interface BaseTokenSet {
  regularToken1: TypeChainTypes.BaseToken;
  regularToken2: TypeChainTypes.BaseToken;

  invalidToken1: TypeChainTypes.BaseToken;
  invalidToken2: TypeChainTypes.BaseToken;
  invalidToken3: TypeChainTypes.BaseToken;
  EYE: TypeChainTypes.BaseToken;
}

interface ConstantSet {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000";
}
const CONSTANTS: ConstantSet = {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
};
interface TestSet {
  BaseTokens: BaseTokenSet;
  lachesis: TypeChainTypes.Lachesis;
  liquidityReceiver: TypeChainTypes.LiquidityReceiver;
  burnEYESnufferCap: TypeChainTypes.SnufferCap;
  loanOfficer: TypeChainTypes.SimpleLoanOfficer;
  snufferCap: TypeChainTypes.SnufferCap;
  LiquidityReceiverFactory: TypeChainTypes.LiquidityReceiver__factory;
  UniswapRouter: TypeChainTypes.UniswapV2Router02;
  CONSTANTS: ConstantSet;
}

describe("PyroTokens", async function () {
  let owner: any, secondPerson: any;
  let SET = {} as TestSet;
  SET.CONSTANTS = CONSTANTS;
  beforeEach(async function () {
    [owner, secondPerson] = await ethers.getSigners();
    let BaseTokens = {} as BaseTokenSet;
    var BaseToken = await ethers.getContractFactory("BaseToken");
    BaseTokens.regularToken1 = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "Base1",
      "BASE",
      0
    );
    BaseTokens.regularToken2 = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "Base2",
      "BASE",
      0
    );

    BaseTokens.invalidToken1 = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "Base2",
      "BASE",
      0
    );
    BaseTokens.invalidToken2 = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "Base3",
      "BASE",
      10
    );
    BaseTokens.invalidToken3 = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "Base3",
      "BASE",
      0
    );
    BaseTokens.EYE = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "EYE",
      "EYE",
      0
    );

    SET.BaseTokens = BaseTokens;

    var Lachesis = await ethers.getContractFactory("Lachesis");
    SET.lachesis = await deploy<TypeChainTypes.Lachesis>(Lachesis);
    await SET.lachesis.measure(
      SET.BaseTokens.regularToken1.address,
      true,
      false
    );
    await SET.lachesis.measure(
      SET.BaseTokens.regularToken2.address,
      true,
      false
    );

    await SET.lachesis.measure(
      SET.BaseTokens.invalidToken1.address,
      false,
      false
    );
    await SET.lachesis.measure(
      SET.BaseTokens.invalidToken2.address,
      true,
      true
    );
    await SET.lachesis.measure(
      SET.BaseTokens.invalidToken3.address,
      false,
      true
    );

    SET.LiquidityReceiverFactory = (await ethers.getContractFactory(
      "LiquidityReceiver"
    )) as TypeChainTypes.LiquidityReceiver__factory;

    SET.liquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(
      SET.LiquidityReceiverFactory,
      SET.lachesis.address
    );

    const BurnEYESnufferCap = await ethers.getContractFactory(
      "BurnEYESnufferCap"
    );

    SET.snufferCap = await deploy<TypeChainTypes.SnufferCap>(
      BurnEYESnufferCap,
      SET.BaseTokens.EYE.address,
      SET.liquidityReceiver.address
    );

    await SET.liquidityReceiver.setSnufferCap(SET.snufferCap.address);

    const LoanOfficer = await ethers.getContractFactory("SimpleLoanOfficer");
    SET.loanOfficer = await deploy<TypeChainTypes.SimpleLoanOfficer>(
      LoanOfficer
    );

    await SET.liquidityReceiver.setDefaultLoanOfficer(SET.loanOfficer.address);

    await SET.liquidityReceiver.registerPyroToken(
      SET.BaseTokens.regularToken1.address,
      "PyroToken1",
      "PYRO"
    );

    await SET.liquidityReceiver.registerPyroToken(
      SET.BaseTokens.regularToken2.address,
      "PyroToken2",
      "PYRO"
    );
    //Order of instantiation
    //factory and weth (bring in from limbo)->router
    const wethFactory = await ethers.getContractFactory("WETH10");
    const weth = await deploy<TypeChainTypes.WETH10>(wethFactory);

    const unifactoryFactory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const unifactory = await deploy<TypeChainTypes.UniswapV2Factory>(
      unifactoryFactory,
      owner.address
    );

    const UniswapRouterFactory = await ethers.getContractFactory(
      "UniswapV2Router02"
    );
    SET.UniswapRouter = await deploy<TypeChainTypes.UniswapV2Router02>(
      UniswapRouterFactory,
      unifactory.address,
      weth.address
    );
  });

  it(`t-${0}. Swap via UniswapV2 router succeeds`, async function () {
    throw "not implemented.";
  });

  for (let i = 0; i < 2; i++) {
    let toggleValue: boolean = i > 0;
    it(`t-${
      i + 1
    }. toggle pull pending fee revenue behaves correctly [${toggleValue
      .toString()
      .toUpperCase()}]`, async function () {
      throw "not implemented.";
    });
  }

  it("t-4. New Liquidity Receiver", async function () {
    throw "not implemented.";
  });

  it("t-5. mint leaves redeem rate unchanged", async function () {
    throw "not implemented.";
  });

  it("t-6. redeem from adjusts approval and fails for not approved.", async function () {
    throw "not implemented.";
  });

  it("t-7. Redeem adjusts redeem rate", async function () {
    throw "not implemented.";
  });

  it("t-8. set debt obligation fails when pyrostake too low.", async function () {
    throw "not implemented.";
  });

  it("t-9. set debt obligation transfers from holder when stake grows", async function () {
    throw "not implemented.";
  });

  it("t-10. set debt obligation transfers from pyro to holder stake shrinks", async function () {
    throw "not implemented.";
  });

  it("t-11. set debt obligation fails if user has insufficient balance to meet stake", async function () {
    throw "not implemented.";
  });

  it("t-12. Set debt obligation succeeds", async function () {
    throw "not implemented.";
  });

  it("t-13. calculate transfer fee", async function () {
    throw "not implemented.";
  });

  it("t-14. calculate redemption fee", async function () {
    throw "not implemented.";
  });
});

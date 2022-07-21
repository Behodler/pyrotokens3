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
import { Announce, t0Setup, t1Setup } from "./arrange/pyroToken";
import { deploy, executionResult, queryChain } from "./helper";

interface BaseTokenSet {
  regularToken1: TypeChainTypes.BaseToken;
  regularToken2: TypeChainTypes.BaseToken;

  invalidToken1: TypeChainTypes.BaseToken;
  invalidToken2: TypeChainTypes.BaseToken;
  invalidToken3: TypeChainTypes.BaseToken;
  EYE: TypeChainTypes.BaseToken;
}

interface PyroTokens {
  pyroRegular1: TypeChainTypes.PyroToken;
  pyroRegular2: TypeChainTypes.PyroToken;
}

export interface ConstantSet {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000";
  ONE: BigNumber;
  TEN: BigNumber;
  HUNDRED: BigNumber;
  THOUSAND: BigNumber;
  FINNEY: BigNumber;
  MAX: BigNumber;
}
interface Uniswap {
  router: TypeChainTypes.UniswapV2Router02;
  factory: TypeChainTypes.UniswapV2Factory;
}

export const CONSTANTS: ConstantSet = {
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
  ONE: BigNumber.from("10").pow("18"),
  TEN: BigNumber.from("10").pow("19"),
  HUNDRED: BigNumber.from("10").pow("20"),
  THOUSAND: BigNumber.from("10").pow("21"),
  FINNEY: BigNumber.from("10").pow("15"),
  MAX: ethersConstants.MaxUint256,
};
export interface TestSet {
  BaseTokens: BaseTokenSet;
  lachesis: TypeChainTypes.Lachesis;
  liquidityReceiver: TypeChainTypes.LiquidityReceiver;
  burnEYESnufferCap: TypeChainTypes.SnufferCap;
  loanOfficer: TypeChainTypes.SimpleLoanOfficer;
  snufferCap: TypeChainTypes.SnufferCap;
  LiquidityReceiverFactory: TypeChainTypes.LiquidityReceiver__factory;
  CONSTANTS: ConstantSet;
  Uniswap: Uniswap;
  PyroTokens: PyroTokens;
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

    const pyroTokenFactory = await ethers.getContractFactory("PyroToken");
    const pyroRegularAddress1 = await SET.liquidityReceiver.getPyroToken(
      SET.BaseTokens.regularToken1.address
    );
    const pyroRegularAddress2 = await SET.liquidityReceiver.getPyroToken(
      SET.BaseTokens.regularToken1.address
    );
    const pyroRegular1 = (await pyroTokenFactory.attach(
      pyroRegularAddress1
    )) as TypeChainTypes.PyroToken;
    const pyroRegular2 = (await pyroTokenFactory.attach(
      pyroRegularAddress2
    )) as TypeChainTypes.PyroToken;

    SET.PyroTokens = {
      pyroRegular1,
      pyroRegular2,
    };
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
    const router = await deploy<TypeChainTypes.UniswapV2Router02>(
      UniswapRouterFactory,
      unifactory.address,
      weth.address
    );

    SET.Uniswap = { factory: unifactory, router };
  });

  it(`t-0. transferFrom via UniswapV2 router succeeds`, async function () {
    //ARRANGE
    await Announce(
      "create a UniswapV2 pair for <regular,pyro> and mint LP tokens.",
      SET,
      owner,
      false,
      t0Setup
    );

    //ACT: trade a pyrotoken for a regular and vice versa using the router
    //regular->pyro
    const pyroBalanceOfPairBefore = BigNumber.from("199800000000000000000");
    let result = await executionResult(
      SET.Uniswap.router.swapTokensForExactTokens(
        "6713540621865596791",
        "8950721752115480337",
        [
          SET.BaseTokens.regularToken1.address,
          SET.PyroTokens.pyroRegular1.address,
        ],
        owner.address,
        CONSTANTS.MAX
      )
    );
    const balanceAfter = await SET.PyroTokens.pyroRegular1.balanceOf(
      SET.Uniswap.factory.getPair(
        SET.BaseTokens.regularToken1.address,
        SET.PyroTokens.pyroRegular1.address
      )
    );

    //ASSERT: transfer succeeds
    await expect(result.success).to.equal(false);

    expect(result.error.toString()).to.not.equal(
      "Error: VM Exception while processing transaction: reverted with reason string 'TransferHelper: TRANSFER_FROM_FAILED'"
    );
  });

  for (let i = 0; i < 2; i++) {
    let toggleValue: boolean = i > 0;
    it(`t-${
      i + 1
    } toggle pull pending fee revenue behaves correctly [${toggleValue
      .toString()
      .toUpperCase()}]`, async function () {
      //ARRANGE
      await Announce(
        `set pull pending fee, tranfer base tokens to liquidity receiver and mint, observing redeem rate change`,
        SET,
        owner,
        false,
        t1Setup,
        toggleValue
      );

      //ACT
      // mint pyroToken
      const redeemRateBefore = await SET.PyroTokens.pyroRegular1.redeemRate();
      await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.HUNDRED);

      //ASSERT
      const redeemRateAfter = await SET.PyroTokens.pyroRegular1.redeemRate();
      if (toggleValue) {
        expect(redeemRateAfter.gt(redeemRateBefore)).to.be.true;
      } else {
        expect(redeemRateAfter.toString()).to.equal(
          redeemRateBefore.toString()
        );
      }
    });
  }

  it("t-3. New Liquidity Receiver", async function () {
    //Arrange
    const newLiquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(SET.LiquidityReceiverFactory,SET.lachesis.address)

    //ACT
    await SET.liquidityReceiver.transferPyroTokenToNewReceiver(SET.PyroTokens.pyroRegular1.address, newLiquidityReceiver.address)
    
    //ASSERT
    const config = await SET.PyroTokens.pyroRegular1.config()
    expect (config[0]).to.equal(newLiquidityReceiver.address)
  });

  it("t-4. mint leaves redeem rate unchanged", async function () {
    throw "not implemented.";
  });

  it("t-5. redeem from adjusts approval and fails for not approved.", async function () {
    throw "not implemented.";
  });

  it("t-6. Redeem adjusts redeem rate", async function () {
    throw "not implemented.";
  });

  it("t-7. set debt obligation fails when pyrostake too low.", async function () {
    throw "not implemented.";
  });

  it("t-8. set debt obligation transfers from holder when stake grows", async function () {
    throw "not implemented.";
  });

  it("t-9. set debt obligation transfers from pyro to holder stake shrinks", async function () {
    throw "not implemented.";
  });

  it("t-10. set debt obligation fails if user has insufficient balance to meet stake", async function () {
    throw "not implemented.";
  });

  it("t-11. Set debt obligation succeeds", async function () {
    throw "not implemented.";
  });

  it("t-12. calculate transfer fee", async function () {
    throw "not implemented.";
  });

  it("t-13. calculate redemption fee", async function () {
    throw "not implemented.";
  });
});

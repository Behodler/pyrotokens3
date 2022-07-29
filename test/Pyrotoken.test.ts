import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
} from "ethers";
import { ethers } from "hardhat";
import * as TypeChainTypes from "../typechain-types";
import { burnEyeSnufferCapSol } from "../typechain-types/snufferCaps";
import { CONSTANTS, ConstantSet } from "./arrange/Common";
import {
  Arrange,
  t0Setup,
  t10Setup,
  t1Setup,
  t7Setup,
  t9Setup,
} from "./arrange/pyroToken";
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
interface Uniswap {
  router: TypeChainTypes.UniswapV2Router02;
  factory: TypeChainTypes.UniswapV2Factory;
}


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
  let owner: SignerWithAddress, secondPerson: SignerWithAddress;
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
      "PYRO",
      18
    );

    await SET.liquidityReceiver.registerPyroToken(
      SET.BaseTokens.regularToken2.address,
      "PyroToken2",
      "PYRO",
      18
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

    const snufferCapFactory = await ethers.getContractFactory(
      "BurnEYESnufferCap"
    );
    SET.snufferCap = await deploy<TypeChainTypes.BurnEYESnufferCap>(
      snufferCapFactory,
      SET.BaseTokens.EYE.address,
      SET.liquidityReceiver.address
    );
    await SET.liquidityReceiver.setSnufferCap(SET.snufferCap.address);
  });

  it(`t-0. transferFrom via UniswapV2 router succeeds`, async function () {
    //ARRANGE
    await Arrange(
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
      await Arrange(
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
    const newLiquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(
      SET.LiquidityReceiverFactory,
      SET.lachesis.address
    );

    //ACT
    await SET.liquidityReceiver.transferPyroTokenToNewReceiver(
      SET.PyroTokens.pyroRegular1.address,
      newLiquidityReceiver.address
    );

    //ASSERT
    const config = await SET.PyroTokens.pyroRegular1.config();
    expect(config[0]).to.equal(newLiquidityReceiver.address);
  });

  it("t-4. mint leaves redeem rate unchanged", async function () {
    const redeemRateBefore = await SET.PyroTokens.pyroRegular1.redeemRate();

    //ARRANGE
    await SET.BaseTokens.regularToken1.mint(CONSTANTS.TEN);
    await SET.BaseTokens.regularToken1.approve(
      SET.PyroTokens.pyroRegular1.address,
      CONSTANTS.MAX
    );

    //ACT
    await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.TEN);
    await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.TEN);

    //ASSERT
    const redeemRateAfter = await SET.PyroTokens.pyroRegular1.redeemRate();
    expect(redeemRateAfter).to.equal(redeemRateBefore);
  });

  it("t-5. redeem from adjusts approval and fails for not approved.", async function () {
    //ASSUMPTIONS
    const approvalBefore = await SET.PyroTokens.pyroRegular1.allowance(
      secondPerson.address,
      owner.address
    );
    expect(approvalBefore.toNumber()).to.equal(0);

    //ARRANGE
    await SET.BaseTokens.regularToken1
      .connect(secondPerson)
      .mint(CONSTANTS.HUNDRED);

    await SET.BaseTokens.regularToken1
      .connect(secondPerson)
      .approve(SET.PyroTokens.pyroRegular1.address, CONSTANTS.MAX);

    await SET.PyroTokens.pyroRegular1
      .connect(secondPerson)
      .mint(secondPerson.address, CONSTANTS.TEN.mul(4).add(CONSTANTS.ONE));

    await SET.PyroTokens.pyroRegular1
      .connect(secondPerson)
      .approve(owner.address, CONSTANTS.TEN.mul(4));

    const balanceOfSecond = await SET.PyroTokens.pyroRegular1.balanceOf(
      secondPerson.address
    );
    expect(balanceOfSecond.toString()).to.not.equal("0");

    //ACT
    await SET.PyroTokens.pyroRegular1.redeemFrom(
      secondPerson.address,
      owner.address,
      balanceOfSecond.sub(CONSTANTS.ONE)
    );

    //ASSERT
    await expect(
      SET.PyroTokens.pyroRegular1.redeemFrom(
        secondPerson.address,
        owner.address,
        CONSTANTS.ONE
      )
    ).to.be.revertedWith("AllowanceExceeded(0, 1000000000000000000)");
  });

  it("t-6. Redeem adjusts redeem rate", async function () {
    //ARRANGE
    await SET.BaseTokens.regularToken1.approve(
      SET.PyroTokens.pyroRegular1.address,
      CONSTANTS.MAX
    );
    await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.HUNDRED);
    const redeemRateBefore = await SET.PyroTokens.pyroRegular1.redeemRate();

    //ACT
    await SET.PyroTokens.pyroRegular1.redeem(owner.address, CONSTANTS.ONE);

    //ASSERT
    const redeemRateAfter = await SET.PyroTokens.pyroRegular1.redeemRate();

    expect(redeemRateAfter.gt(redeemRateBefore)).to.be.true;
  });

  it("t-7. set debt obligation fails when pyrostake too low.", async function () {
    //ARRANGE
    await Arrange(
      "Mint pyrotokens for both owner and second Person. Push redeem rate above 1",
      SET,
      owner,
      false,
      t7Setup,
      secondPerson
    );

    const redeemRate = await SET.PyroTokens.pyroRegular1.redeemRate();

    const baseToken = SET.BaseTokens.regularToken1;
    const pyroToken = SET.PyroTokens.pyroRegular1;
    const loanOfficer = SET.loanOfficer;

    const pyroBalance = await pyroToken.balanceOf(owner.address);
    const maxBorrow = pyroBalance.mul(redeemRate).div(CONSTANTS.ONE);
    //ACT
    //setObligation to max passes
    await loanOfficer.setObligationFor(
      pyroToken.address,
      maxBorrow,
      pyroBalance
    );
    await loanOfficer.setObligationFor(
      pyroToken.address,
      maxBorrow.div(2),
      pyroBalance
    );
    //ASSERT
    //borrow more than max fails
    // const overBorrow = maxBorrow.add(CONSTANTS.ONE)

    let expectedMinPyroStake = maxBorrow
      .add(CONSTANTS.ONE)
      .mul(CONSTANTS.ONE)
      .div(redeemRate);
    await expect(
      loanOfficer.setObligationFor(
        pyroToken.address,
        maxBorrow.add(CONSTANTS.ONE),
        pyroBalance
      )
    ).to.be.revertedWith(
      `UnsustainablePyroLoan(${pyroBalance}, ${expectedMinPyroStake})`
    );
  });

  it("t-8. set debt obligation transfers from holder when stake grows", async function () {
    await Arrange(
      "Mint pyrotokens for both owner and second Person. Push redeem rate above 1",
      SET,
      owner,
      false,
      t7Setup,
      secondPerson
    );

    const pyroBalanceBefore = await SET.PyroTokens.pyroRegular1.balanceOf(
      owner.address
    );
    const baseBalanceBefore = await SET.BaseTokens.regularToken1.balanceOf(
      owner.address
    );

    //ACT
    //increase stake and borrow some
    await SET.loanOfficer.setObligationFor(
      SET.PyroTokens.pyroRegular1.address,
      CONSTANTS.ONE.mul(5),
      CONSTANTS.TEN
    );

    //ASSERT
    const pyroBalanceAfter = await SET.PyroTokens.pyroRegular1.balanceOf(
      owner.address
    );
    const baseBalanceAfter = await SET.BaseTokens.regularToken1.balanceOf(
      owner.address
    );

    const deltaPyro = pyroBalanceBefore.sub(pyroBalanceAfter).toString();
    const deltaBase = baseBalanceAfter.sub(baseBalanceBefore).toString();

    expect(deltaBase).to.equal(CONSTANTS.ONE.mul(5));
    expect(deltaPyro).to.equal(CONSTANTS.TEN);
  });

  it("t-9. set debt obligation transfers from pyro to holder stake shrinks", async function () {
    await Arrange(
      "Mint pyrotokens for both owner and second Person. Borrow some base token",
      SET,
      owner,
      false,
      t9Setup,
      secondPerson
    );

    const pyroBalanceBefore = await SET.PyroTokens.pyroRegular1.balanceOf(
      owner.address
    );
    const baseBalanceBefore = await SET.BaseTokens.regularToken1.balanceOf(
      owner.address
    );

    //ACT
    //increase stake and borrow some
    await SET.loanOfficer.setObligationFor(
      SET.PyroTokens.pyroRegular1.address,
      CONSTANTS.ONE,
      CONSTANTS.ONE
    );

    //ASSERT
    const pyroBalanceAfter = await SET.PyroTokens.pyroRegular1.balanceOf(
      owner.address
    );
    const baseBalanceAfter = await SET.BaseTokens.regularToken1.balanceOf(
      owner.address
    );

    const deltaPyro = pyroBalanceAfter.sub(pyroBalanceBefore).toString(); //expect an increase
    const deltaBase = baseBalanceBefore.sub(baseBalanceAfter).toString(); //expect a decrease

    expect(deltaBase).to.equal(CONSTANTS.ONE.mul(9));
    expect(deltaPyro).to.equal(CONSTANTS.ONE.mul(9));
  });

  it("t-10. set debt obligation fails if user has insufficient balance to meet stake", async function () {
    await Arrange(
      "Mint 10 pyrotokens and stake them all",
      SET,
      owner,
      false,
      t10Setup,
      secondPerson
    );

    //ASSERT
    console.log(await SET.PyroTokens.pyroRegular1.balanceOf(owner.address));
    const tooMuch = CONSTANTS.TEN.add(CONSTANTS.ONE);
    await expect(
      SET.loanOfficer.setObligationFor(
        SET.PyroTokens.pyroRegular1.address,
        CONSTANTS.TEN,
        tooMuch
      )
    ).to.be.revertedWith(`StakeFailedInsufficientBalance(0, ${CONSTANTS.ONE})`);
  });

  it("t-11. Set debt obligation succeeds, leaves redeem rate unchanged", async function () {
    await Arrange(
      "Mint 30 pyrotokens, 10 for owner and 20 for someone else, stake none",
      SET,
      owner,
      false,
      t10Setup,
      secondPerson
    );

    const redeemRateInitial = await SET.PyroTokens.pyroRegular1.redeemRate();

    //ACT
    //STAKE MULTIPLE TIMES

    await SET.loanOfficer.setObligationFor(
      SET.PyroTokens.pyroRegular1.address,
      CONSTANTS.ONE,
      CONSTANTS.ONE
    );
    const redeemRate1 = await SET.PyroTokens.pyroRegular1.redeemRate();

    await SET.loanOfficer.setObligationFor(
      SET.PyroTokens.pyroRegular1.address,
      CONSTANTS.ONE.mul(2),
      CONSTANTS.ONE.mul(2)
    );

    const redeemRate2 = await SET.PyroTokens.pyroRegular1.redeemRate();

    await SET.loanOfficer.setObligationFor(
      SET.PyroTokens.pyroRegular1.address,
      "0",
      CONSTANTS.ONE.mul(3)
    );

    const redeemRate3 = await SET.PyroTokens.pyroRegular1.redeemRate();

    //ASSERT
    expect(redeemRateInitial.toString()).to.equal(CONSTANTS.ONE);
    expect(redeemRateInitial).to.equal(redeemRate1);
    expect(redeemRate1).to.equal(redeemRate2);
    expect(redeemRate2).to.equal(redeemRate3);
  });
});

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as TypeChainTypes from "../typechain-types";
import { CONSTANTS, ConstantSet } from "./arrange/Common";
import { Arrange, t2Setup, t3Setup } from "./arrange/V2Migrator";

import { deploy, executionResult, numberClose, queryChain } from "./helper";

export interface TestSet {
  BaseToken: TypeChainTypes.BaseToken;
  PyroToken3: TypeChainTypes.PyroToken;
  PyroToken2: TypeChainTypes.PyroToken2;
  LiquidityReceiver: TypeChainTypes.LiquidityReceiver;
  lachesis: TypeChainTypes.Lachesis;
  CONSTANTS: ConstantSet;
  V2Migrator: TypeChainTypes.V2Migrator;
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

    await SET.BaseToken.approve(SET.PyroToken2.address, CONSTANTS.MAX);
    await SET.PyroToken2.mint(CONSTANTS.THOUSAND);

    const V2MigratorFactory = (await ethers.getContractFactory(
      "V2Migrator"
    )) as TypeChainTypes.V2Migrator__factory;

    SET.V2Migrator = await deploy<TypeChainTypes.V2Migrator>(
      V2MigratorFactory,
      SET.LiquidityReceiver.address,
      SET.lachesis.address
    );
  });

  it("t-1. migrates last holder without failing", async function () {
    const balanceofBaseOnPyro2 = await SET.BaseToken.balanceOf(
      SET.PyroToken2.address
    );
    const balanceOfPyro2 = await SET.PyroToken2.balanceOf(owner.address);
    const expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000);

    await SET.PyroToken2.approve(SET.V2Migrator.address, CONSTANTS.MAX);
    await SET.V2Migrator.migrate(
      SET.PyroToken2.address,
      SET.PyroToken3.address,
      balanceOfPyro2,
      expectedBalanceOfPyro3
    );

    console.log(
      `original ${balanceofBaseOnPyro2} remaining ${await SET.BaseToken.balanceOf(
        SET.PyroToken2.address
      )}`
    );

    const balanceOfPyro3 = await SET.PyroToken3.balanceOf(owner.address);
    expect(balanceOfPyro3.toString()).to.equal(expectedBalanceOfPyro3);

    const balanceOfPyro2After = await SET.PyroToken2.balanceOf(owner.address);
    expect(balanceOfPyro2After).to.equal(0);
  });

  it("t-2 migrates third last holder successfully", async function () {
    await Arrange(
      "create pyrotokens for users 2 and 3, push up redeem rate",
      SET,
      owner,
      true,
      t2Setup
    );

    const balanceOfPyro2 = await SET.PyroToken2.balanceOf(owner.address);

    const redeemRateOfPyro2 = await SET.PyroToken2.redeemRate();

    const redeemRateOfPyro3 = await SET.PyroToken3.redeemRate();
    const expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    //ACT
    await SET.PyroToken2.approve(SET.V2Migrator.address, CONSTANTS.MAX);
    await SET.V2Migrator.migrate(
      SET.PyroToken2.address,
      SET.PyroToken3.address,
      balanceOfPyro2,
      expectedBalanceOfPyro3
    );

    //ASSERT
    const balanceOfPyro3 = await SET.PyroToken3.balanceOf(owner.address);
    //precision loss because of redeem rate fetching after balance change
    //in pyro2.redeemRate()
    expect(balanceOfPyro3.toString()).to.equal("2530612615080077148553");

    const balanceOfPyro2After = await SET.PyroToken2.balanceOf(owner.address);
    expect(balanceOfPyro2After).to.equal(0);

    const pyro3RedeemRate = await SET.PyroToken3.redeemRate();
    const baseValueOfPyro3 = await pyro3RedeemRate
      .mul(balanceOfPyro3)
      .div(CONSTANTS.ONE);
    console.log("base value for user of Pyro3", baseValueOfPyro3);
  });

  //Any attemt to grief should simply make the next migrator richer
  it("t-3. attempts to grief by unsettling with transfers to migrator fails", async function () {
    await Arrange(
      "create pyrotokens for users 2 and 3, push up redeem rate",
      SET,
      owner,
      true,
      t3Setup
    );

    let balanceOfPyro2 = await SET.PyroToken2.balanceOf(owner.address);

    let redeemRateOfPyro2 = await SET.PyroToken2.redeemRate();

    let redeemRateOfPyro3 = await SET.PyroToken3.redeemRate();
    let expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    //ACT
    //first transfer funny amount of base token to migrator
    await SET.BaseToken.transfer(SET.V2Migrator.address, CONSTANTS.HUNDRED);

    await SET.PyroToken2.approve(SET.V2Migrator.address, CONSTANTS.MAX);
    await SET.V2Migrator.migrate(
      SET.PyroToken2.address,
      SET.PyroToken3.address,
      balanceOfPyro2.div(2),
      expectedBalanceOfPyro3.div(2)
    );

    //then transfer funny amount of pyro2 token to migrator
    const pyroBalanceBeforePyro2Grief = await SET.PyroToken2.balanceOf(
      owner.address
    );
    await SET.PyroToken2.transfer(
      SET.V2Migrator.address,
      pyroBalanceBeforePyro2Grief.div(2)
    );

    //recalculate invariants
    balanceOfPyro2 = await SET.PyroToken2.balanceOf(owner.address);
    redeemRateOfPyro2 = await SET.PyroToken2.redeemRate();
    redeemRateOfPyro3 = await SET.PyroToken3.redeemRate();

    expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

      await SET.V2Migrator.migrate(
        SET.PyroToken2.address,
        SET.PyroToken3.address,
        balanceOfPyro2.div(2),
        expectedBalanceOfPyro3.div(2)
      );

      //then transfer funny amount pyro3 to migrator
      const balanceOfPyro3= await SET.PyroToken3.balanceOf(owner.address);
      await SET.PyroToken3.transfer(SET.V2Migrator.address, balanceOfPyro3.div(2));

       //recalculate invariants
    balanceOfPyro2 = await SET.PyroToken2.balanceOf(owner.address);
    redeemRateOfPyro2 = await SET.PyroToken2.redeemRate();
    redeemRateOfPyro3 = await SET.PyroToken3.redeemRate();

    expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

      await SET.V2Migrator.migrate(
        SET.PyroToken2.address,
        SET.PyroToken3.address,
        balanceOfPyro2.div(2),
        expectedBalanceOfPyro3.div(2)
      );
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

  it("t-7. pyrotoken3 prediction mismatch fails", async function () {
    throw "not implemented";
  });
});

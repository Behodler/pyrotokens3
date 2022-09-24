import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import * as TypeChainTypes from "../typechain-types";
import { CONSTANTS, ConstantSet } from "./arrange/Common";
import { Arrange, t2Setup, t3Setup } from "./arrange/V2Migrator";

import {
  almostEqual,
  deploy,
  executionResult,
  numberClose,
  queryChain,
} from "./helper";

export interface TestSet {
  BaseTokens: TypeChainTypes.BaseToken[];
  PyroTokens3: TypeChainTypes.PyroToken[];
  PyroTokens2: TypeChainTypes.PyroToken2[];
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

    const BigConstantsFactory = await ethers.getContractFactory("BigConstants")
    const bigConstants = await deploy<TypeChainTypes.BigConstants>(BigConstantsFactory)

    const liquidityReceiverFactory = (await ethers.getContractFactory(
      "LiquidityReceiver"
    )) as TypeChainTypes.LiquidityReceiver__factory;

    SET.LiquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(
      liquidityReceiverFactory,
      SET.lachesis.address,
      bigConstants.address
    );
    SET.BaseTokens = [];
    SET.PyroTokens2 = [];
    SET.PyroTokens3 = [];
    for (let i = 0; i < 7; i++) {
      const BaseTokenFactory = (await ethers.getContractFactory(
        "BaseToken"
      )) as TypeChainTypes.BaseToken__factory;
      SET.BaseTokens.push(
        await deploy<TypeChainTypes.BaseToken>(
          BaseTokenFactory,
          "base",
          "BAS",
          0
        )
      );

      await SET.lachesis.measure(SET.BaseTokens[i].address, true, false);

      await SET.LiquidityReceiver.registerPyroToken(
        SET.BaseTokens[i].address,
        "PyroBASE",
        "PBAS",
        18
      );
      SET.PyroTokens3.push(
        (await ethers.getContractAt(
          "PyroToken",
          await SET.LiquidityReceiver.getPyroToken(SET.BaseTokens[i].address)
        )) as TypeChainTypes.PyroToken
      );

      const pyroToken2Factory = (await ethers.getContractFactory(
        "PyroToken2"
      )) as TypeChainTypes.PyroToken2__factory;

      SET.PyroTokens2.push(
        await deploy<TypeChainTypes.PyroToken2>(
          pyroToken2Factory,
          SET.BaseTokens[i].address
        )
      );

      await SET.BaseTokens[i].approve(
        SET.PyroTokens2[i].address,
        CONSTANTS.MAX
      );
      await SET.PyroTokens2[i].mint(CONSTANTS.THOUSAND);
    }
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
    const balanceofBaseOnPyro2 = await SET.BaseTokens[0].balanceOf(
      SET.PyroTokens2[0].address
    );
    const balanceOfPyro2 = await SET.PyroTokens2[0].balanceOf(owner.address);
    const expectedBalanceOfPyro3 = balanceOfPyro2.mul(980).div(1000);

    await SET.PyroTokens2[0].approve(SET.V2Migrator.address, CONSTANTS.MAX);
    await SET.V2Migrator.migrate(
      SET.PyroTokens2[0].address,
      SET.PyroTokens3[0].address,
      balanceOfPyro2,
      expectedBalanceOfPyro3
    );

    console.log(
      `original ${balanceofBaseOnPyro2} remaining ${await SET.BaseTokens[0].balanceOf(
        SET.PyroTokens2[0].address
      )}`
    );

    const balanceOfPyro3 = await SET.PyroTokens3[0].balanceOf(owner.address);
    expect(almostEqual(balanceOfPyro3, expectedBalanceOfPyro3)).to.equal(
      true,
      `actual ${balanceOfPyro3} expected ${expectedBalanceOfPyro3}`
    );

    const balanceOfPyro2After = await SET.PyroTokens2[0].balanceOf(
      owner.address
    );
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

    const balanceOfPyro2 = await SET.PyroTokens2[0].balanceOf(owner.address);

    const redeemRateOfPyro2 = await SET.PyroTokens2[0].redeemRate();

    const redeemRateOfPyro3 = await SET.PyroTokens3[0].redeemRate();
    const expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    //ACT
    await SET.PyroTokens2[0].approve(SET.V2Migrator.address, CONSTANTS.MAX);
    await SET.V2Migrator.migrate(
      SET.PyroTokens2[0].address,
      SET.PyroTokens3[0].address,
      balanceOfPyro2,
      expectedBalanceOfPyro3
    );

    //ASSERT
    const balanceOfPyro3 = await SET.PyroTokens3[0].balanceOf(owner.address);
    //precision loss because of redeem rate fetching after balance change
    //in pyro2.redeemRate()
    expect(balanceOfPyro3.toString()).to.equal("2530612615080077148553");

    const balanceOfPyro2After = await SET.PyroTokens2[0].balanceOf(
      owner.address
    );
    expect(balanceOfPyro2After).to.equal(0);

    const pyro3RedeemRate = await SET.PyroTokens3[0].redeemRate();
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

    let balanceOfPyro2 = await SET.PyroTokens2[0].balanceOf(owner.address);

    let redeemRateOfPyro2 = await SET.PyroTokens2[0].redeemRate();

    let redeemRateOfPyro3 = await SET.PyroTokens3[0].redeemRate();
    let expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    //ACT
    //first transfer funny amount of base token to migrator
    await SET.BaseTokens[0].transfer(SET.V2Migrator.address, CONSTANTS.HUNDRED);

    await SET.PyroTokens2[0].approve(SET.V2Migrator.address, CONSTANTS.MAX);
    await SET.V2Migrator.migrate(
      SET.PyroTokens2[0].address,
      SET.PyroTokens3[0].address,
      balanceOfPyro2.div(2),
      expectedBalanceOfPyro3.div(2)
    );

    //then transfer funny amount of pyro2 token to migrator
    const pyroBalanceBeforePyro2Grief = await SET.PyroTokens2[0].balanceOf(
      owner.address
    );
    await SET.PyroTokens2[0].transfer(
      SET.V2Migrator.address,
      pyroBalanceBeforePyro2Grief.div(2)
    );

    //recalculate invariants
    balanceOfPyro2 = await SET.PyroTokens2[0].balanceOf(owner.address);
    redeemRateOfPyro2 = await SET.PyroTokens2[0].redeemRate();
    redeemRateOfPyro3 = await SET.PyroTokens3[0].redeemRate();

    expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    await SET.V2Migrator.migrate(
      SET.PyroTokens2[0].address,
      SET.PyroTokens3[0].address,
      balanceOfPyro2.div(2),
      expectedBalanceOfPyro3.div(2)
    );

    //then transfer funny amount pyro3 to migrator
    const balanceOfPyro3 = await SET.PyroTokens3[0].balanceOf(owner.address);
    await SET.PyroTokens3[0].transfer(
      SET.V2Migrator.address,
      balanceOfPyro3.div(2)
    );

    //recalculate invariants
    balanceOfPyro2 = await SET.PyroTokens2[0].balanceOf(owner.address);
    redeemRateOfPyro2 = await SET.PyroTokens2[0].redeemRate();
    redeemRateOfPyro3 = await SET.PyroTokens3[0].redeemRate();

    expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    await SET.V2Migrator.migrate(
      SET.PyroTokens2[0].address,
      SET.PyroTokens3[0].address,
      balanceOfPyro2.div(2),
      expectedBalanceOfPyro3.div(2)
    );
  });

  it("t-4. migrate many reverts all if one fails", async function () {
    const balanceofBaseOnPyro2 = await SET.BaseTokens[0].balanceOf(
      SET.PyroTokens2[0].address
    );
    let balanceOfPyro2Set: BigNumber[] = [];
    let expectedBalanceOfPyro3Set: BigNumber[] = [];
    let pyro2AddressSet: string[] = [];
    let pyro3AddressSet: string[] = [];
    for (let i = 0; i < SET.PyroTokens2.length; i++) {
      pyro2AddressSet.push(SET.PyroTokens2[i].address);
      pyro3AddressSet.push(SET.PyroTokens3[i].address);
      balanceOfPyro2Set.push(await SET.PyroTokens2[i].balanceOf(owner.address));
      expectedBalanceOfPyro3Set.push(balanceOfPyro2Set[i].mul(980).div(1000));

      await SET.PyroTokens2[i].approve(SET.V2Migrator.address, CONSTANTS.MAX);
    }
    console.log('expectedBalanceOfPyro 3', expectedBalanceOfPyro3Set[6].toString());
    expectedBalanceOfPyro3Set[6] = expectedBalanceOfPyro3Set[6].add(CONSTANTS.ONE)
    await expect(SET.V2Migrator.migrateMany(
      pyro2AddressSet,
      pyro3AddressSet,
      balanceOfPyro2Set,
      expectedBalanceOfPyro3Set
    )).to.be.revertedWith("P3AmountInvariant")
  });

  it("t-5. migrate many succeeds", async function () {
    const balanceofBaseOnPyro2 = await SET.BaseTokens[0].balanceOf(
      SET.PyroTokens2[0].address
    );
    let balanceOfPyro2Set: BigNumber[] = [];
    let expectedBalanceOfPyro3Set: BigNumber[] = [];
    let pyro2AddressSet: string[] = [];
    let pyro3AddressSet: string[] = [];
    for (let i = 0; i < SET.PyroTokens2.length; i++) {
      pyro2AddressSet.push(SET.PyroTokens2[i].address);
      pyro3AddressSet.push(SET.PyroTokens3[i].address);
      balanceOfPyro2Set.push(await SET.PyroTokens2[i].balanceOf(owner.address));
      expectedBalanceOfPyro3Set.push(balanceOfPyro2Set[i].mul(980).div(1000));

      await SET.PyroTokens2[i].approve(SET.V2Migrator.address, CONSTANTS.MAX);
    }

    await SET.V2Migrator.migrateMany(
      pyro2AddressSet,
      pyro3AddressSet,
      balanceOfPyro2Set,
      expectedBalanceOfPyro3Set
    );
  });

  it("t-6. attempting with tokens that aren't lachesis validated fails", async function () {
    await Arrange(
      "create pyrotokens for users 2 and 3, push up redeem rate",
      SET,
      owner,
      false,
      t2Setup
    );

    const balanceOfPyro2 = await SET.PyroTokens2[0].balanceOf(owner.address);

    const redeemRateOfPyro2 = await SET.PyroTokens2[0].redeemRate();

    const redeemRateOfPyro3 = await SET.PyroTokens3[0].redeemRate();
    const expectedBalanceOfPyro3 = balanceOfPyro2
      .mul(999)
      .mul(980)
      .div(1000000)
      .mul(redeemRateOfPyro2)
      .div(redeemRateOfPyro3);

    //ACT
    await SET.PyroTokens2[0].approve(SET.V2Migrator.address, CONSTANTS.MAX);

    //Unvalidate base token
    await SET.lachesis.measure(SET.BaseTokens[0].address, false, false);
    await expect(SET.V2Migrator.migrate(
      SET.PyroTokens2[0].address,
      SET.PyroTokens3[0].address,
      balanceOfPyro2,
      expectedBalanceOfPyro3
    ))
      .to.be.revertedWith("LachesisValidationFailed");
  });
});

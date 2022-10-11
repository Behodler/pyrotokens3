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
import { CONSTANTS, ConstantSet } from "./arrange/Common";

import { deploy, executionResult, numberClose, queryChain } from "./helper";

export interface TestSet {
  WETH: TypeChainTypes.WETH10;
  EYE: TypeChainTypes.BaseToken
  PyroWETH: TypeChainTypes.PyroToken;
  PyroWethProxy: TypeChainTypes.PyroWethProxy;
  LiquidityReceiver: TypeChainTypes.LiquidityReceiver;
  lachesis: TypeChainTypes.Lachesis;
  CONSTANTS: ConstantSet;
  SnufferCap: TypeChainTypes.BurnEYESnufferCap
}

describe("PyroWeth Proxy", async function () {
  let owner: SignerWithAddress, secondPerson: SignerWithAddress;
  let SET = {} as TestSet;
  SET.CONSTANTS = CONSTANTS;
  beforeEach(async function () {
    [owner, secondPerson] = await ethers.getSigners();
    var BaseToken = await ethers.getContractFactory("BaseToken");
    SET.EYE = await deploy<TypeChainTypes.BaseToken>(
      BaseToken,
      "EYE",
      "EYE",
      0
    );

    await SET.EYE.mint(CONSTANTS.THOUSAND)

    const wethFactory = await ethers.getContractFactory("WETH10");
    SET.WETH = await deploy<TypeChainTypes.WETH10>(wethFactory);

    var Lachesis = await ethers.getContractFactory("Lachesis");
    SET.lachesis = await deploy<TypeChainTypes.Lachesis>(Lachesis);
    await SET.lachesis.measure(SET.WETH.address, true, false);

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

    const BurnEYESnufferCapFactory = await ethers.getContractFactory("BurnEYESnufferCap")
    SET.SnufferCap = await deploy<TypeChainTypes.BurnEYESnufferCap>(BurnEYESnufferCapFactory, SET.EYE.address, SET.LiquidityReceiver.address)
    await SET.LiquidityReceiver.setSnufferCap(SET.SnufferCap.address)

    await SET.LiquidityReceiver.registerPyroToken(
      SET.WETH.address,
      "PyroWeth",
      "PWETH",
      18
    );
    const pyroWethAddress = await SET.LiquidityReceiver.getPyroToken(
      SET.WETH.address
    );
    SET.PyroWETH = (await ethers.getContractAt(
      "PyroToken",
      pyroWethAddress
    )) as TypeChainTypes.PyroToken;

    const pyroWethProxyFactory = (await ethers.getContractFactory(
      "PyroWethProxy"
    )) as TypeChainTypes.PyroWethProxy__factory;
    SET.PyroWethProxy = (await deploy<TypeChainTypes.PyroWethProxy>(
      pyroWethProxyFactory,
      SET.PyroWETH.address
    )) as TypeChainTypes.PyroWethProxy;
  });

  it("mint->redeem only reduces balance by 2%", async function () {
    const ethBalanceBeforeMint = await owner.getBalance();
    await SET.EYE.approve(SET.SnufferCap.address, CONSTANTS.THOUSAND)
    await SET.SnufferCap.snuff(SET.PyroWETH.address, SET.PyroWethProxy.address, 5)

    await SET.PyroWethProxy.mint(CONSTANTS.TEN, { value: CONSTANTS.TEN });
    expect(await SET.PyroWETH.balanceOf(owner.address)).to.equal(CONSTANTS.TEN);

    await SET.PyroWETH.approve(SET.PyroWethProxy.address, CONSTANTS.TEN, {
      from: owner.address,
    });
    await SET.PyroWethProxy.redeem(CONSTANTS.TEN);

    expect(await SET.PyroWETH.balanceOf(owner.address)).to.equal(0);
    const ethBalanceAfterRedeem = await owner.getBalance();
    const changeInActualEth = ethBalanceBeforeMint.sub(ethBalanceAfterRedeem);
    const expectedChange = BigNumber.from(CONSTANTS.TEN).mul(2).div(100);
    expect(numberClose(changeInActualEth, expectedChange)).to.be.true;
  });

  it("minting with incorrect forwarded value fails ", async function () {
    const tooHigh = CONSTANTS.TEN.add(1);
    const tooLow = CONSTANTS.TEN.sub(1);

    await expect(SET.PyroWethProxy.mint(CONSTANTS.TEN, { value: tooHigh }))
      .to
      .be
      .revertedWith("EthForwardingFailed");

    await expect(SET.PyroWethProxy.mint(CONSTANTS.TEN, { value: tooLow }))
      .to
      .be
      .revertedWith("EthForwardingFailed");
  });
});

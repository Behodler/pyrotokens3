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
  WETH: TypeChainTypes.WETH10;
  PyroWETH: TypeChainTypes.PyroToken;
  PyroWethProxy: TypeChainTypes.PyroWethProxy;
  LiquidityReceiver: TypeChainTypes.LiquidityReceiver;
  lachesis: TypeChainTypes.Lachesis;
  CONSTANTS: ConstantSet;
}

describe("PyroWeth Proxy", async function () {
  let owner: SignerWithAddress, secondPerson: SignerWithAddress;
  let SET = {} as TestSet;
  SET.CONSTANTS = CONSTANTS;
  beforeEach(async function () {
    [owner, secondPerson] = await ethers.getSigners();
    const wethFactory = await ethers.getContractFactory("WETH10");
    SET.WETH = await deploy<TypeChainTypes.WETH10>(wethFactory);

    var Lachesis = await ethers.getContractFactory("Lachesis");
    SET.lachesis = await deploy<TypeChainTypes.Lachesis>(Lachesis);
    await SET.lachesis.measure(SET.WETH.address, true, false);

    const liquidityReceiverFactory = (await ethers.getContractFactory(
      "LiquidityReceiver"
    )) as TypeChainTypes.LiquidityReceiver__factory;

    SET.LiquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(
      liquidityReceiverFactory,
      SET.lachesis.address
    );

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

  it("minting with incorrect forwarded value fails ", async function () {});
});

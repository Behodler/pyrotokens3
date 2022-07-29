import { ethers } from "hardhat";
import { TestSet } from "../Pyrotoken.test";
import * as TypeChainTypes from "../../typechain-types";
import { expect } from "chai";
import { executionResult, queryChain, LogIf } from "../helper";

import chalk from "chalk";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ArrangeFactory, CONSTANTS } from "./Common";

export const Arrange = ArrangeFactory<TestSet>()

export async function t0Setup(SET: TestSet, owner: any, logger: any) {
  await SET.Uniswap.factory.createPair(
    SET.BaseTokens.regularToken1.address,
    SET.PyroTokens.pyroRegular1.address
  );
  const pairAddress = await SET.Uniswap.factory.getPair(
    SET.BaseTokens.regularToken1.address,
    SET.PyroTokens.pyroRegular1.address
  );
  const pair = (await ethers.getContractFactory("UniswapV2Pair")).attach(
    pairAddress
  ) as TypeChainTypes.UniswapV2Pair;
  await SET.BaseTokens.regularToken1.mint(CONSTANTS.THOUSAND);
  await SET.BaseTokens.regularToken1.transfer(pairAddress, CONSTANTS.THOUSAND);
  await SET.BaseTokens.regularToken1.approve(
    SET.PyroTokens.pyroRegular1.address,
    CONSTANTS.MAX
  );
  await SET.PyroTokens.pyroRegular1.mint(
    owner.address,
    CONSTANTS.THOUSAND.mul(3)
  );

  await SET.PyroTokens.pyroRegular1.transfer(
    pairAddress,
    CONSTANTS.THOUSAND.mul(2)
  );

  const regularBalanceOfOwnerBeforeMintQuery = await queryChain(
    SET.BaseTokens.regularToken1.balanceOf(owner.address)
  );
  expect(regularBalanceOfOwnerBeforeMintQuery.success).to.equal(
    true,
    regularBalanceOfOwnerBeforeMintQuery.error
  );

  const regularBalanceOfPairBeforeMintQuery = await queryChain(
    SET.BaseTokens.regularToken1.balanceOf(pairAddress)
  );
  expect(regularBalanceOfPairBeforeMintQuery.success).to.equal(
    true,
    regularBalanceOfOwnerBeforeMintQuery.error
  );

  logger(`pyroRegular address ${SET.PyroTokens.pyroRegular1.address}`);
  const pyroBalanceOfOwnerBeforeMintQuery = await queryChain(
    SET.PyroTokens.pyroRegular1.balanceOf(owner.address)
  );
  expect(pyroBalanceOfOwnerBeforeMintQuery.success).to.equal(
    true,
    pyroBalanceOfOwnerBeforeMintQuery.error
  );

  const pyroBalanceOfPairBeforeMintQuery = await queryChain(
    SET.PyroTokens.pyroRegular1.balanceOf(pairAddress)
  );
  expect(pyroBalanceOfOwnerBeforeMintQuery.success).to.equal(
    true,
    pyroBalanceOfOwnerBeforeMintQuery.error
  );

  logger(
    JSON.stringify(
      {
        regularBalanceOfOwnerBeforeMint:
          regularBalanceOfOwnerBeforeMintQuery.result.toString(),
        regularBalanceOfPairBeforeMint:
          regularBalanceOfPairBeforeMintQuery.result.toString(),
        pyroBalanceOfOwnerBeforeMint:
          pyroBalanceOfOwnerBeforeMintQuery.result.toString(),
        pyroBalanceOfPairBeforeMint:
          pyroBalanceOfPairBeforeMintQuery.result.toString(),
      },
      null,
      4
    )
  );

  let result = await executionResult(pair.mint(owner.address));
  expect(result.success).to.equal(true, result.error);

  const LPtokens = await pair.balanceOf(owner.address);
  logger("LPtoken balance " + LPtokens);

  const wethFactory = await ethers.getContractFactory("WETH10");
  const weth = await wethFactory.deploy();
  const UniswapRouterFactory = await ethers.getContractFactory(
    "UniswapV2Router02"
  );
  const UniswapRouter = (await UniswapRouterFactory.deploy(
    SET.Uniswap.factory.address,
    weth.address
  )) as TypeChainTypes.UniswapV2Router02;
  SET.Uniswap.router = UniswapRouter;

  await SET.BaseTokens.regularToken1.approve(
    SET.Uniswap.router.address,
    CONSTANTS.MAX
  );
  await SET.PyroTokens.pyroRegular1.approve(
    SET.Uniswap.router.address,
    CONSTANTS.MAX
  );
}

export async function t1Setup(
  SET: TestSet,
  owner: any,
  logger: any,
  ...args: Array<any>
) {
  let toggle = args[0].toString().trim() !== "false";

  await SET.liquidityReceiver.togglePyroTokenPullFeeRevenue(
    SET.PyroTokens.pyroRegular1.address,
    toggle
  );
  await SET.BaseTokens.regularToken1.mint(CONSTANTS.THOUSAND);
  await SET.BaseTokens.regularToken1.approve(
    SET.PyroTokens.pyroRegular1.address,
    CONSTANTS.MAX
  );

  await SET.PyroTokens.pyroRegular1.mint(owner.address, CONSTANTS.ONE);

  await SET.BaseTokens.regularToken1.transfer(
    SET.liquidityReceiver.address,
    CONSTANTS.HUNDRED
  );
}

export async function t7Setup(
  SET: TestSet,
  owner: any,
  logger: any,
  ...args: Array<any>
) {
  const pyroToken = SET.PyroTokens.pyroRegular1;
  const baseToken = SET.BaseTokens.regularToken1;
  const secondPerson = args[0] as SignerWithAddress;
  //mint pyrotokens
  await baseToken.approve(pyroToken.address, CONSTANTS.MAX);
  await baseToken
    .connect(secondPerson)
    .approve(pyroToken.address, CONSTANTS.MAX);

  //mint 30
  await pyroToken.mint(owner.address, CONSTANTS.TEN);

  //increase redeem rate
  await baseToken.transfer(SET.liquidityReceiver.address, CONSTANTS.TEN);

  await baseToken.connect(secondPerson).mint(CONSTANTS.HUNDRED);

  await pyroToken
    .connect(secondPerson)
    .mint(secondPerson.address, CONSTANTS.TEN.mul(3));
  // logger(`redeem rate: ${await (await pyroToken.redeemRate()).toString()}`);
}

export async function t9Setup(
  SET: TestSet,
  owner: any,
  logger: any,
  ...args: Array<any>
) {
  const pyroToken = SET.PyroTokens.pyroRegular1;
  const baseToken = SET.BaseTokens.regularToken1;
  const secondPerson = args[0] as SignerWithAddress;
  //mint pyrotokens
  await baseToken.approve(pyroToken.address, CONSTANTS.MAX);
  await baseToken
    .connect(secondPerson)
    .approve(pyroToken.address, CONSTANTS.MAX);

  //mint 30
  await pyroToken.mint(owner.address, CONSTANTS.TEN);

  await baseToken.connect(secondPerson).mint(CONSTANTS.HUNDRED);

  await pyroToken
    .connect(secondPerson)
    .mint(secondPerson.address, CONSTANTS.TEN.mul(3));

  //BORROW
  await SET.loanOfficer.setObligationFor(SET.PyroTokens.pyroRegular1.address,CONSTANTS.TEN,CONSTANTS.TEN,0)
}

export async function t10Setup(
  SET: TestSet,
  owner: any,
  logger: any,
  ...args: Array<any>
) {
  const pyroToken = SET.PyroTokens.pyroRegular1;
  const baseToken = SET.BaseTokens.regularToken1;
  const secondPerson = args[0] as SignerWithAddress;
  //mint pyrotokens
  await baseToken.approve(pyroToken.address, CONSTANTS.MAX);
  await baseToken
    .connect(secondPerson)
    .approve(pyroToken.address, CONSTANTS.MAX);

  //mint 30
  await pyroToken.mint(owner.address, CONSTANTS.TEN);

  await baseToken.connect(secondPerson).mint(CONSTANTS.HUNDRED);

  await pyroToken
    .connect(secondPerson)
    .mint(secondPerson.address, CONSTANTS.TEN.mul(3));


  //BORROW and stake 30 Pyro
  await SET.loanOfficer.setObligationFor(SET.PyroTokens.pyroRegular1.address,CONSTANTS.TEN,CONSTANTS.TEN,0)
}


export async function t11Setup(
  SET: TestSet,
  owner: any,
  logger: any,
  ...args: Array<any>
) {
  const pyroToken = SET.PyroTokens.pyroRegular1;
  const baseToken = SET.BaseTokens.regularToken1;
  const secondPerson = args[0] as SignerWithAddress;
  //mint pyrotokens
  await baseToken.approve(pyroToken.address, CONSTANTS.MAX);
  await baseToken
    .connect(secondPerson)
    .approve(pyroToken.address, CONSTANTS.MAX);

  //mint 30
  await pyroToken.mint(owner.address, CONSTANTS.TEN);

  await baseToken.connect(secondPerson).mint(CONSTANTS.HUNDRED);

  await pyroToken
    .connect(secondPerson)
    .mint(secondPerson.address, CONSTANTS.TEN.mul(3));
}

export async function t12Setup(
  SET: TestSet,
  owner: any,
  logger: any,
  ...args: Array<any>
) {
  const pyroToken = SET.PyroTokens.pyroRegular1;
  const baseToken = SET.BaseTokens.regularToken1;
  const secondPerson = args[0] as SignerWithAddress;
  //mint pyrotokens
  await baseToken.approve(pyroToken.address, CONSTANTS.MAX);
  await baseToken
    .connect(secondPerson)
    .approve(pyroToken.address, CONSTANTS.MAX);

  //mint 30
  await pyroToken.mint(owner.address, CONSTANTS.TEN);

  await baseToken.connect(secondPerson).mint(CONSTANTS.HUNDRED);

  await pyroToken
    .connect(secondPerson)
    .mint(secondPerson.address, CONSTANTS.TEN.mul(3));


  //BORROW and stake 30 Pyro
  await SET.loanOfficer.setObligationFor(
    pyroToken.address,
    CONSTANTS.TEN, //baseBorrow
    CONSTANTS.TEN, //pyroStake
    0)
}
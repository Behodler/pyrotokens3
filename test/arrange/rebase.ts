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


export async function example(SET: TestSet, owner: any, logger: any) {
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



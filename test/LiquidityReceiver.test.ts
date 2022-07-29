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
  CONSTANTS: ConstantSet;
}

describe("LiquidityReceiver", async function () {
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
  });

  it("CREATE2: Deployed PyroToken address matches predicted address", async function () {
    const expectedAddressOfPyroToken = await SET.liquidityReceiver.getPyroToken(
      SET.BaseTokens.regularToken1.address
    );
    await SET.liquidityReceiver.registerPyroToken(
      SET.BaseTokens.regularToken1.address,
      "hello",
      "there",
      18
    );

    await SET.liquidityReceiver.setPyroTokenLoanOfficer(
      expectedAddressOfPyroToken,
      SET.loanOfficer.address
    );
  });

  it("SetFeeExempt on EOA fails", async function () {
    const pyrotoken = await getNewPyroToken(SET.BaseTokens.regularToken1);

    await SET.BaseTokens.EYE.approve(
      SET.snufferCap.address,
      "100000000000000000000000"
    );
    //contract passes
    await SET.snufferCap.snuff(pyrotoken, SET.loanOfficer.address, 3);

    await expect(
      SET.snufferCap.snuff(pyrotoken, owner.address, 3)
    ).to.be.revertedWith(`OnlyContracts("${owner.address}")`);
  });
  [0, 1].forEach((i) => {
    it("Non fee exempt contract charged all fees, EOA charged all fees", async function () {
      console.log("no fee run " + i);
      const pyrotokenAddress = await getNewPyroToken(
        SET.BaseTokens.regularToken1
      );
      const pyrotoken = await ethers.getContractAt(
        "PyroToken",
        pyrotokenAddress
      );
      await SET.BaseTokens.regularToken1.approve(
        pyrotokenAddress,
        "1000000000000"
      );
      await pyrotoken.mint(owner.address, "1000000000000");

      //EOA
      await pyrotoken.transfer(secondPerson.address, "10000000");
      const totalSupplyAfterTransfer = (
        await pyrotoken.totalSupply()
      ).toString();
      expect(totalSupplyAfterTransfer).to.equal("999999990000");

      await pyrotoken.redeem(owner.address, "10000000000");
      expect(await pyrotoken.totalSupply()).to.equal("989999990000");

      //Contract
      const PyroSender = await ethers.getContractFactory("PyroSender");
      const pyroSender = await PyroSender.deploy();

      if (i == 1) {
        await SET.BaseTokens.EYE.approve(
          SET.snufferCap.address,
          "10000000000000000000000"
        );
        await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 0);
      }

      //send from EOA to contract
      await pyrotoken.transfer(pyroSender.address, "1000000000");
      expect(await pyrotoken.totalSupply()).to.equal("989998990000");

      //send from contract to EOA
      await pyroSender.send(pyrotoken.address, owner.address, "100000000");
      expect(await pyrotoken.totalSupply()).to.equal("989998890000");
      //send from contract to contract
      await pyroSender.send(
        pyrotoken.address,
        SET.BaseTokens.regularToken1.address,
        "100000000"
      );
      expect(await pyrotoken.totalSupply()).to.equal("989998790000");

      //redeem from contract
      await pyroSender.redeem(pyrotoken.address, "100000000");
      expect(await pyrotoken.totalSupply()).to.equal("989898790000");
    });
  });

  it("SetFeeExempt on Contract passes for each scenario", async function () {
    const PyroSender = await ethers.getContractFactory("PyroSender");
    const pyroSender = await PyroSender.deploy();

    //create pyrotoken and send some to sender contract
    const pyrotokenAddress = await getNewPyroToken(
      SET.BaseTokens.regularToken1
    );
    const pyrotoken = await ethers.getContractAt("PyroToken", pyrotokenAddress);
    await SET.BaseTokens.regularToken1.approve(
      pyrotokenAddress,
      "1000000000000"
    );
    await pyrotoken.mint(owner.address, "1000000000000");
    await pyrotoken.transfer(pyroSender.address, "100000000");

    //prepare for snuffing
    await SET.BaseTokens.EYE.approve(
      SET.snufferCap.address,
      "1000000000000000000000000"
    );

    // SENDER_EXEMPT
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 1);
    let totalSupplyBefore = BigInt((await pyrotoken.totalSupply()).toString());
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    let totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // SENDER_AND_RECEIVER_EXEMPT
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 2);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // REDEEM_EXEMPT_AND_SENDER_EXEMPT
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 3);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    await pyroSender.redeem(pyrotoken.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(
      (totalSupplyAfter + BigInt("100000")).toString()
    );

    // REDEEM_EXEMPT_AND_SENDER_AND_RECEIVER_EXEMPT
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 4);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    await pyroSender.redeem(pyrotoken.address, "100000");
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(
      (totalSupplyAfter + BigInt("100000")).toString()
    );

    // RECEIVER_EXEMPT
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 5);
    totalSupplyBefore = totalSupplyAfter;
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // REDEEM_EXEMPT_AND_RECEIVER_EXEMPT
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 6);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.redeem(pyrotoken.address, "100000");
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(
      (totalSupplyAfter + BigInt("100000")).toString()
    );

    // REDEEM_EXEMPT_ONLY
    await SET.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 7);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.redeem(pyrotoken.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(
      (totalSupplyAfter + BigInt("100000")).toString()
    );
  });

  it("Redeploying existing PyroToken fails", async function () {
    await SET.liquidityReceiver.registerPyroToken(
      SET.BaseTokens.regularToken1.address,
      "hello",
      "there",
      18
    );
    const pyroTokenAddress = await SET.liquidityReceiver.getPyroToken(
      SET.BaseTokens.regularToken1.address
    );
    await expect(
      SET.liquidityReceiver.registerPyroToken(
        SET.BaseTokens.regularToken1.address,
        "general",
        "kenobi",
        18
      )
    ).to.be.revertedWith(`AddressOccupied("${pyroTokenAddress}")`);
  });

  it("default loan officer (zero allowed)", async function () {
    const newPTokenAddress1 = await getNewPyroToken(
      SET.BaseTokens.regularToken1
    );
    const pyrotoken1 = (await ethers.getContractAt(
      "PyroToken",
      newPTokenAddress1
    )) as TypeChainTypes.PyroToken;
    let configuration1 = await pyrotoken1.config();
    expect(configuration1[2]).to.equal(SET.loanOfficer.address);

    await SET.liquidityReceiver.setDefaultLoanOfficer(
      SET.CONSTANTS.ZERO_ADDRESS
    );

    const newPTokenAddress2 = await getNewPyroToken(
      SET.BaseTokens.regularToken2
    );
    const pyrotoken2 = (await ethers.getContractAt(
      "PyroToken",
      newPTokenAddress2
    )) as TypeChainTypes.PyroToken;

    configuration1 = await pyrotoken1.config();
    const configuration2 = await pyrotoken2.config();

    expect(configuration1[2]).to.equal(SET.loanOfficer.address); //changing default doesn't affect existing
    expect(configuration2[2]).to.equal(SET.CONSTANTS.ZERO_ADDRESS);
  });

  it("Only valid nonburnable tokens can have pyroTokens", async function () {
    await expect(
      SET.liquidityReceiver.registerPyroToken(
        SET.BaseTokens.invalidToken1.address,
        "hello",
        "there",
        18
      )
    ).to.be.revertedWith("LachesisValidationFailed");

    await expect(
      SET.liquidityReceiver.registerPyroToken(
        SET.BaseTokens.invalidToken2.address,
        "hello",
        "there",
        18
      )
    ).to.be.revertedWith("LachesisValidationFailed");

    await expect(
      SET.liquidityReceiver.registerPyroToken(
        SET.BaseTokens.invalidToken3.address,
        "hello",
        "there",
        18
      )
    ).to.be.revertedWith("LachesisValidationFailed");
  });

  it("Transfer of pyroToken to new liquidity receiver works fully", async function () {
    const pyrotokenAddress = await getNewPyroToken(
      SET.BaseTokens.regularToken1
    );
    const pyrotoken = await ethers.getContractAt("PyroToken", pyrotokenAddress);
    const liquidityReceiver2 = await SET.LiquidityReceiverFactory.deploy(
      SET.lachesis.address
    );

    await SET.liquidityReceiver.transferPyroTokenToNewReceiver(
      pyrotoken.address,
      liquidityReceiver2.address
    );

    const receiverAddress = (await pyrotoken.config())[0];
    expect(receiverAddress).to.equal(liquidityReceiver2.address);
  });

  it("register pyrotoken reflects correct ERC20 metadata", async function () {
    const pyrotokenAddress = await SET.liquidityReceiver.getPyroToken(
      SET.BaseTokens.regularToken1.address
    );
    await SET.liquidityReceiver.registerPyroToken(
      SET.BaseTokens.regularToken1.address,
      "name",
      "symbol",
      7
    );

    const pyrotoken = await ethers.getContractAt("PyroToken", pyrotokenAddress);
    expect(await pyrotoken.name()).to.equal("name");
    expect(await pyrotoken.symbol()).to.equal("symbol");
    expect(await pyrotoken.decimals()).to.equal(7);
  });

  async function getNewPyroToken(token: Contract, seed?: string) {
    await SET.liquidityReceiver.registerPyroToken(
      token.address,
      "hello" + seed || "",
      "there" + seed || "",
      18
    );
    const pyrotoken = await SET.liquidityReceiver.getPyroToken(token.address);
    return pyrotoken;
  }
});

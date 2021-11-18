import { expect } from "chai";
import { ethers } from "hardhat";

describe("LiquidityReceiver", async function () {
  let owner: any, secondPerson: any;
  beforeEach(async function () {
    [owner, secondPerson] = await ethers.getSigners();
    var BaseToken = await ethers.getContractFactory("BaseToken");
    this.regularToken = await BaseToken.deploy("Base1", "BASE", 0);
    this.invalidToken1 = await BaseToken.deploy("Base2", "BASE", 0);
    this.invalidToken2 = await BaseToken.deploy("Base3", "BASE", 10);
    this.invalidToken3 = await BaseToken.deploy("Base3", "BASE", 0);
    this.EYE = await BaseToken.deploy("EYE", "EYE", 0);

    var Lachesis = await ethers.getContractFactory("Lachesis");
    var lachesis = await Lachesis.deploy();
    await lachesis.measure(this.regularToken.address, true, false);
    await lachesis.measure(this.invalidToken1.address, false, false);
    await lachesis.measure(this.invalidToken2.address, true, true);
    await lachesis.measure(this.invalidToken3.address, false, true);

    const LiquidityReceiver = await ethers.getContractFactory(
      "LiquidityReceiver"
    );
    this.liquidityReceiver = await LiquidityReceiver.deploy(lachesis.address);

    const BurnEYESnufferCap = await ethers.getContractFactory(
      "BurnEYESnufferCap"
    );
    this.snufferCap = await BurnEYESnufferCap.deploy(
      this.EYE.address,
      this.liquidityReceiver.address
    );

    await this.liquidityReceiver.setSnufferCap(this.snufferCap.address);

    const LoanOfficer = await ethers.getContractFactory("SimpleLoanOfficer");
    this.loanOfficer = await LoanOfficer.deploy();
  });

  it("CREATE2: Deployed PyroToken address matches predicted address", async function () {
    const expectedAddressOfPyroToken =
      await this.liquidityReceiver.getPyroToken(this.regularToken.address);
    await this.liquidityReceiver.registerPyroToken(
      this.regularToken.address,
      "hello",
      "there"
    );

    await this.liquidityReceiver.setPyroTokenLoanOfficer(
      expectedAddressOfPyroToken,
      this.loanOfficer.address
    );
  });

  it("SetFeeExempt on EOA fails", async function () {
    const pyrotoken = await getNewPyroToken(
      this.liquidityReceiver,
      this.regularToken
    );
    await this.EYE.approve(this.snufferCap.address, "100000000000000000000000");
    //contract passes
    await this.snufferCap.snuff(pyrotoken, this.loanOfficer.address, 3);

    await expect(
      this.snufferCap.snuff(pyrotoken, owner.address, 3)
    ).to.be.revertedWith("LR: EOAs cannot be exempt.");
  });
  [0, 1].forEach((i) => {
    it("Non fee exempt contract charged all fees, EOA charged all fees", async function () {
      console.log("no fee run " + i);
      const pyrotokenAddress = await getNewPyroToken(
        this.liquidityReceiver,
        this.regularToken
      );
      const pyrotoken = await ethers.getContractAt(
        "PyroToken",
        pyrotokenAddress
      );
      await this.regularToken.approve(pyrotokenAddress, "1000000000000");
      await pyrotoken.mint(owner.address, "1000000000000");

      //EOA
      await pyrotoken.transfer(secondPerson.address, "10000000");
      const totalSupplyAfterTransfer = (
        await pyrotoken.totalSupply()
      ).toString();
      expect(totalSupplyAfterTransfer).to.equal("999999990000");

      await pyrotoken.redeem(owner.address, "10000000000");
      expect(await pyrotoken.totalSupply()).to.equal("999799990000");

      //Contract
      const PyroSender = await ethers.getContractFactory("PyroSender");
      const pyroSender = await PyroSender.deploy();

      if (i == 1) {
        await this.EYE.approve(
          this.snufferCap.address,
          "10000000000000000000000"
        );
        await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 0);
      }

      //send from EOA to contract
      await pyrotoken.transfer(pyroSender.address, "1000000000");
      expect(await pyrotoken.totalSupply()).to.equal("999798990000");

      //send from contract to EOA
      await pyroSender.send(pyrotoken.address, owner.address, "100000000");
      expect(await pyrotoken.totalSupply()).to.equal("999798890000");
      //send from contract to contract
      await pyroSender.send(
        pyrotoken.address,
        this.regularToken.address,
        "100000000"
      );
      expect(await pyrotoken.totalSupply()).to.equal("999798790000");

      //redeem from contract
      await pyroSender.redeem(pyrotoken.address, "100000000");
      expect(await pyrotoken.totalSupply()).to.equal("999796790000");
    });
  });

  it("SetFeeExempt on Contract passes for each scenario", async function () {
    const PyroSender = await ethers.getContractFactory("PyroSender");
    const pyroSender = await PyroSender.deploy();

    //create pyrotoken and send some to sender contract
    const pyrotokenAddress = await getNewPyroToken(
      this.liquidityReceiver,
      this.regularToken
    );
    const pyrotoken = await ethers.getContractAt("PyroToken", pyrotokenAddress);
    await this.regularToken.approve(pyrotokenAddress, "1000000000000");
    await pyrotoken.mint(owner.address, "1000000000000");
    await pyrotoken.transfer(pyroSender.address, "100000000");

    //prepare for snuffing
    await this.EYE.approve(
      this.snufferCap.address,
      "1000000000000000000000000"
    );

    // SENDER_EXEMPT
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 1);
    let totalSupplyBefore = BigInt((await pyrotoken.totalSupply()).toString());
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    let totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // SENDER_AND_RECEIVER_EXEMPT
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 2);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // REDEEM_EXEMPT_AND_SENDER_EXEMPT
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 3);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    await pyroSender.redeem(pyrotoken.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // REDEEM_EXEMPT_AND_SENDER_AND_RECEIVER_EXEMPT
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 4);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.send(pyrotoken.address, owner.address, "100000");
    await pyroSender.redeem(pyrotoken.address, "100000");
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // RECEIVER_EXEMPT
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 5);
    totalSupplyBefore = totalSupplyAfter;
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // REDEEM_EXEMPT_AND_RECEIVER_EXEMPT
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 6);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.redeem(pyrotoken.address, "100000");
    await pyrotoken.transfer(pyroSender.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());

    // REDEEM_EXEMPT_ONLY
    await this.snufferCap.snuff(pyrotokenAddress, pyroSender.address, 7);
    totalSupplyBefore = totalSupplyAfter;
    await pyroSender.redeem(pyrotoken.address, "100000");
    totalSupplyAfter = BigInt((await pyrotoken.totalSupply()).toString());
    expect(totalSupplyBefore.toString()).to.equal(totalSupplyAfter.toString());
  });
});

async function getNewPyroToken(liquidityReceiver: any, token: any) {
  await liquidityReceiver.registerPyroToken(token.address, "hello", "there");
  const pyrotoken = await liquidityReceiver.getPyroToken(token.address);
  return pyrotoken;
}

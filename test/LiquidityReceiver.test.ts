import { expect } from "chai";
import { ethers } from "hardhat";

describe("LiquidityReceiver", async function () {
  beforeEach(async function () {
    const [owner, secondPerson] = await ethers.getSigners();
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
});

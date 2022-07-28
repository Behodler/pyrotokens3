import { TestSet } from "../V2Migrator.test";
import { ArrangeFactory, CONSTANTS } from "./Common";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
export const Arrange = ArrangeFactory<TestSet>();

export async function t2Setup(SET: TestSet, owner: any, logger: any) {
  let [one, two, three] = await ethers.getSigners();
  let setOfUsers = [two, three];
  const getBalance = async () => await SET.PyroToken2.balanceOf(owner.address);
  const printBalance = async (i: number) =>
    logger(`i:${i} owner balance: ${await getBalance()}`);

  if (one.address != owner.address) throw "owner is not the first signer";
  for (let i = 0; i < setOfUsers.length; i++) {
    await printBalance(i);
    logger("signer " + setOfUsers[i].address);
    logger(
      `balanceOfBaseOnPyro2 before: ${await SET.BaseToken.balanceOf(
        SET.PyroToken2.address
      )}`
    );
    await SET.BaseToken.connect(setOfUsers[i]).mint(CONSTANTS.THOUSAND.mul(20));
    await SET.BaseToken.connect(setOfUsers[i]).approve(
      SET.PyroToken2.address,
      CONSTANTS.MAX
    );
    await printBalance(i);
    await SET.PyroToken2.connect(setOfUsers[i]).mint(CONSTANTS.THOUSAND);
    for (let j = 0; j < 200; j++) {
      const pyroBalanceBefore = await SET.PyroToken2.balanceOf(
        setOfUsers[i].address
      );
      const baseBalanceBefore = await SET.BaseToken.balanceOf(
        setOfUsers[i].address
      );

      await SET.PyroToken2.connect(setOfUsers[i]).redeem(
        pyroBalanceBefore.div(2)
      );

      const baseBalanceAfter = await SET.BaseToken.balanceOf(
        setOfUsers[i].address
      );
      const amountToMintUp = baseBalanceAfter.sub(baseBalanceBefore);

      await SET.PyroToken2.connect(setOfUsers[i]).mint(amountToMintUp);
    }
    await printBalance(i);
  }
  logger(
    "pyro 2 redeem rate " +
      (await (await SET.PyroToken2.redeemRate())
        .mul(1000)
        .div(CONSTANTS.ONE)
        .toNumber()) /
        1000
  );
}



export async function t3Setup(SET: TestSet, owner: any, logger: any) {
  let [one, two, three] = await ethers.getSigners();
  let setOfUsers = [two, three];
  const getBalance = async () => await SET.PyroToken2.balanceOf(owner.address);
  const printBalance = async (i: number) =>
    logger(`i:${i} owner balance: ${await getBalance()}`);

  if (one.address != owner.address) throw "owner is not the first signer";
  for (let i = 0; i < setOfUsers.length; i++) {
    await printBalance(i);
    logger("signer " + setOfUsers[i].address);
    logger(
      `balanceOfBaseOnPyro2 before: ${await SET.BaseToken.balanceOf(
        SET.PyroToken2.address
      )}`
    );
    await SET.BaseToken.connect(setOfUsers[i]).mint(CONSTANTS.THOUSAND.mul(20));
    await SET.BaseToken.connect(setOfUsers[i]).approve(
      SET.PyroToken2.address,
      CONSTANTS.MAX
    );
    await printBalance(i);
    await SET.PyroToken2.connect(setOfUsers[i]).mint(CONSTANTS.THOUSAND);
    for (let j = 0; j < 10; j++) {
      const pyroBalanceBefore = await SET.PyroToken2.balanceOf(
        setOfUsers[i].address
      );
      const baseBalanceBefore = await SET.BaseToken.balanceOf(
        setOfUsers[i].address
      );

      await SET.PyroToken2.connect(setOfUsers[i]).redeem(
        pyroBalanceBefore.div(2)
      );

      const baseBalanceAfter = await SET.BaseToken.balanceOf(
        setOfUsers[i].address
      );
      const amountToMintUp = baseBalanceAfter.sub(baseBalanceBefore);

      await SET.PyroToken2.connect(setOfUsers[i]).mint(amountToMintUp);
    }
    await printBalance(i);
  }
  logger(
    "pyro 2 redeem rate " +
      (await (await SET.PyroToken2.redeemRate())
        .mul(1000)
        .div(CONSTANTS.ONE)
        .toNumber()) /
        1000
  );
}

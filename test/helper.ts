import chalk from "chalk";
import { BigNumber, Contract, ContractFactory } from "ethers";

export async function deploy<T extends Contract>(
  contractFactory: ContractFactory,
  ...args: Array<any>
): Promise<T> {
  return (await contractFactory.deploy(...args)) as T;
}

export async function executionResult(
  transaction
): Promise<{ success: boolean; error: string }> {
  try {
    await transaction;
    return { success: true, error: "" };
  } catch (e: any) {
    console.log("error is of type " + typeof e);
    return { success: false, error: e };
  }
}

export async function queryChain<T>(
  query: Promise<T>
): Promise<{ success: boolean; error: string; result: T }> {
  let result;
  try {
    result = await query;
    return { success: true, error: "", result };
  } catch (e) {
    return { success: false, error: e as string, result };
  }
}

export const numberClose = (actual, expected) => {
  let expectedBig = BigInt(expected.toString());
  const actualBig = BigInt(actual.toString());
  const lower = (expectedBig / 100n) * 80n;
  const higher = (expectedBig * 120n) / 100n;
  const condition = lower < actualBig && higher > actualBig;
  if (!condition) {
    const perc = parseFloat(`${(actualBig * 10000n) / expectedBig}`) / 10000;
    console.log("actual percentage of expected: " + perc);
  }

  return condition;
};

export const almostEqual = (
  actual,
  expected,
  precision: number = 10000
): boolean => {
  const actualBig = BigNumber.from(actual.toString());
  const expectedBig = BigNumber.from(expected.toString());

  if (actualBig.gt(expectedBig)) {
    const difference = actualBig.sub(expectedBig);
    return difference.mul(precision).div(actualBig).lte(1);
  } else {
    const difference = expectedBig.sub(actualBig);
    return difference.mul(precision).div(expectedBig).lte(1);
  }
};

export const LogIf =
  (log: boolean, foreground?: boolean) => (message: string) => {
    if (log) {
      if (foreground) console.log(chalk.green(message));
      else console.log(chalk.dim(message));
    }
  };

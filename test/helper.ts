import { Contract, ContractFactory } from "ethers";

export async function deploy<T extends Contract>(contractFactory: ContractFactory,...args: Array<any>): Promise<T> {
    return await contractFactory.deploy(...args) as T;
  }
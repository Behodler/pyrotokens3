/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Pyrotoken, PyrotokenInterface } from "../Pyrotoken";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "baseToken",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "burnt",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "exempt",
        type: "address",
      },
    ],
    name: "approveNoBurnFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "config",
    outputs: [
      {
        internalType: "address",
        name: "liquidityReceiver",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "baseToken",
        type: "address",
      },
      {
        internalType: "bool",
        name: "noBurnEnabled",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "noBurnAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "redeem",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "redeemRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "noBurnEnabled",
        type: "bool",
      },
    ],
    name: "setNoBurn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "liquidityReceiver",
        type: "address",
      },
    ],
    name: "transferToNewLiquidityReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620030293803806200302983398181016040528101906200003791906200024e565b818181600390805190602001906200005192919062000115565b5080600490805190602001906200006a92919062000115565b5050506200007d6200010d60201b60201c565b600560000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600560010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505062000494565b600033905090565b82805462000123906200039f565b90600052602060002090601f01602090048101928262000147576000855562000193565b82601f106200016257805160ff191683800117855562000193565b8280016001018555821562000193579182015b828111156200019257825182559160200191906001019062000175565b5b509050620001a29190620001a6565b5090565b5b80821115620001c1576000816000905550600101620001a7565b5090565b6000620001dc620001d684620002ff565b620002d6565b905082815260208101848484011115620001f557600080fd5b6200020284828562000369565b509392505050565b6000815190506200021b816200047a565b92915050565b600082601f8301126200023357600080fd5b815162000245848260208601620001c5565b91505092915050565b6000806000606084860312156200026457600080fd5b600062000274868287016200020a565b935050602084015167ffffffffffffffff8111156200029257600080fd5b620002a08682870162000221565b925050604084015167ffffffffffffffff811115620002be57600080fd5b620002cc8682870162000221565b9150509250925092565b6000620002e2620002f5565b9050620002f08282620003d5565b919050565b6000604051905090565b600067ffffffffffffffff8211156200031d576200031c6200043a565b5b620003288262000469565b9050602081019050919050565b6000620003428262000349565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60005b83811015620003895780820151818401526020810190506200036c565b8381111562000399576000848401525b50505050565b60006002820490506001821680620003b857607f821691505b60208210811415620003cf57620003ce6200040b565b5b50919050565b620003e08262000469565b810181811067ffffffffffffffff821117156200040257620004016200043a565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b620004858162000335565b81146200049157600080fd5b50565b612b8580620004a46000396000f3fe608060405234801561001057600080fd5b50600436106101375760003560e01c806342966c68116100b857806379cc67901161007c57806379cc67901461037857806395d89b4114610394578063a457c2d7146103b2578063a9059cbb146103e2578063dd62ed3e14610412578063ef82516e1461044257610137565b806342966c68146102d45780634a4bff9a146102f05780636e285b941461030c57806370a082311461032857806379502c551461035857610137565b806323b872dd116100ff57806323b872dd146101f657806328b2427b14610226578063313ce56714610256578063395093511461027457806340c10f19146102a457610137565b806306fdde031461013c578063095ea7b31461015a5780630adcdbaa1461018a57806318160ddd146101a85780631e9a6950146101c6575b600080fd5b61014461045e565b6040516101519190612328565b60405180910390f35b610174600480360381019061016f9190611f67565b6104f0565b604051610181919061230d565b60405180910390f35b61019261050e565b60405161019f91906124aa565b60405180910390f35b6101b0610610565b6040516101bd91906124aa565b60405180910390f35b6101e060048036038101906101db9190611f67565b61061a565b6040516101ed91906124aa565b60405180910390f35b610210600480360381019061020b9190611f18565b610a42565b60405161021d919061230d565b60405180910390f35b610240600480360381019061023b9190611edc565b610c73565b60405161024d919061230d565b60405180910390f35b61025e610ca2565b60405161026b9190612517565b60405180910390f35b61028e60048036038101906102899190611f67565b610cab565b60405161029b919061230d565b60405180910390f35b6102be60048036038101906102b99190611f67565b610d57565b6040516102cb91906124aa565b60405180910390f35b6102ee60048036038101906102e99190611ff5565b61102e565b005b61030a60048036038101906103059190611eb3565b611042565b005b61032660048036038101906103219190611fa3565b61118c565b005b610342600480360381019061033d9190611eb3565b61123f565b60405161034f91906124aa565b60405180910390f35b610360611287565b60405161036f939291906122ad565b60405180910390f35b610392600480360381019061038d9190611f67565b6112ec565b005b61039c611367565b6040516103a99190612328565b60405180910390f35b6103cc60048036038101906103c79190611f67565b6113f9565b6040516103d9919061230d565b60405180910390f35b6103fc60048036038101906103f79190611f67565b6114e4565b604051610409919061230d565b60405180910390f35b61042c60048036038101906104279190611edc565b611649565b60405161043991906124aa565b60405180910390f35b61045c60048036038101906104579190611eb3565b6116d0565b005b60606003805461046d90612721565b80601f016020809104026020016040519081016040528092919081815260200182805461049990612721565b80156104e65780601f106104bb576101008083540402835291602001916104e6565b820191906000526020600020905b8154815290600101906020018083116104c957829003601f168201915b5050505050905090565b60006105046104fd611788565b8484611790565b6001905092915050565b600080600560010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161056f919061225b565b60206040518083038186803b15801561058757600080fd5b505afa15801561059b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105bf919061201e565b9050600060025414806105d25750600081145b156105e857670de0b6b3a764000091505061060d565b600254670de0b6b3a7640000826105ff91906125d5565b61060991906125a4565b9150505b90565b6000600254905090565b6000600560000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ece53132306040518263ffffffff1660e01b815260040161067a919061225b565b602060405180830381600087803b15801561069457600080fd5b505af11580156106a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106cc919061201e565b5060006106d761050e565b9050826000806106e5611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461072e919061262f565b925050819055508260026000828254610747919061262f565b925050819055506000606460028561075f91906125d5565b61076991906125a4565b905060076000610777611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16156108a25760009050600060076000610813611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b600081856108b0919061262f565b90506000670de0b6b3a764000082856108c991906125d5565b6108d391906125a4565b9050600073ffffffffffffffffffffffffffffffffffffffff166108f5611788565b73ffffffffffffffffffffffffffffffffffffffff167f9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc44888960405161093c9291906124ee565b60405180910390a3600560010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb88836040518363ffffffff1660e01b81526004016109a49291906122e4565b602060405180830381600087803b1580156109be57600080fd5b505af11580156109d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f69190611fcc565b610a35576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a2c9061242a565b60405180910390fd5b8094505050505092915050565b600080600760008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000610a8e611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1690508015610b7b576000600760008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000610b29611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b610b878585858461195b565b6000600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000610bd2611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905083811015610c52576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c49906123ca565b60405180910390fd5b610c6686610c5e611788565b868403611790565b6001925050509392505050565b60076020528160005260406000206020528060005260406000206000915091509054906101000a900460ff1681565b60006012905090565b6000610d4d610cb8611788565b848460016000610cc6611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610d48919061254e565b611790565b6001905092915050565b6000600560000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ece53132306040518263ffffffff1660e01b8152600401610db7919061225b565b602060405180830381600087803b158015610dd157600080fd5b505af1158015610de5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e09919061201e565b506000610e1461050e565b9050600560010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd610e5f611788565b30866040518463ffffffff1660e01b8152600401610e7f93929190612276565b602060405180830381600087803b158015610e9957600080fd5b505af1158015610ead573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ed19190611fcc565b610eda57600080fd5b6000600560010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401610f3a919061225b565b60206040518083038186803b158015610f5257600080fd5b505afa158015610f66573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f8a919061201e565b9050600082670de0b6b3a764000083610fa391906125d5565b610fad91906125a4565b9050610fb98682611b3d565b8573ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc4487600060405161101a9291906124c5565b60405180910390a380935050505092915050565b61103f611039611788565b82611c88565b50565b600560000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146110d5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110cc906123aa565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611145576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161113c9061234a565b60405180910390fd5b80600560000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600560000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461121f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611216906123aa565b60405180910390fd5b80600560010160146101000a81548160ff02191690831515021790555050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60058060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060010160149054906101000a900460ff16905083565b60006112ff836112fa611788565b611649565b905081811015611344576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161133b906123ea565b60405180910390fd5b61135883611350611788565b848403611790565b6113628383611c88565b505050565b60606004805461137690612721565b80601f01602080910402602001604051908101604052809291908181526020018280546113a290612721565b80156113ef5780601f106113c4576101008083540402835291602001916113ef565b820191906000526020600020905b8154815290600101906020018083116113d257829003601f168201915b5050505050905090565b60008060016000611408611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050828110156114c5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114bc9061246a565b60405180910390fd5b6114d96114d0611788565b85858403611790565b600191505092915050565b600080600760006114f3611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000611537611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050801561162b57600060076000611595611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006115d9611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b61163e611636611788565b85858461195b565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600560010160149054906101000a900460ff1615611785576001600760006116f6611788565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b50565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611800576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117f79061244a565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611870576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016118679061238a565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258360405161194e91906124aa565b60405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561199e576119998261102e565b611b37565b60008060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490506000826119fb576103e8846119f691906125a4565b6119fe565b60005b90508060026000828254611a12919061262f565b9250508190555060008185611a27919061262f565b90508483611a35919061262f565b6000808973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550806000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254611ac5919061254e565b925050819055508573ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff167f9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc448785604051611b2b9291906124ee565b60405180910390a35050505b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611bad576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611ba49061248a565b60405180910390fd5b8060026000828254611bbf919061254e565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254611c14919061254e565b925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc44836000604051611c7c9291906124c5565b60405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611cf8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611cef9061240a565b60405180910390fd5b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015611d7e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611d759061236a565b60405180910390fd5b8181036000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508160026000828254611dd5919061262f565b92505081905550600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc44846000604051611e3d9291906124c5565b60405180910390a3505050565b600081359050611e5981612b0a565b92915050565b600081359050611e6e81612b21565b92915050565b600081519050611e8381612b21565b92915050565b600081359050611e9881612b38565b92915050565b600081519050611ead81612b38565b92915050565b600060208284031215611ec557600080fd5b6000611ed384828501611e4a565b91505092915050565b60008060408385031215611eef57600080fd5b6000611efd85828601611e4a565b9250506020611f0e85828601611e4a565b9150509250929050565b600080600060608486031215611f2d57600080fd5b6000611f3b86828701611e4a565b9350506020611f4c86828701611e4a565b9250506040611f5d86828701611e89565b9150509250925092565b60008060408385031215611f7a57600080fd5b6000611f8885828601611e4a565b9250506020611f9985828601611e89565b9150509250929050565b600060208284031215611fb557600080fd5b6000611fc384828501611e5f565b91505092915050565b600060208284031215611fde57600080fd5b6000611fec84828501611e74565b91505092915050565b60006020828403121561200757600080fd5b600061201584828501611e89565b91505092915050565b60006020828403121561203057600080fd5b600061203e84828501611e9e565b91505092915050565b61205081612663565b82525050565b61205f81612675565b82525050565b61206e816126b8565b82525050565b61207d816126dc565b82525050565b600061208e82612532565b612098818561253d565b93506120a88185602086016126ee565b6120b1816127e0565b840191505092915050565b60006120c9603d8361253d565b91506120d4826127f1565b604082019050919050565b60006120ec60228361253d565b91506120f782612840565b604082019050919050565b600061210f60228361253d565b915061211a8261288f565b604082019050919050565b600061213260238361253d565b915061213d826128de565b604082019050919050565b600061215560288361253d565b91506121608261292d565b604082019050919050565b600061217860248361253d565b91506121838261297c565b604082019050919050565b600061219b60218361253d565b91506121a6826129cb565b604082019050919050565b60006121be60208361253d565b91506121c982612a1a565b602082019050919050565b60006121e160248361253d565b91506121ec82612a43565b604082019050919050565b600061220460258361253d565b915061220f82612a92565b604082019050919050565b6000612227601f8361253d565b915061223282612ae1565b602082019050919050565b612246816126a1565b82525050565b612255816126ab565b82525050565b60006020820190506122706000830184612047565b92915050565b600060608201905061228b6000830186612047565b6122986020830185612047565b6122a5604083018461223d565b949350505050565b60006060820190506122c26000830186612047565b6122cf6020830185612065565b6122dc6040830184612056565b949350505050565b60006040820190506122f96000830185612047565b612306602083018461223d565b9392505050565b60006020820190506123226000830184612056565b92915050565b600060208201905081810360008301526123428184612083565b905092915050565b60006020820190508181036000830152612363816120bc565b9050919050565b60006020820190508181036000830152612383816120df565b9050919050565b600060208201905081810360008301526123a381612102565b9050919050565b600060208201905081810360008301526123c381612125565b9050919050565b600060208201905081810360008301526123e381612148565b9050919050565b600060208201905081810360008301526124038161216b565b9050919050565b600060208201905081810360008301526124238161218e565b9050919050565b60006020820190508181036000830152612443816121b1565b9050919050565b60006020820190508181036000830152612463816121d4565b9050919050565b60006020820190508181036000830152612483816121f7565b9050919050565b600060208201905081810360008301526124a38161221a565b9050919050565b60006020820190506124bf600083018461223d565b92915050565b60006040820190506124da600083018561223d565b6124e76020830184612074565b9392505050565b6000604082019050612503600083018561223d565b612510602083018461223d565b9392505050565b600060208201905061252c600083018461224c565b92915050565b600081519050919050565b600082825260208201905092915050565b6000612559826126a1565b9150612564836126a1565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561259957612598612753565b5b828201905092915050565b60006125af826126a1565b91506125ba836126a1565b9250826125ca576125c9612782565b5b828204905092915050565b60006125e0826126a1565b91506125eb836126a1565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561262457612623612753565b5b828202905092915050565b600061263a826126a1565b9150612645836126a1565b92508282101561265857612657612753565b5b828203905092915050565b600061266e82612681565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60006126c3826126ca565b9050919050565b60006126d582612681565b9050919050565b60006126e7826126a1565b9050919050565b60005b8381101561270c5780820151818401526020810190506126f1565b8381111561271b576000848401525b50505050565b6000600282049050600182168061273957607f821691505b6020821081141561274d5761274c6127b1565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000601f19601f8301169050919050565b7f5079726f746f6b656e3a204e6577204c6971756964697479205265636569766560008201527f722063616e6e6f7420626520746865207a65726f20616464726573732e000000602082015250565b7f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60008201527f6365000000000000000000000000000000000000000000000000000000000000602082015250565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b7f5079726f746f6b656e3a204f6e6c79204c69717569646974792052656365697660008201527f65722e0000000000000000000000000000000000000000000000000000000000602082015250565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206160008201527f6c6c6f77616e6365000000000000000000000000000000000000000000000000602082015250565b7f45524332303a206275726e20616d6f756e74206578636565647320616c6c6f7760008201527f616e636500000000000000000000000000000000000000000000000000000000602082015250565b7f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360008201527f7300000000000000000000000000000000000000000000000000000000000000602082015250565b7f5079726f746f6b656e2072657365727665207472616e736665722066616c6564600082015250565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b612b1381612663565b8114612b1e57600080fd5b50565b612b2a81612675565b8114612b3557600080fd5b50565b612b41816126a1565b8114612b4c57600080fd5b5056fea264697066735822122017ef37aee774fe9d2cb62745601037f8ab06715b7e20599743ba11691404c57f64736f6c63430008040033";

export class Pyrotoken__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    baseToken: string,
    name_: string,
    symbol_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Pyrotoken> {
    return super.deploy(
      baseToken,
      name_,
      symbol_,
      overrides || {}
    ) as Promise<Pyrotoken>;
  }
  getDeployTransaction(
    baseToken: string,
    name_: string,
    symbol_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      baseToken,
      name_,
      symbol_,
      overrides || {}
    );
  }
  attach(address: string): Pyrotoken {
    return super.attach(address) as Pyrotoken;
  }
  connect(signer: Signer): Pyrotoken__factory {
    return super.connect(signer) as Pyrotoken__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PyrotokenInterface {
    return new utils.Interface(_abi) as PyrotokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Pyrotoken {
    return new Contract(address, _abi, signerOrProvider) as Pyrotoken;
  }
}
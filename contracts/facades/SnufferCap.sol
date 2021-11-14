// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Enums.sol";
import "./LiquidityReceiverLike.sol";

/*Snuffs out fees for given address */
abstract contract SnufferCap {
    LiquidityReceiverLike public _liquidityReceiver;

    constructor(address liquidityReceiver) {
        _liquidityReceiver = LiquidityReceiverLike(liquidityReceiver);
    }

    function snuff (address pyrotoken, address targetContract, FeeExemption exempt) public virtual returns (bool);

    //after perfroming business logic, call this function
    function _snuff(address pyrotoken, address targetContract, FeeExemption exempt)
        internal
        virtual
    {
        _liquidityReceiver.setFeeExemptionStatusOnPyroForContract(pyrotoken,targetContract,exempt);
    }
}

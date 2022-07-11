// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Enums.sol";
import "./LiquidityReceiverLike.sol";

/**
 *@author Justin Goro
 *@notice Snuffer caps are gatekeeper contracts for applying logic to the exemption of pyrotoken fee payment.
 *The SnufferCap is asigned on the LiquidityReceiver level which means all PyroTokens conform to the same snuffer cap at any one time 
 */
abstract contract SnufferCap {
    LiquidityReceiverLike public _liquidityReceiver;

    constructor(address liquidityReceiver) {
        _liquidityReceiver = LiquidityReceiverLike(liquidityReceiver);
    }

    function snuff (address pyroToken, address targetContract, FeeExemption exempt) public virtual returns (bool);

    //after perfroming business logic, call this function
    function _snuff(address pyroToken, address targetContract, FeeExemption exempt)
        internal
    {
        _liquidityReceiver.setFeeExemptionStatusOnPyroForContract(pyroToken,targetContract,exempt);
    }
}

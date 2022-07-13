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

    modifier completeSnuff(
        address pyroToken,
        address targetContract,
        FeeExemption exempt
    ) {
        _;
        _snuff(pyroToken, targetContract, exempt);
    }

    /**
 *@dev Implement this function for all business logic prior to calling snuff. 
 For simplicity, decorate your implementation with the completeSnuff modifier.
 @param pyroToken the pyrotoken for which a fee is being turned off
 @param targetContract the contract that will be exempted.
 @param exempt the type of exemption
 */
    function snuff(
        address pyroToken,
        address targetContract,
        FeeExemption exempt
    ) public virtual returns (bool);

    ///@dev after perfroming business logic, call this function or decorate with the completeSnuff modifier.
    function _snuff(
        address pyroToken,
        address targetContract,
        FeeExemption exempt
    ) internal {
        _liquidityReceiver.setFeeExemptionStatusOnPyroForContract(
            pyroToken,
            targetContract,
            exempt
        );
    }
}

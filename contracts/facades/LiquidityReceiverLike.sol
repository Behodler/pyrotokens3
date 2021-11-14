// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Enums.sol";

abstract contract LiquidityReceiverLike {
    function setFeeExemptionStatusOnPyroForContract(
        address pyroToken,
        address target,
        FeeExemption exemption
    ) public virtual;
}

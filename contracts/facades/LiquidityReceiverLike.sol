// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./Enums.sol";

abstract contract LiquidityReceiverLike {
    function setFeeExemptionStatusOnPyroForContract(
        address pyroToken,
        address target,
        FeeExemption exemption
    ) public virtual;

    function setPyroTokenLoanOfficer(address pyroToken, address loanOfficer)
        public
        virtual;

    function getPyroToken(address baseToken)
        public
        view
        virtual
        returns (address);

    function registerPyroToken(
        address baseToken,
        string memory name,
        string memory symbol
    ) public virtual;

    function drain(address baseToken) external virtual returns (uint);
}

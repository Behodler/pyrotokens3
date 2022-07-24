// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../ERC20/IERC20.sol";

abstract contract PyroTokenLike is IERC20 {
    function config()
        public
        view
        virtual
        returns (
            address,
            IERC20,
            address,
            bool
        );

    function redeem(address to, uint256 pyroTokenAmount)
        external
        virtual
        returns (uint256);

    function mint(address to, uint256 baseTokenAmount)
        external
        payable
        virtual
        returns (uint256);

    function redeemRate() public view virtual returns (uint256);

    function redeemFrom(
        address owner,
        address recipient,
        uint256 amount
    ) external virtual returns (uint256);

    function setLoanOfficer(address loanOfficer) external virtual;

    function togglePullPendingFeeRevenue(bool pullPendingFeeRevenue)
        external
        virtual;

    function setObligationFor(
        address borrower,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked
    ) external virtual returns (bool);

     function calculateRedemptionFee(uint256 amount, address redeemer)
        public
        virtual
        view
        returns (uint256);
}

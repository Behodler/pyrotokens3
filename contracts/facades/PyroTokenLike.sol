// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;
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

    function setLoanOfficer(address loanOfficer) external virtual;

    function togglePullPendingFeeRevenue(bool pullPendingFeeRevenue)
        external
        virtual;

    function setObligationFor(
        address borrower,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked,
        uint256 slashBasisPoints
    ) external virtual returns (bool);

    function calculateRedemptionFee(uint256 amount, address redeemer)
        public
        view
        virtual
        returns (uint256);

    function calculateTransferFee(
        uint256 amount,
        address sender,
        address receiver
    ) public view virtual returns (uint256);

    function burn(uint256 amount) public virtual;
}

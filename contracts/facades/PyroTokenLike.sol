// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./IERC20.sol";

abstract contract PyroTokenLike is IERC20 {
    address public baseToken;

    function redeem(address to, uint256 pyroTokenAmount) external virtual returns (uint256);

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
    ) external virtual returns (uint256) ;
}
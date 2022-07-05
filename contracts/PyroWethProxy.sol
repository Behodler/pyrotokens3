// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./facades/PyroTokenLike.sol";
import "./facades/IWETH10.sol";
import "./facades/IERC20.sol";
import "./facades/Ownable.sol";

contract PyroWethProxy is Ownable {
    IWETH10 public weth10;
    uint256 private constant ONE = 1e18;
    bool private unlocked = true;
    PyroTokenLike public pyroWeth;
    
    modifier reentrancyGuard() {
        require(unlocked, "PyroProxy: reentrancy guard");
        unlocked = false;
        _;
        unlocked = true;
    }

    constructor(address _pyroWeth) {
        pyroWeth = PyroTokenLike(_pyroWeth);
        weth10 = IWETH10(pyroWeth.baseToken());
        weth10.approve(_pyroWeth, type(uint).max);
    }

    function balanceOf(address holder) external view returns (uint256) {
        return pyroWeth.balanceOf(holder);
    }

    function redeem(uint256 pyroTokenAmount)
        external
        reentrancyGuard
        returns (uint256)
    {
        pyroWeth.redeemFrom(msg.sender, address(this),pyroTokenAmount);
        uint256 balanceOfWeth = IERC20(weth10).balanceOf(address(this));
        weth10.withdrawTo(payable(msg.sender), balanceOfWeth);
        return balanceOfWeth;
    }

    function mint(uint256 baseTokenAmount)
        external
        payable
        reentrancyGuard
        returns (uint256)
    {
        require(
            msg.value == baseTokenAmount && baseTokenAmount > 0,
            "PyroWethProxy: amount invariant"
        );
        weth10.deposit{value: msg.value}();
        uint256 weth10Balance = IERC20(weth10).balanceOf(address(this));
        return pyroWeth.mint(msg.sender, weth10Balance);
    }
}

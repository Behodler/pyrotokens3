// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "../facades/Enums.sol";
import "../facades/SnufferCap.sol";
import "../facades/IERC20.sol";

abstract contract Burnable is IERC20 {
    function burn (uint value) public virtual;
}

contract BurnEYESnufferCap is SnufferCap {
    Burnable eye;

    constructor(address EYE, address receiver) SnufferCap(receiver) {
        eye = Burnable(EYE);
    }

    function snuff(
        address pyrotoken,
        address targetContract,
        FeeExemption exempt
    ) public override returns (bool) {
        require(eye.transferFrom(msg.sender,address(this), 1000 * (1 ether)),"ERC20: transfer failed.");
        uint balance = eye.balanceOf(address(this));
        eye.burn(balance);
        _snuff(pyrotoken, targetContract, exempt);
        return true;
    }
}

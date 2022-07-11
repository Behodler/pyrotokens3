// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../facades/Enums.sol";
import "../facades/SnufferCap.sol";
import "../ERC20/IERC20.sol";

abstract contract Burnable is IERC20 {
    function burn(uint256 value) public virtual;
}

/**
 *@author Justin Goro
 *@notice demonstration of a snuffer cap that charges 1000 EYE to exempt a contract from paying a particular fee. The EYE is burnt.
 */
contract BurnEYESnufferCap is SnufferCap {
    Burnable eye;

    constructor(address EYE, address receiver) SnufferCap(receiver) {
        eye = Burnable(EYE);
    }

    /**
     *@notice anyone willing to pay 1000 EYE can call this for any contract. Probably not ideal to deploy this contract as
     * there may be good business case reasons for wanting to keep the burn.
     *@param pyroToken contract of pyroToken for which the fee exemption applies
     *@param targetContract contract that will not pay fee.
     */
    function snuff(
        address pyroToken,
        address targetContract,
        FeeExemption exempt
    ) public override returns (bool) {
        eye.transferFrom(msg.sender, address(this), 1000 * (1 ether));
        uint256 balance = eye.balanceOf(address(this));
        eye.burn(balance);
        _snuff(pyroToken, targetContract, exempt);
        return true;
    }
}

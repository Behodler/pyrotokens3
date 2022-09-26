// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../facades/TokenProxyBaseLike.sol";
import "../ERC20/ERC20.sol";
import "hardhat/console.sol";

contract MockProxy is TokenProxyBaseLike, ERC20 {
    address private immutable _baseToken;
    uint256 constant ONE = 1e18;

    function baseToken() public view override returns (address) {
        return _baseToken;
    }

    constructor(address base) {
        _baseToken = base;
    }

    function mint(
        address proxyRecipient,
        address baseSource,
        uint256 amount
    ) public override returns (uint256 proxy) {
        ERC20(_baseToken).transferFrom(baseSource, address(this), amount);
        proxy = amount / 2;
        _mint(proxyRecipient, proxy);
    }

    function redeemRate() public view override returns (uint256) {
        uint256 ts = totalSupply();
        if (ts == 0) return ONE;
        return (IERC20(_baseToken).balanceOf(address(this)) * ONE) / ts;
    }

    function redeem(
        address proxySource,
        address baseRecipient,
        uint256 amount
    ) public override returns (uint256 baseAmount) {
        baseAmount = (amount * redeemRate()) / ONE;
        _burn(proxySource, amount);
        ERC20(_baseToken).transfer(baseRecipient, baseAmount);
    }

    function transfer(address recipient, uint256 amount)
        external
        override
        returns (bool)
    {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }
        _transfer(sender, recipient, amount);
        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        _balances[sender] -= amount;
        _balances[recipient] += amount;
    }
}

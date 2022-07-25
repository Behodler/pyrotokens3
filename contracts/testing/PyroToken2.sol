// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../ERC20/ERC20.sol";

contract PyroToken2 is ERC20 {
    address _baseToken;

    constructor(address base) {
        _baseToken = base;
    }

    uint256 constant ONE = 1e18;

    function mint(uint256 baseTokenAmount) external returns (uint256) {
        uint256 rate = redeemRate();
        uint256 pyroTokensToMint = (baseTokenAmount * ONE) / (rate);
        require(
            IERC20(_baseToken).transferFrom(
                msg.sender,
                address(this),
                baseTokenAmount
            ),
            "PYROTOKEN: baseToken transfer failed."
        );
        _mint(msg.sender, pyroTokensToMint);

        return pyroTokensToMint;
    }

    function redeem(uint256 pyroTokenAmount) external returns (uint256) {
        //no approval necessary
        _balances[msg.sender] = _balances[msg.sender] - pyroTokenAmount;
        uint256 rate = redeemRate();
        _totalSupply = _totalSupply - pyroTokenAmount;
        uint256 exitFee = (pyroTokenAmount * 2) / (100); //2% burn on exit pushes up price for remaining hodlers
        uint256 net = pyroTokenAmount - exitFee;
        uint256 baseTokensToRelease = (rate * net) / (ONE);
        IERC20(_baseToken).transfer(msg.sender, baseTokensToRelease);
        return baseTokensToRelease;
    }

    function redeemRate() public view returns (uint256) {
        uint256 balanceOfBase = IERC20(_baseToken).balanceOf(address(this));
        if (_totalSupply == 0 || balanceOfBase == 0) return ONE;

        return (balanceOfBase - ONE) - (_totalSupply);
    }

    function baseToken() public view returns (address) {
        return _baseToken;
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
        uint256 fee = amount / 1000;
        _balances[sender] -= amount;
        _balances[recipient] += amount - fee;
        _totalSupply -= fee;
        emit Transfer(sender, recipient, amount);
    }
}

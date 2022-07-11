// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./facades/PyroTokenLike.sol";
import "./facades/IWETH10.sol";
import "./ERC20/IERC20.sol";
import "./facades/Ownable.sol";

/**
 *@author Justin Goro
 *@notice Eth->Weth->PyroWeth and reverse in one tx. Simplifies UI of working with Eth.
 */
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
        weth10.approve(_pyroWeth, type(uint256).max);
    }

    /**
     *@notice PyroWeth balance of holder
     *@param holder address of PyroWeth holder
     */
    function balanceOf(address holder) external view returns (uint256) {
        return pyroWeth.balanceOf(holder);
    }

    /**
     *@notice redeems PyroWeth for native token (Eth on mainnet)
     *@param pyroTokenAmount amount of pyrotokens to redeem from msg.sender.
     */
    function redeem(uint256 pyroTokenAmount)
        external
        reentrancyGuard
        returns (uint256)
    {
        pyroWeth.redeemFrom(msg.sender, address(this), pyroTokenAmount);
        uint256 balanceOfWeth = IERC20(weth10).balanceOf(address(this));
        weth10.withdrawTo(payable(msg.sender), balanceOfWeth);
        return balanceOfWeth;
    }

  /**
     *@notice mints PyroWeth from a given amount of native token (ETH on mainnet)
     *@param baseTokenAmount amount of native token to use in minting PyroWeth from msg.sender.
     */
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

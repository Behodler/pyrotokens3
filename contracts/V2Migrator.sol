// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./facades/IERC20.sol";
import "./facades/PyroTokenLike.sol";

/*unwraps Pyrotoken V2 and mints up Pyrotoken V3*/
abstract contract LROld {
    function baseTokenMapping(address baseToken)
        public
        virtual
        returns (address);
}

abstract contract Pyrotoken2 is IERC20 {
    function redeem(uint256 pyroTokenAmount) external virtual returns (uint256);

    function baseToken() public view virtual returns (address);
}

abstract contract LRNew {
    function getPyrotoken(
        address baseToken,
        string memory name,
        string memory symbol
    ) public view virtual returns (address);
}

contract V2Migrator {
    LROld public LR_old;
    LRNew public LR_new;

    constructor(address lr_old, address lr_new) {
        LR_old = LROld(lr_old);
        LR_new = LRNew(lr_new);
    }

    function migrate(
        address ptoken2,
        address ptoken3,
        string memory nameNew,
        string memory symbolNew,
        uint256 p2token_amount,
        uint256 p3token_expectedAmount
    ) public {
        //GET NEW PYROTOKEN CONTRACT
        Pyrotoken2 pyrotoken2 = Pyrotoken2(ptoken2);
        address commonBaseToken = pyrotoken2.baseToken();
        address expectedPyroToken3 = LR_new.getPyrotoken(
            commonBaseToken,
            nameNew,
            symbolNew
        );
        require(expectedPyroToken3 == ptoken3, "V2Migrate: invalid pyrotoken contract.");
        
        //REDEEM OLD PYROTOKENS
        pyrotoken2.transferFrom(msg.sender, address(this), p2token_amount);
        pyrotoken2.redeem(p2token_amount);
        uint256 commonBaseBalance = IERC20(commonBaseToken).balanceOf(
            address(this)
        );

        //MINT NEW PYROTOKENS
        PyroTokenLike pyroToken3 = PyroTokenLike(expectedPyroToken3);
        uint256 p3BalanceBefore = pyroToken3.balanceOf(msg.sender);
        pyroToken3.mint(msg.sender, commonBaseBalance);
        uint256 p3BalanceAfter = pyroToken3.balanceOf(msg.sender);

        //CHECK MINTING SUCCEEDED
        require(
            p3BalanceAfter == p3BalanceBefore + p3token_expectedAmount,
            "V2Migrate: Invariant failure."
        );
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./facades/IERC20.sol";
import "./facades/PyroTokenLike.sol";

/*unwraps Pyrotoken V2 and mints up Pyrotoken V3*/

abstract contract Pyrotoken2 is IERC20 {
    function redeem(uint256 pyroTokenAmount) external virtual returns (uint256);

    function baseToken() public view virtual returns (address);
}

abstract contract LRNew {
    function getPyrotoken(address baseToken)
        public
        view
        virtual
        returns (address);
}

contract V2Migrator {
    LRNew public LR_new;

    constructor(address lr_new) {
        LR_new = LRNew(lr_new);
    }

    function migrate(
        address ptoken2,
        address ptoken3,
        uint256 p2token_amount,
        uint256 p3token_expectedAmount
    ) public {
        _migrate(
            msg.sender,
            ptoken2,
            ptoken3,
            p2token_amount,
            p3token_expectedAmount
        );
    }

    function migrateMany(
        address[] memory ptoken2,
        address[] memory ptoken3,
        uint256[] memory p2token_amount,
        uint256[] memory p3token_expectedAmount
    ) public {
        for (uint256 i = 0; i < ptoken2.length; i++) {
            _migrate(
                msg.sender,
                ptoken2[i],
                ptoken3[i],
                p2token_amount[i],
                p3token_expectedAmount[i]
            );
        }
    }

    function _migrate(
        address sender,
        address ptoken2,
        address ptoken3,
        uint256 p2token_amount,
        uint256 p3token_expectedAmount
    ) internal {
        //GET NEW PYROTOKEN CONTRACT
        Pyrotoken2 pyrotoken2 = Pyrotoken2(ptoken2);
        address commonBaseToken = pyrotoken2.baseToken();
        address expectedPyroToken3 = LR_new.getPyrotoken(commonBaseToken);
        require(
            expectedPyroToken3 == ptoken3,
            "V2Migrate: invalid pyrotoken contract."
        );

        //REDEEM OLD PYROTOKENS
        pyrotoken2.transferFrom(sender, address(this), p2token_amount);
        uint ptoken2Balance = pyrotoken2.balanceOf(address(this));
        pyrotoken2.redeem(ptoken2Balance);
        uint256 commonBaseBalance = IERC20(commonBaseToken).balanceOf(
            address(this)
        );

        //MINT NEW PYROTOKENS
        PyroTokenLike pyroToken3 = PyroTokenLike(expectedPyroToken3);
        uint256 p3BalanceBefore = pyroToken3.balanceOf(sender);
        pyroToken3.mint(sender, commonBaseBalance);
        uint256 p3BalanceAfter = pyroToken3.balanceOf(sender);

        //CHECK MINTING SUCCEEDED
        require(
            p3BalanceAfter == p3BalanceBefore + p3token_expectedAmount,
            "V2Migrate: Invariant failure."
        );
    }
}

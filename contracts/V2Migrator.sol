// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./ERC20/IERC20.sol";
import "./facades/PyroTokenLike.sol";
import "./Errors.sol";

abstract contract PyroToken2 is IERC20 {
    function redeem(uint256 pyroTokenAmount) external virtual returns (uint256);

    function baseToken() public view virtual returns (address);
}

///@notice interface for V3 Liquidity Receiver.
abstract contract LRNew {
    function getPyroToken(address baseToken)
        public
        view
        virtual
        returns (address);
}

/**
 *@notice unwraps PyroToken V2 and mints up PyroToken V3
 *@author Justin Goro
 */
contract V2Migrator {
    /**
     *@param pyroToken2 contract that needs to be migratid
     *@param pyroToken2 destination token
     *@param pyroToken2Amount amount of pyroToken2 to migrate
     *@param pyroToken3Amount expected amount of pyroToken3 after exit fee
     */
    event SuccessfulMigration(
        address indexed pyroToken2,
        address indexed pyroToken3,
        uint256 pyroToken2Amount,
        uint256 pyroToken3Amount
    );
    LRNew public LR_new;

    constructor(address lr_new) {
        LR_new = LRNew(lr_new);
    }

    /**
     *@notice public migration entry point
     *@param ptoken2 version 2 PyroToken contract
     *@param ptoken3 version 3 PyroToken contract
     *@param p2tokenAmount amount of ptoken2 to migrate
     *@param p3tokenExpectedAmount expected amount of ptoken3 to receive after migration
     */
    function migrate(
        address ptoken2,
        address ptoken3,
        uint256 p2tokenAmount,
        uint256 p3tokenExpectedAmount
    ) public {
        _migrate(
            msg.sender,
            ptoken2,
            ptoken3,
            p2tokenAmount,
            p3tokenExpectedAmount
        );
    }

    /**
     *@notice batch migrate many PyroTokens
     *@param ptoken2 version 2 PyroToken contracts
     *@param ptoken3 version 3 PyroToken contracts
     *@param p2tokenAmount amounts of ptoken2 to migrate
     *@param p3tokenExpectedAmount expected amounts of ptoken3 to receive after migration
     */
    function migrateMany(
        address[] memory ptoken2,
        address[] memory ptoken3,
        uint256[] memory p2tokenAmount,
        uint256[] memory p3tokenExpectedAmount
    ) public {
        for (uint256 i = 0; i < ptoken2.length; i++) {
            _migrate(
                msg.sender,
                ptoken2[i],
                ptoken3[i],
                p2tokenAmount[i],
                p3tokenExpectedAmount[i]
            );
        }
    }

    function _migrate(
        address sender,
        address ptoken2,
        address ptoken3,
        uint256 p2tokenAmount,
        uint256 p3tokenExpectedAmount
    ) internal {
        //GET NEW PYROTOKEN CONTRACT
        PyroToken2 pyroToken2 = PyroToken2(ptoken2);
        address commonBaseToken = pyroToken2.baseToken();
        address expectedPyroToken3 = LR_new.getPyroToken(commonBaseToken);

        //Extra safety required in migration contracts
        if(expectedPyroToken3!= ptoken3){
            revert AddressPredictionInvariant(ptoken3, expectedPyroToken3);
        }

        //REDEEM OLD PYROTOKENS
        pyroToken2.transferFrom(sender, address(this), p2tokenAmount);
        uint256 ptoken2Balance = pyroToken2.balanceOf(address(this));
        pyroToken2.redeem(ptoken2Balance);
        uint256 commonBaseBalance = IERC20(commonBaseToken).balanceOf(
            address(this)
        );

        //MINT NEW PYROTOKENS
        PyroTokenLike pyroToken3 = PyroTokenLike(expectedPyroToken3);
        uint256 p3BalanceBefore = pyroToken3.balanceOf(sender);
        pyroToken3.mint(sender, commonBaseBalance);
        uint256 p3BalanceAfter = pyroToken3.balanceOf(sender);

        //CHECK MINTING SUCCEEDED
        // >= instead of == prevents malicious griefing
        if(p3BalanceAfter<p3BalanceBefore+p3tokenExpectedAmount){
            revert P3AmountInvariant (p3BalanceAfter, p3BalanceBefore, p3tokenExpectedAmount);
        }
        emit SuccessfulMigration(
            ptoken2,
            expectedPyroToken3,
            p2tokenAmount,
            p3tokenExpectedAmount
        );
    }
}

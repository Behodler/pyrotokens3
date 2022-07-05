// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "../facades/PyroTokenLike.sol";


contract SimpleLoanOfficer {

    function setObligationFor(
        address pyroToken,
        address borrower,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked
    ) external returns (bool) {
        return
            PyroTokenLike(pyroToken).setObligationFor(
                borrower,
                baseTokenBorrowed,
                pyroTokenStaked
            );
    }
}

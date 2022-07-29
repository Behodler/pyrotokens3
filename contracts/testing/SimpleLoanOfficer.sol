// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../facades/PyroTokenLike.sol";


contract SimpleLoanOfficer {

    function setObligationFor(
        address pyroToken,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked,
        uint slashBP
    ) external returns (bool) {
        return
            PyroTokenLike(pyroToken).setObligationFor(
                msg.sender,
                baseTokenBorrowed,
                pyroTokenStaked,
                slashBP
            );
    }
}

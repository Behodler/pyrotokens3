// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../facades/PyroTokenLike.sol";
import "../Errors.sol";

contract SimpleLoanOfficer {
    uint256 constant ONE = 1e18;

    function setObligationFor(
        address pyroToken,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked,
        uint256 slashBP
    ) external returns (bool) {
        uint256 pryoEquivalent = (baseTokenBorrowed /
            PyroTokenLike(pyroToken).redeemRate()) * ONE;
        if (pyroTokenStaked > 0 && pryoEquivalent == pyroTokenStaked) {
            revert InfiniteLeverageForbidden(pryoEquivalent, pyroTokenStaked);
        }
        return
            PyroTokenLike(pyroToken).setObligationFor(
                msg.sender,
                baseTokenBorrowed,
                pyroTokenStaked,
                slashBP
            );
    }

    function unsafeSetObligationFor(
        address pyroToken,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked,
        uint256 slashBP
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

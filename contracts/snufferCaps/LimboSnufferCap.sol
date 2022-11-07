// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../facades/Enums.sol";
import "../facades/SnufferCap.sol";
import "../ERC20/IERC20.sol";

abstract contract ProposalFactoryLike {
    function whitelistedProposalContracts(address proposal)
        public
        view
        virtual
        returns (bool);

    function DAO() public view virtual returns (address);
}

abstract contract LimboDAOLike {
    function currentProposalState()
        public
        view
        virtual
        returns (
            int256 fate,
            uint256 decision, //1 is approved
            address proposer,
            uint256 start,
            address proposal
        );
}

error LimboSnufferCapFailure(address sender, uint256 currentProposalDecision);

/**
 *@author Justin Goro
 *@notice Snuffercap controlled by valid LimboDAO proposals.
 *@dev The unit test for this is in the limbo repo
 */
contract LimboSnufferCap is SnufferCap {
    struct LimboContracts {
        ProposalFactoryLike proposalFactory;
        LimboDAOLike DAO;
    }

    LimboContracts limbo;

    constructor(address proposalFactory, address liquidityReceiver)
        SnufferCap(liquidityReceiver)
    {
        limbo.proposalFactory = ProposalFactoryLike(proposalFactory);
        limbo.DAO = LimboDAOLike(limbo.proposalFactory.DAO());
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
    )
        public
        override
        completeSnuff(pyroToken, targetContract, exempt)
        returns (bool)
    {
        (, uint256 decision, , , address proposal) = limbo
            .DAO
            .currentProposalState();

        if (
            !(msg.sender == proposal &&
                decision == 1 &&
                limbo.proposalFactory.whitelistedProposalContracts(proposal))
        ) {
            revert LimboSnufferCapFailure(msg.sender, decision);
        }
        return true;
    }
}

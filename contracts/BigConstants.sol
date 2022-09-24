// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./PyroToken.sol";
import "./RebaseWrapper.sol";

contract BigConstants {
        bytes public constant PYROTOKEN_BYTECODE = type(PyroToken).creationCode;

        constructor(){

        }

        function deployRebaseWrapper (address pyroTokenAddress) external returns (address){
            return address(new RebaseWrapper(pyroTokenAddress));
        }
}
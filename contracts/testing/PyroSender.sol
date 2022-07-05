// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../facades/LachesisLike.sol";
import "../facades/PyroTokenLike.sol";
contract PyroSender {
    function send(address PyroToken,address recipient, uint amount) public returns (bool success) {
        return PyroTokenLike(PyroToken).transfer(recipient, amount);
    }

    function redeem(address pyro, uint amount) public {
        PyroTokenLike(pyro).redeem(address(this), amount);
    }
}
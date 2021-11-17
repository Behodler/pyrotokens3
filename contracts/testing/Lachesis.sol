// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../facades/LachesisLike.sol";

contract Lachesis is LachesisLike {
    mapping(address=>bool [2]) public status;
      function cut(address token) public override view returns (bool, bool){
          return (status[token][0], status[token][1]);
      }
    function measure (address token, bool valid, bool burnable) public override  {
        status[token][0] = valid;
        status[token][1] = burnable;
    }
}
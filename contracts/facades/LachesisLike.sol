// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

abstract contract LachesisLike {
    function cut(address token) public view virtual returns (bool, bool);
    function measure (address token, bool valid, bool burnable) public virtual;
}

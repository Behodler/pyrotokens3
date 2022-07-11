// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//LOW LEVEL
error InvocationFailure(address recipient);
error NotAContract(address target);

//ERC20
error ApproveToNonZero(address token, address spender, uint256 amount);
error InsufficinetFunds(uint256 balance, uint256 value);
error AllowanceExceeded(uint256 allowance, uint256 amount);
error AllowanceUnderflow(uint256 allowance, uint256 subtraction);
error OperationFailure();

//PyroToken
error StakeFailedInsufficientBalance(uint256 stake, uint256 userPyroBalance);

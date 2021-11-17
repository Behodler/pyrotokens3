// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./PyroToken.sol";
import "./facades/SnufferCap.sol";
import "./facades/Ownable.sol";
import "./facades/PyroTokenLike.sol";
import "./facades/LachesisLike.sol";
import "hardhat/console.sol";

// library Create2 {
//     /**
//      * @dev Deploys a contract using `CREATE2`. The address where the contract
//      * will be deployed can be known in advance via {computeAddress}.
//      *
//      * The bytecode for a contract can be obtained from Solidity with
//      * `type(contractName).creationCode`.
//      *
//      * Requirements:
//      *
//      * - `bytecode` must not be empty.
//      * - `salt` must have not been used for `bytecode` already.
//      * - the factory must have a balance of at least `amount`.
//      * - if `amount` is non-zero, `bytecode` must have a `payable` constructor.
//      */
//     function deploy(uint256 amount, bytes32 salt) internal returns (address) {
//         bytes memory bytecode = getBytecode();
//         address addr;
//         require(
//             address(this).balance >= amount,
//             "Create2: insufficient balance"
//         );
//         require(bytecode.length != 0, "Create2: bytecode length is zero");
//         console.log("this: %s", address(this));
//         addr = address(new PyroToken{salt: salt}());
//         // assembly {
//         //     addr := create2(amount, add(bytecode, 0x20), mload(bytecode), salt)
//         // }
//         require(addr != address(0), "Create2: Failed on deploy");
//         return addr;
//     }

//     /**
//      * @dev Returns the address where a contract will be stored if deployed via {deploy}. Any change in the
//      * `bytecodeHash` or `salt` will result in a new destination address.
//      */
//     function computeAddress(bytes32 salt) internal view returns (address) {
//         return computeAddress(salt, address(this));
//     }

//     /**
//      * @dev Returns the address where a contract will be stored if deployed via {deploy} from a contract located at
//      * `deployer`. If `deployer` is this contract's address, returns the same value as {computeAddress}.
//      */
//     function computeAddress(bytes32 salt, address deployer)
//         internal
//         pure
//         returns (address)
//     {
//         bytes32 bytecodeHash = keccak256(getBytecode());
//         bytes32 _data = keccak256(
//             abi.encode(bytes1(0xff), deployer, salt, bytecodeHash)
//         );
//         return address(uint160(uint256(_data)));
//     }

//     function getBytecode() public pure returns (bytes memory) {
//         bytes memory bytecode = type(PyroToken).creationCode;

//         return abi.encode(bytecode);
//     }
// }


library Create2 {
    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract
     * will be deployed can be known in advance via {computeAddress}. Note that
     * a contract cannot be deployed twice using the same salt.
     */
    function deploy(bytes32 salt, bytes memory bytecode) internal returns (address) {
        address addr;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
        return addr;
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy}. Any change in the `bytecode`
     * or `salt` will result in a new destination address.
     */
    function computeAddress(bytes32 salt, bytes memory bytecode) internal view returns (address) {
        return computeAddress(salt, bytecode, address(this));
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy} from a contract located at
     * `deployer`. If `deployer` is this contract's address, returns the same value as {computeAddress}.
     */
    function computeAddress(bytes32 salt, bytes memory bytecodeHash, address deployer) internal pure returns (address) {
        bytes32 bytecodeHashHash = keccak256(bytecodeHash);
        bytes32 _data = keccak256(
            abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHashHash)
        );
        return address(bytes20(_data << 96));
    }
}

contract LiquidityReceiver is Ownable {
    struct Configuration {
        LachesisLike lachesis;
        SnufferCap snufferCap;
    }
    Configuration public config;

    modifier onlySnufferCap() {
        require(
            msg.sender != address(config.snufferCap),
            "LR: only snufferCap"
        );
        _;
    }

    constructor(address _lachesis) {
        config.lachesis = LachesisLike(_lachesis);
    }

    function setSnufferCap(address snufferCap) public onlyOwner {
        config.snufferCap = SnufferCap(snufferCap);
    }

    function togglePyroTokenPullFeeRevenue(address pyroToken, bool pull)
        public
        onlyOwner
    {
        PyroTokenLike(pyroToken).togglePullPendingFeeRevenue(pull);
    }

    function setPyroTokenLoanOfficer(address pyroToken, address loanOfficer)
        public
        onlyOwner
    {
        require(
            loanOfficer != address(0) && pyroToken != address(0),
            "LR: zero address detected"
        );
        PyroTokenLike(pyroToken).setLoanOfficer(loanOfficer);
    }

    function setLachesis(address _lachesis) public onlyOwner {
        config.lachesis = LachesisLike(_lachesis);
    }

    function setFeeExemptionStatusOnPyroForContract(
        address pyroToken,
        address target,
        FeeExemption exemption
    ) public onlySnufferCap {
        require(isContract(target), "LR: EOAs cannot be exempt.");
        PyroToken(pyroToken).setFeeExemptionStatusFor(target, exemption);
    }

    function registerPyroToken(
        address baseToken,
        string memory name,
        string memory symbol
    ) public onlyOwner {
        address expectedAddress = getPyroToken(baseToken);

        require(!isContract(expectedAddress), "PyroToken Address occupied");

        console.log("ABOUT TO LACHESIS CUT");
        (bool valid, bool burnable) = config.lachesis.cut(baseToken);
        require(valid && !burnable, "PyroToken: invalid base token");
        console.log("basetOken in deploy %s", baseToken);
        address p = Create2.deploy(keccak256(abi.encode(baseToken)),type(PyroToken).creationCode);
        PyroToken(p).initialize(baseToken, name, symbol);
        console.log("actual, %s, expected %s", address(p), expectedAddress);
        require(
            address(p) == expectedAddress,
            "PyroToken: address prediction failed"
        );
    }

    function transferPyroTokenToNewReceiver(address pyroToken, address receiver)
        public
        onlyOwner
    {
        PyroToken(pyroToken).transferToNewLiquidityReceiver(receiver);
    }

    function getPyroToken(address baseToken) public view returns (address) {
        console.log("this: %s", address(this));
        bytes32 salt = keccak256(abi.encode(baseToken));
        console.log("bsaeToken in get %s", baseToken);
        return Create2.computeAddress(salt, type(PyroToken).creationCode);
    }

    function isContract(address addr) private view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
}

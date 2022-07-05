// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./PyroToken.sol";
import "./facades/SnufferCap.sol";
import "./facades/Ownable.sol";
import "./facades/LachesisLike.sol";
import "hardhat/console.sol";
import "./facades/IERC20.sol";


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
    bytes constant internal PYROTOKEN_BYTECODE = type(PyroToken).creationCode;
    modifier onlySnufferCap() {
        require(
            msg.sender == address(config.snufferCap),
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

    function drain(address baseToken) external returns (uint) {
        address pyroToken = getPyroToken(baseToken);
        IERC20 reserve = IERC20(baseToken);
        uint256 amount = reserve.balanceOf(address(this));
        reserve.transfer(pyroToken, amount);
        return amount;
    }

    function togglePyroTokenPullFeeRevenue(address pyroToken, bool pull)
        public
        onlyOwner
    {
        PyroToken(pyroToken).togglePullPendingFeeRevenue(pull);
    }

    function setPyroTokenLoanOfficer(address pyroToken, address loanOfficer)
        public
        onlyOwner
    {
        require(
            loanOfficer != address(0) && pyroToken != address(0),
            "LR: zero address detected"
        );
        PyroToken(pyroToken).setLoanOfficer(loanOfficer);
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
        (bool valid, bool burnable) = config.lachesis.cut(baseToken);
        require(valid && !burnable, "PyroToken: invalid base token");
        address p = Create2.deploy(keccak256(abi.encode(baseToken)),PYROTOKEN_BYTECODE);
        PyroToken(p).initialize(baseToken, name, symbol);

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

    //by using salted deployments (CREATE2), we get a cheaper version of mapping by not having to hit an SLOAD op
    function getPyroToken(address baseToken) public view returns (address) {
        bytes32 salt = keccak256(abi.encode(baseToken));
        return Create2.computeAddress(salt, PYROTOKEN_BYTECODE);
    }

    function isContract(address addr) private view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
}

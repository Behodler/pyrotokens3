// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Pyrotoken.sol";

abstract contract LachesisLike {
    function cut(address token) public view virtual returns (bool, bool);
}

abstract contract Ownable {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(msg.sender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract LiquidityReceiver is Ownable {
    LachesisLike lachesis;

    constructor(address _lachesis) {
        lachesis = LachesisLike(_lachesis);
    }

    function setLachesis(address _lachesis) public onlyOwner {
        lachesis = LachesisLike(_lachesis);
    }

    function registerPyroToken(
        address baseToken,
        string memory name,
        string memory symbol
    ) public onlyOwner {
        address pyroToken = getPyrotoken(baseToken, name, symbol);
        try Pyrotoken(pyroToken).name() returns (string memory) {
            revert("Pyrotoken: pyrotoken already deployed");
        } catch {
            (bool valid, bool burnable) = lachesis.cut(baseToken);
            require(valid && !burnable, "Pyrotoken: invalid base token");
            Pyrotoken p = new Pyrotoken{salt: keccak256(abi.encode(baseToken))}(
                baseToken,
                name,
                symbol
            );
            require(
                address(p) == pyroToken,
                "Pyrotoken: address prediction failed"
            );
        }
    }

    function transferPyroTokenToNewReceiver(address pyroToken, address receiver)
        public
        onlyOwner
    {
        Pyrotoken(pyroToken).transferToNewLiquidityReceiver(receiver);
    }

    function setNoBurnForPyroToken(address pyroToken, bool noBurn)
        public
        onlyOwner
    {
        Pyrotoken(pyroToken).setNoBurn(noBurn);
    }

    function getPyrotoken(
        address baseToken,
        string memory name,
        string memory symbol
    ) public view returns (address) {
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xff),
                                address(this),
                                baseToken,
                                keccak256(
                                    abi.encodePacked(
                                        type(Pyrotoken).creationCode,
                                        abi.encodePacked(
                                            baseToken,
                                            name,
                                            symbol
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
    }
}

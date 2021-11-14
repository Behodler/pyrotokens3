// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Pyrotoken.sol";
import "./facades/SnufferCap.sol";
import "./facades/Ownable.sol";

abstract contract LachesisLike {
    function cut(address token) public view virtual returns (bool, bool);
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

    function setLachesis(address _lachesis) public onlyOwner {
        config.lachesis = LachesisLike(_lachesis);
    }

    function setFeeExemptionStatusOnPyroForContract(
        address pyroToken,
        address target,
        FeeExemption exemption
    ) public onlySnufferCap {
        require(isContract(target), "LR: EOAs cannot be exempt.");
        Pyrotoken(pyroToken).setFeeExemptionStatusFor(target, exemption);
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
            (bool valid, bool burnable) = config.lachesis.cut(baseToken);
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

    function isContract(address addr) private view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
}

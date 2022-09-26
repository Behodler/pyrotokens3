import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import * as TypeChainTypes from "../typechain-types";
import { CONSTANTS, ConstantSet } from "./arrange/Common";
import {
    Arrange,
    // t1Setup,
    // t4Setup,
    // t6Setup,
} from "./arrange/proxyHandler";
import { deploy, executionResult, queryChain } from "./helper";

interface BaseTokenSet {
    regularToken1: TypeChainTypes.BaseToken;
    EYE: TypeChainTypes.BaseToken;
}

interface PyroTokens {
    pyroRegular1: TypeChainTypes.PyroToken;
}
interface Uniswap {
    router: TypeChainTypes.UniswapV2Router02;
    factory: TypeChainTypes.UniswapV2Factory;
}

export interface TestSet {
    BaseTokens: BaseTokenSet;
    lachesis: TypeChainTypes.Lachesis;
    liquidityReceiver: TypeChainTypes.LiquidityReceiver;
    burnEYESnufferCap: TypeChainTypes.SnufferCap;
    loanOfficer: TypeChainTypes.SimpleLoanOfficer;
    snufferCap: TypeChainTypes.SnufferCap;
    LiquidityReceiverFactory: TypeChainTypes.LiquidityReceiver__factory;
    BigConstants: TypeChainTypes.BigConstants
    CONSTANTS: ConstantSet;
    Uniswap: Uniswap;
    PyroTokens: PyroTokens;
    RebaseWrapper: TypeChainTypes.RebaseWrapper
    CliffFaceProxy: TypeChainTypes.MockProxy
    ProxyHandler: TypeChainTypes.ProxyHandler
}


describe("ProxyHandler", async function () {
    let owner: SignerWithAddress, secondPerson: SignerWithAddress;
    let SET = {} as TestSet;
    SET.CONSTANTS = CONSTANTS;
    beforeEach(async function () {
        [owner, secondPerson] = await ethers.getSigners();
        let BaseTokens = {} as BaseTokenSet;
        var BaseToken = await ethers.getContractFactory("BaseToken");
        BaseTokens.regularToken1 = await deploy<TypeChainTypes.BaseToken>(
            BaseToken,
            "Base1",
            "BASE",
            0
        );

        BaseTokens.EYE = await deploy<TypeChainTypes.BaseToken>(
            BaseToken,
            "EYE",
            "EYE",
            0
        );

        SET.BaseTokens = BaseTokens;

        const mockProxyFactory = await ethers.getContractFactory("MockProxy")
        SET.CliffFaceProxy = await deploy<TypeChainTypes.MockProxy>(mockProxyFactory, SET.BaseTokens.regularToken1.address)

        var Lachesis = await ethers.getContractFactory("Lachesis");
        SET.lachesis = await deploy<TypeChainTypes.Lachesis>(Lachesis);
        await SET.lachesis.measure(
            SET.CliffFaceProxy.address,
            true,
            false
        );

        const BigConstantsFactory = await ethers.getContractFactory("BigConstants")
        SET.BigConstants = await deploy<TypeChainTypes.BigConstants>(BigConstantsFactory)

        SET.LiquidityReceiverFactory = (await ethers.getContractFactory(
            "LiquidityReceiver"
        )) as TypeChainTypes.LiquidityReceiver__factory;

        SET.liquidityReceiver = await deploy<TypeChainTypes.LiquidityReceiver>(
            SET.LiquidityReceiverFactory,
            SET.lachesis.address,
            SET.BigConstants.address
        );

        const BurnEYESnufferCap = await ethers.getContractFactory(
            "BurnEYESnufferCap"
        );

        SET.snufferCap = await deploy<TypeChainTypes.SnufferCap>(
            BurnEYESnufferCap,
            SET.BaseTokens.EYE.address,
            SET.liquidityReceiver.address
        );

        await SET.liquidityReceiver.setSnufferCap(SET.snufferCap.address);

        const LoanOfficer = await ethers.getContractFactory("SimpleLoanOfficer");
        SET.loanOfficer = await deploy<TypeChainTypes.SimpleLoanOfficer>(
            LoanOfficer
        );

        await SET.liquidityReceiver.setDefaultLoanOfficer(SET.loanOfficer.address);

        await SET.liquidityReceiver.registerPyroToken(
            SET.CliffFaceProxy.address,
            "PyroToken1",
            "PYRO",
            18
        );

        const pyroTokenFactory = await ethers.getContractFactory("PyroToken");
        const pyroRegularAddress1 = await SET.liquidityReceiver.getPyroToken(
            SET.CliffFaceProxy.address
        );

        const pyroRegular1 = (await pyroTokenFactory.attach(
            pyroRegularAddress1
        )) as TypeChainTypes.PyroToken;

        SET.PyroTokens = {
            pyroRegular1,
        };
        //Order of instantiation
        //factory and weth (bring in from limbo)->router
        const wethFactory = await ethers.getContractFactory("WETH10");
        const weth = await deploy<TypeChainTypes.WETH10>(wethFactory);

        const unifactoryFactory = await ethers.getContractFactory(
            "UniswapV2Factory"
        );
        const unifactory = await deploy<TypeChainTypes.UniswapV2Factory>(
            unifactoryFactory,
            owner.address
        );

        const UniswapRouterFactory = await ethers.getContractFactory(
            "UniswapV2Router02"
        );
        const router = await deploy<TypeChainTypes.UniswapV2Router02>(
            UniswapRouterFactory,
            unifactory.address,
            weth.address
        );

        SET.Uniswap = { factory: unifactory, router };

        const snufferCapFactory = await ethers.getContractFactory(
            "BurnEYESnufferCap"
        );
        SET.snufferCap = await deploy<TypeChainTypes.BurnEYESnufferCap>(
            snufferCapFactory,
            SET.BaseTokens.EYE.address,
            SET.liquidityReceiver.address
        );

        const proxyHandlerFactory = await ethers.getContractFactory("ProxyHandler")
        SET.ProxyHandler = (await proxyHandlerFactory.attach((await SET.liquidityReceiver.config()).proxyHandler)) as TypeChainTypes.ProxyHandler
        await SET.ProxyHandler.approvePyroTokenForProxy(SET.PyroTokens.pyroRegular1.address);
        await SET.PyroTokens.pyroRegular1.approve(SET.ProxyHandler.address, CONSTANTS.MILLION)
    });

    it("t0. setup config test", async function () {

    })

    it("t1. mint pyro from base via proxyHandler combines redeem rates, no fees", async function () {
        const initialRedeemRate = await SET.ProxyHandler.baseRedeemRate(SET.PyroTokens.pyroRegular1.address)
        expect(initialRedeemRate).to.equal(CONSTANTS.ONE)

        //ACT

        await SET.BaseTokens.regularToken1.approve(SET.CliffFaceProxy.address, CONSTANTS.HUNDRED)
        await SET.ProxyHandler.mintPyroFromBase(SET.PyroTokens.pyroRegular1.address, CONSTANTS.ONE.mul(2))
        const pyroQuantity = await SET.PyroTokens.pyroRegular1.balanceOf(owner.address)
        const redeemRateAfterMint = await SET.ProxyHandler.baseRedeemRate(SET.PyroTokens.pyroRegular1.address)
        await SET.PyroTokens.pyroRegular1.burn(CONSTANTS.ONE.div(2))
        const redeemRateAfterBurn = await SET.ProxyHandler.baseRedeemRate(SET.PyroTokens.pyroRegular1.address)

        const impliedBase = redeemRateAfterBurn
            .mul(CONSTANTS.ONE.div(2))
            .div(CONSTANTS.ONE)
            .mul(98)//fee
            .div(100)
        const baseBalanceBefore = await SET.BaseTokens.regularToken1.balanceOf(owner.address)
        await SET.ProxyHandler.redeemFromPyro(SET.PyroTokens.pyroRegular1.address, CONSTANTS.ONE.div(2))
        const pyroBalanceAfterRedeem = await SET.PyroTokens.pyroRegular1.balanceOf(owner.address)
        const baseBalanceAfter = await SET.BaseTokens.regularToken1.balanceOf(owner.address)

        //ASSERT
        expect(pyroQuantity).to.equal(CONSTANTS.ONE)
        expect(pyroBalanceAfterRedeem.toString()).to.equal("0")
        expect(redeemRateAfterMint).to.equal(CONSTANTS.ONE.mul(2))
        expect(redeemRateAfterBurn).to.equal(CONSTANTS.ONE.mul(4))
        expect(baseBalanceAfter.sub(baseBalanceBefore).toString())
            .to.equal(impliedBase)
     
    })

})
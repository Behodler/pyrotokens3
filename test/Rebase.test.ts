import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import * as TypeChainTypes from "../typechain-types";
import { CONSTANTS, ConstantSet } from "./arrange/Common";
import {
    Arrange,
    t2Setup,
    t4Setup,
    t6Setup,
} from "./arrange/rebase";
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
}


describe("Rebase Wrapper", async function () {
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

        var Lachesis = await ethers.getContractFactory("Lachesis");
        SET.lachesis = await deploy<TypeChainTypes.Lachesis>(Lachesis);
        await SET.lachesis.measure(
            SET.BaseTokens.regularToken1.address,
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
            SET.BaseTokens.regularToken1.address,
            "PyroToken1",
            "PYRO",
            18
        );

        const pyroTokenFactory = await ethers.getContractFactory("PyroToken");
        const pyroRegularAddress1 = await SET.liquidityReceiver.getPyroToken(
            SET.BaseTokens.regularToken1.address
        );
        const pyroRegularAddress2 = await SET.liquidityReceiver.getPyroToken(
            SET.BaseTokens.regularToken1.address
        );
        const pyroRegular1 = (await pyroTokenFactory.attach(
            pyroRegularAddress1
        )) as TypeChainTypes.PyroToken;
        const pyroRegular2 = (await pyroTokenFactory.attach(
            pyroRegularAddress2
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
        await SET.liquidityReceiver.setSnufferCap(SET.snufferCap.address);
        SET.RebaseWrapper = await fetchRebaseInstance()
    });

    it("t0. setup test", async function () {

    })

    it("t1. deployed pyroToken has rebase deployed with correct metadata", async function () {
        const expectedName = "PyroToken1_rebase"
        const expectedSymbol = "PYRO_rebase"

        expect(await SET.RebaseWrapper.name())
            .to
            .equal(expectedName)

        expect(await SET.RebaseWrapper.symbol())
            .to
            .equal(expectedSymbol)

        expect((await SET.RebaseWrapper.totalSupply()).toString())
            .to
            .equal("0")
    })

    it("t2. Converting to and from rebase is exempt of FOT", async function () {

        await Arrange(
            "Mint 10 PyroTokens",
            SET,
            owner,
            false,
            t2Setup
        );

        const balanceOfRebaseBefore = await SET.RebaseWrapper.balanceOf(owner.address)
        const totalSupplyOfRebaseBefore = await SET.RebaseWrapper.totalSupply()

        const four = CONSTANTS.ONE.mul(4)

        //ACT
        let result = await executionResult(SET.RebaseWrapper.convertFromPyro(owner.address, four))
        expect(result.success).to.equal(true, result.error)

        const redeemRateAfterConvertFrom = await SET.PyroTokens.pyroRegular1.redeemRate()

        const balanceOfRebaseWrapperAfterConvertFromPyro = await SET.RebaseWrapper.balanceOf(owner.address)
        const balanceOfPyroAfterConvertFromPyro = await SET.PyroTokens.pyroRegular1.balanceOf(owner.address)

        const totalSupplyOfRebasAfterConvertFromPyro = await SET.RebaseWrapper.totalSupply()

        result = await executionResult(SET.RebaseWrapper.convertToPyro(owner.address, CONSTANTS.ONE))
        expect(result.success).to.equal(true, result.error)

        const redeemRateAfterConvertTo = await SET.PyroTokens.pyroRegular1.redeemRate()
        const balanceOfRebaseWrapperAfterConvertToPyro = await SET.RebaseWrapper.balanceOf(owner.address)
        const balanceOfPyroAfterConvertToPyro = await SET.PyroTokens.pyroRegular1.balanceOf(owner.address)

        //ASSERT

        expect(redeemRateAfterConvertFrom).to.equal(CONSTANTS.ONE)
        expect(redeemRateAfterConvertTo).to.equal(CONSTANTS.ONE)

        expect(balanceOfRebaseBefore.toString()).to.equal("0")
        expect(totalSupplyOfRebaseBefore.toString()).to.equal("0")

        expect(balanceOfRebaseWrapperAfterConvertFromPyro).to.equal(four)
        expect(balanceOfPyroAfterConvertFromPyro).to.equal(four.add(CONSTANTS.ONE.mul(2)))

        expect(totalSupplyOfRebasAfterConvertFromPyro).to.equal(four)

        const three = four.sub(CONSTANTS.ONE)
        expect(balanceOfRebaseWrapperAfterConvertToPyro).to.equal(three)
        expect(balanceOfPyroAfterConvertToPyro).to.equal(three.add(four))

    })

    it("t3. Increasing redeem rate shows up as higher balance", async function () {
        await Arrange(
            "Mint 10 PyroTokens",
            SET,
            owner,
            false,
            t2Setup
        );

        let balanceOfBaseOnPyro = await SET.BaseTokens.regularToken1.balanceOf(SET.PyroTokens.pyroRegular1.address)
        expect(balanceOfBaseOnPyro).to.equal(CONSTANTS.TEN)

        //ACT
        await SET.RebaseWrapper.convertFromPyro(owner.address, CONSTANTS.ONE.mul(3))
        const balanceOfRebaseBeforeBurn = await SET.RebaseWrapper.balanceOf(owner.address)

        await SET.PyroTokens.pyroRegular1.burn(CONSTANTS.ONE.mul(6))

        balanceOfBaseOnPyro = await SET.BaseTokens.regularToken1.balanceOf(SET.PyroTokens.pyroRegular1.address)
        expect(balanceOfBaseOnPyro).to.equal(CONSTANTS.TEN)

        const balanceOfRebaseAfterBurn = await SET.RebaseWrapper.balanceOf(owner.address)

        //ASSERT
        const expectedNewRedeemRate = CONSTANTS.ONE.mul(BigNumber.from("25")).div(10)
        const newRedeemRate = await SET.PyroTokens.pyroRegular1.redeemRate()

        expect(newRedeemRate).to.equal(expectedNewRedeemRate)
        expect(balanceOfRebaseBeforeBurn).to.equal(CONSTANTS.ONE.mul(3))
        expect(balanceOfRebaseAfterBurn).to.equal(CONSTANTS.ONE.mul(BigNumber.from("75")).div(10))
    })

    it("t4. Transfer of rebase wrapper reduces balance AND increases redeem rate", async function () {
        await Arrange(
            "Mint 7 RebaseTokens",
            SET,
            owner,
            false,
            t4Setup
        );

        //ACT
        //transfer to any address
        await SET.RebaseWrapper.transfer(SET.lachesis.address, CONSTANTS.ONE.mul(5))

        //ASSERT
        const totalSupplyOfRebaseAfterTransfer = await SET.RebaseWrapper.totalSupply()
        const totalSupplyOfPyroAfterTransfer = await SET.PyroTokens.pyroRegular1.totalSupply()

        //balance goes down but also up because of increased redeem rate
        const balanceOnRebaseAfterTransfer = await SET.RebaseWrapper.balanceOf(owner.address)


        //9.995
        const expectedTotalSupplyOfRebaseAfterTransfer = "6998499249624812404"
        expect(totalSupplyOfRebaseAfterTransfer).to.equal(expectedTotalSupplyOfRebaseAfterTransfer)

        const expectedPyroTotalSupply = CONSTANTS.ONE.mul(9995).div(1000)
        expect(totalSupplyOfPyroAfterTransfer).to.equal(expectedPyroTotalSupply)

        const expectedNewRedeemRate = BigNumber.from('1000500250125062531')
        const redeemRate = await SET.PyroTokens.pyroRegular1.redeemRate()
        expect(redeemRate).to.equal(expectedNewRedeemRate)

        const expectedRebaseBalanceAfterTransfer = expectedNewRedeemRate.mul(2)

        expect(balanceOnRebaseAfterTransfer).to.equal(expectedRebaseBalanceAfterTransfer)
    })

    it("t5. Minting on a high redeem rate gives a larger initial balance", async function () {
        await Arrange(
            "Mint 10 PyroTokens",
            SET,
            owner,
            false,
            t2Setup
        );

        //ACT
        await SET.PyroTokens.pyroRegular1.burn(CONSTANTS.ONE.mul(5))

        const newRedeemRate = await SET.PyroTokens.pyroRegular1.redeemRate()

        await SET.RebaseWrapper.convertFromPyro(owner.address, CONSTANTS.ONE.mul(3).div(2))

        const initialRebaseBalance = await SET.RebaseWrapper.balanceOf(owner.address)

        //ASSERT
        expect(newRedeemRate).to.equal(CONSTANTS.ONE.mul(2))

        expect(initialRebaseBalance).to.equal(CONSTANTS.ONE.mul(3))
    })

    it("t6. converting back to pyro and then to base gives original balance minus fee", async function () {
        await Arrange(
            "Mint 3 Rebase from 1.5 Pyro",
            SET,
            owner,
            false,
            t6Setup
        );

        await SET.RebaseWrapper.convertToPyro(owner.address, CONSTANTS.ONE.mul(3))

        const pyroBalance = await SET.PyroTokens.pyroRegular1.balanceOf(owner.address)
        expect(pyroBalance).to.equal(CONSTANTS.ONE.mul(3).div(2))

        const balanceOfBaseBefore = await SET.BaseTokens.regularToken1.balanceOf(owner.address)
        await SET.PyroTokens.pyroRegular1.redeem(owner.address, CONSTANTS.ONE.mul(3).div(2))
        const balanceOfBaseAfter = await SET.BaseTokens.regularToken1.balanceOf(owner.address)

        const change = balanceOfBaseAfter.sub(balanceOfBaseBefore)

        expect(change).to.equal(CONSTANTS.ONE.mul("294").div(100))

    })

    async function fetchRebaseInstance(): Promise<TypeChainTypes.RebaseWrapper> {
        const address = await SET.PyroTokens.pyroRegular1.rebaseWrapper()
        const RebaseFactory = await ethers.getContractFactory("RebaseWrapper")
        return await RebaseFactory.attach(address) as TypeChainTypes.RebaseWrapper
    }
})
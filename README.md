# pyrotokens3

The third phase in Behodler's super deflationary token wrappers.

# Description

Pyrotokens are wrapper tokens of existing tokens traded on Behodler, crafted on deflationary tokenomics. The relationship between is Pyrotokens and Behodler listed tokens is 1 to 1. Eg. Weth has PyroWeth. Pyrotokens achieve deflationary price movements with respect to their base token by establishing a redeem rate that can only increase. The redeem rate is algorithmically calculated as the total base token in reserve divided by the supply of the pyrotoken. In notation, if R is the redeem rate, B the total reserve of base tokens held in a pyrotoken contract and T, the total supply of pyrotokens, then the redeem rate is given by the fraction,

$$R = \frac{B}{T}$$

EG. Suppose in that there are 10 Weth in reserve and the supply of PyroWeth is 8. This implies the redeem rate of PyroWeth is

$$\frac{10}{8} = 1.25$$

This means that if you wish to mint 1 PyroWeth, you require 1.25 Eth. Similarly redeeming 1 PyroWeth will give 1.25 Eth.

## The 3 Laws of Pyrotokens

The redeem rate equation is given by the fraction $\frac{B}{T}$. While minting and redeeming leave the fraction unchanged, the numerator and denominator can move independently of one another. However the following contract enforced rules apply:

1. When the denominator changes, the numerator must remain fixed.
2. When the numerator changes, the denominator must remain fixed.

   We can call the above 2 rules independent movements. Then,

3. When an independent movement occurs, the denominator can only decrease and the numerator can only increase, depending on which one is moving.

## Value proposition

Putting those 3 rules together gives a strong guarantee on the redeem rate: it can only increase or stay the same but never decrease. This means that for the purpose of hodling a given token, Pyrotokens are strongly superior to their base token. In other words, if you wish to hold Weth, you should hold PyroWeth instead.

### Caveats

In the case where you wish to use the underlying base token for utility purposes such as Eth in transactions or an LP token for unwrapping, the gas costs of moving in and out of the corresponding Pyrotoken needs to be accounted for. Similarly, Pyrotokens exact an exit fee on redemption that should be taken into account such that one should hold Pyrotokens until the redeem rate appreciation has compensated for the exit fee.

## Mechanisms for independent movement

Since independent movements in the components of the redeem rate are the algorithmic mechanisms for increasing the redeem rate, it's worth enumerating the chief causes of their movements:

### Independent numerator increases

Every trade on Behodler levies a 0.5% fee on the input token. For tokens that have pyrotokens, the fee is sent to the corresponding pyrotoken reserve, independently increasing the numerator and therefore the redeem rate.

### Independent denominator decreases

The mechanism for decreasing the denominator is burning:

1. Every transfer of the Pyrotoken incurs a fee, 100% of which is burnt. To use Uniswap's terminology, the transfer fee is *inclusive*.
2. Exiting the Pyrotoken by redeeming for the base token incurs a burn fee which is higher than the transfer fee.

The purpose of the burn on transfer is to benefit from high frequency AMM trades. By listing the Pyrotokens on all the major AMMs including Behodler, regular trade will transfer value to hodlers. This mechanism is part of Behodler's broader MEV capture and underpins the strategy for deepening liquidity. However these topics are beyond the scope of this document and interested readers should dive deeper into the relationship between MEV capture, Limbo and the Behodler AMM.

The purpose of the exit fee is to encourage redeemers to rather go through an AMM to redeem since the transfer fee is less than the exit fee. That is, if possible, swap PyroWeth for Eth on Behodler or any popular AMM rather than trigger the redeem functionality. The exception being small amounts because the redeem functionality consumes less gas than a swap of most AMMs. Furthermore, when there's a market rush to dump the base token, the rush to the exit of Pyrotoken holders causes the redeem rate to increase for the remainers. This exit fee therefore acts to protect holders from sudden market downturns. Pyrotokens are dump proof. As Pyrotoken TVL grows, this anti dump mechanism will act to partially shield the base token from sudden market downturns, bringing a necessary price smoothing effect to DeFi.

# Why is a new version required?

While theory and well planned code can create great Protocols, there's no substitute for experience and Pyrotokens are no different. Each iteration of the Pyrotoken experiment yielded important lessons and as these lessons accumulated, the weight of their suggestive pressure eventually required an upgrade.

## Yield on idle reserves

Pyrotokens2 have been a great success but there are some shortcomings that are still holding the experiment back. Since the advent of Pyrotokens2, much has occurred in Defi in the realm of earning yield on idle capital. While simply locking capital was considered a great economic mechanism in 2019, in the age of Aave, Tokemak and yield farms, DeFi users expect locked capital to be put to work.
There are two major problems with putting underlying capital to work in a DeFi protocol. The first is that it causes the protocol to inherit the security vulnerabilities of the yield protocol employed. For instance, suppose all the Weth in PyroWeth is deposited into a protocol like Curve in order to earn a yield. This would accelerate redeem rate growth. However, an exploit in Curve would kill PyroWeth.
The second problem (and this is a mainnet issue only) is that if all the capital is deployed to earn yield then redeeming and minting will cost an unpalatable amount of gas.
The 3 laws of Pyrotokens offer a solution to the above such that the underlying capital can be put to work without increasing the economic risk of the protocol at all. This opportunity cannot be passed up. The mechanism of yield is elaborated <a href ="#pyroloan">here</a>.

## Overly restrictive Pyrotoken registration rules.

In Pyrotokens2, the deployment of a new Pyrotoken contract is performed in the contract LiquidityReceiver. Here, the Pyrotoken name is algorithmically generated by tacking on Pyro and P to the name and symbol properties respectively of the base token. For instance, Orchid's OXT token has a Pyrotoken with the name PyroOrchid and symbol POXT. This strategy (and indeed the code) was borrowed from Aave's Atoken creation contract. Unfortunately, ERC20 doesn't require the name and symbol properties to be provided and as such, a small subset of ERC20 tokens do not have these properties. This means that, when listed on Behodler, they cannot have Pyrotokens. MakerDAO's MKR falls into this category. With the advent of Pyrotokens3, PyroMKR will be added to the list of available Pyrotokens.

In addition to excluding certain tokens, the name generation algorithm suffers from naming every LP token the same thing. This makes for a difficult user experience.
Pyrotokens3 will allow for the caller of the creation function to set the name manually. This solves both of the above problems so that on chain, we will see PyroSCX/EYE UniV2 as an example.

**In addition to these necessary upgrades are some friction reducing features gleaned from experience:**

1. Approve no burn fee. Here a user or contract can turn off the burn fee for the duration of 1 transaction. This purpose of this is to assist composability for protocols that wish to be built on Pyrotokens but which require the spread between prices to be minimized. While it's possible that protocols may seek to maximize the use of this feature, it's important to bear in mind that most burning will come from AMM trades and bots in particular. One of the use cases this feature will enable is allowing any project with a token listed on Behodler to implement a yield earning staking protocol for their user base. For instance, suppose a fictional dapp called DiamondDogs issues the token DD to its user base. DD trades on Behodler and has a corresponding PyroDD. Users who stake DD receive occasional NFT airdrops. When a user stakes DD, the token is converted into PyroDD. When the user unstaked, the PyroDD is unwrapped into DD and returned to the user. By disabling fees for these two operations, DiamondDogs can ensure that in the event when a user rapidly stakes and unstakes, the fees don't incur a liability on the DiamondDogs dapp. The feature of no-fee approvals can be disabled through governance in case the Behodler community finds that it is being abused.
2. MintTo and RedeemTo. In Pyrotokens2, to mint PyroWeth with ETH, first ETH must be wrapped as Weth and then the Weth should be used to mint PyroWeth. A proxy contract has been deployed to combine these steps into one transaction. However, once the PyroWeth is minted, the proxy contract has to send it to the minting user which incurs a transfer fee. In Pyrotokens3, a To address will allow the proxy contract to instruct the pyrotokens to mint directly into the wallet of the recipient.

## Bad transfer etiquette.

In Pyrotokens2, the transferFrom function assumes the spender and recipient are the same address which is technically incorrect. The advent of high gas has forced protocols to ensure that this is usually the case. Calling external contracts is expensive so most protocols perform business logic and state changes in the same contract. However, some of the older projects such as Uniswap 2 add an additional logic layer (Router2). When Pyrotokens are traded through Router2, the transaction fails.
Trading directly with the underlying token pair succeeds which means bots will have little trouble with this detail. However, regular users will not be so fortunate. For the sake of broader DeFi integration, it's essential that all components in Behodler comply with prevailing standards. As such, in addition to removing the incorrect name generating assumptions, the transferFrom should be ERC20 compliant. Pyrotokens3 will fix this and therefore be 100% ERC20 compliant.

<div id="pyroloan"></div>

# Pyroloans

The 3 laws of Pyrotokens create a certain economic guarantee that cannot be ignored: since Pyrotokens cannot fall in value relative to the base token, Pyrotoken as collateral against base token loans are economically risk free. In traditional collateralized borrowing dapps, there has to be an upper limit on the percentage of loaned token to collateral. For instance, if you wish to deposit Eth on Aave in order to borrow dai, you will only be able to borrow about 70% of the value of your eth deposit. This is to give liquidators a margin of error in which to protect the protocol from insolvency. Pyroloan collateral staked in order to borrow base token liquidity cannot ever be insolvent which means that this ratio can be much closer to 100%.

## How Pyroloans work: a simple example

Suppose the redeem rate of PyroMKR is 10, meaning that 1 PyroMKR can be redeemed for 10 MKR. I own 2 PyroMKR and wish to borrow 12 MKR tokens. I deposit 2 PyroMKR into the Pyroloan contract. I then borrow the 12 MKR, meaning that I've borrowed against 1.2 PyroMKR. The loan to collateral ratio is 12/20 = 60%. The liquidation ratio is 95%, meaning that when my loaned amount plus accumulated interest reaches 95%, my position will be liquidated.

The accumulation of interest on my outstanding debt raises my debt ratio. The growth of the PyroMKR redeem rate offsets this by raising the value of staked collateral. Let's consider 2 scenarios.

### Scenario 1: redeem rate growth exceeds interest rate

Over the course of a few months, the accumulated interest on the borrowed 1.2 is 0.3 MKR, taking the debt obligation to 1.5 MKR. The redeem rate of PyroMKR over this period has increased from 10 to 15. This takes the new ratio to 15/30 = 50%. In this instance, if I wish to bring my ratio back up to 60%, I can borrow another 3 MKR.

### Scenario 2: redeem rate growth is too slow for interest rate

Now suppose the accumulated interest over the period totals 12 MKR. The redeem rate has only risen to 11. The ratio is now 24/22 = 109%. In this scenario, we are insolvent. A profit seeking liquidating user can trigger a liquidation. Here, they receive a percentage of the staked pyrotoken capital and the rest is burnt, pushing up the redeem rate.

Borrowers can withdraw staked pyrotoken capital to the extent that their positions remain solvent. Accumulated interest is paid directly into the reserve, pushing up the redeem rate.

## Economics of Pyroloans

### Traditional loans amplify bear markets. Pyroloans liquidations dampen bear markets.

Collateral backed borrowing on Ethereum, popularized by MakerDAO and Aave, have allowed self leveraged long positions to be built up by iteratively stacking debt. Essentially a user would deposit a risky token with good prospects such as Eth and borrow a stablecoin with a predictable and manageable interest rate such as Dai. They would only borrow a fraction of the value deposited but it would be used to purchase yet more Eth which is then deposited to borrow more Dai. The net result is to expose the borrower to large quantities of Eth. This very long position is in anticipation of Eth price growth exceeding the debt obligation of Dai plus interest. If correct in their predictions, the debt stack can be eventually unwound, leaving the depositor with more Eth that initially deposited.
In a simple loan, a market downturn would see a certain portion of the borrower's eth sold onto the open market in order to liquidate the position. For a leveraged long position, a great deal more Eth is sold onto the open market. This increased sell pressure amplifies Eth downturns more than would otherwise would have occurred. Therefore borrowing on the margin increases systemic risk to the economy of the collateral asset.

Pyroloans suffer from no such fragility. When a pyroloan position is insolvent (which can only happen because of accumulated unpaid interest), the pyrotoken collateral is burnt. The corresponding base token that was attached to the pyrotoken collateral is released back into the reserve pool rather than being dumped on the open market, reflecting as a higher redeem rate for all pyrotoken holders. So the first order effect of a pyroloan liquidation is to benefit all pyrotoken holders. Since the pyrotoken redeem rate has grown faster than it otherwise would have, the attractiveness of minting the base token into pyrotokens has risen which means the demand for base tokens will rise as this demand induces more pyrotoken minting. In contrast to traditional loans, the circulating market supply of base token hasn't increased. So the second order effect of a pyroloan liquidation is to put upward price pressure on the base token. As with the rest of the pyrotoken mechanisms, the effect of pyroloans is to dampen bear markets.
With traditional loans, liquidations are to the detriment of all borrowers against and holders of the collateral token. With pyroloans, holders and solvent borrowers all benefit from liquidations.

It's worth noting that even if the debt obligation exceeds the collateral, this is only because of interest. The principal still exceeds the original debt and so insolvency can only happen on an individual level. Insolvent debt does not aggregate systemically.

## Interest rates

Ideally borrowers would pay an interest rate determined by demand for credit and supply of capital. This can be managed algorithmically through a formulaic calculation and does not require oracle input. Indeed, no part of Pyroloans requires any offchain information feeds, reducing the exposure to the risk of malicious oracle manipulation.

## Yield vs Risk

When considering the option for allowing reserves in Pyrotokens to earn a yield, an alternative to loanable funds is to allow the deployment of the reserves to other DeFi protocols through governance decisions. For instance, deploying the PyroWeth reserves to Curve's Steth pool or staking OXT in the Orchid protocol. While this gives the community power to boost pyrotoken yields, it introduces protocol risk that undermines or even violates Law 3, namely that an independent movement in reserves can only be positive. Suppose for some reason, an exploit is found on Curve such that all Eth staked in the Steth pool is drained. In this case, the reduction in PyroWeth reserves would lead to a fall in the redeem rate.

By allowing interest rates on Pyroloans to be set by market forces, the long term interest rate on Pyroloans will reflect the broader DeFi return on capital as borrowers seek the best returns on their loans. This allows the capital to be utilized efficiently without introducing any economic risk and thereby never threatening the 3 Laws of Pyrotokens. Borrowers bear all the risk.

## Protocol safety

While Pyroloans offer no economic risk, every new smart contract introduces protocol risk. A loan component is particularly risky to write. As such, the loan component will be inactive by default and will only be turned on through governance. The community is urged to not turn on the loan module until after a full code audit has been conducted.

# Summary of the changes in version 3

1. mint and redeem have recipient addresses to improve DeFi composability and reduce the cost of minting and redeeming PyroWeth in particular.
2. TransferFrom is correctly specified to support indirect routing such as with Uniswap's V2 Router contract.
3. Pyroloans (disabled by default): pyrotoken collateral, base token loan.
4. Flexible name generation.
5. Once off approval of no fee.
6. Pyrotoken contracts will be deployed via CREATE2, using the address of the base token as the salt. This will allow future contracts built on Pyrotokens to determined the address of the Pyrotoken contract without consulting a mapping reducing the need for a gas expensive SSLOAD operation or an external contract call.
7. Pulling pending fees on mint and redeem can be turned off through governance so that if coupled with a potential future Behodler 3, feature 6 can be taken advantage of, reducing the gas cost further.
8. Fees will be powers of 2 to avoid strange rounding errors.

# Migration from version 2

## Existing holders

Existing holders can either manually convert their pyrotokens from version 2 to 3 by first redeeming for the base token and then minting the new token or they can go through a reminting contract that bundles these operations into one. The redeem rates of V2 and V3 are not linked so the final number of Pyrotokens may differ significantly. However this does not reflect lost or gained value. However, the move from V2 to V3 does imply an unavoidable 2% exit fee from V2.
The introduction of the once off no fee approval would prevent this situation from happening in the future.
The UX for converting V2 to V3 will be as low friction as possible so that new users will not be aware of V2 and V2 holders will be prompted through a single transaction per pyrotoken to upgrade.

Note: V2 pyrotokens will not stop working but at some point, fee revenue from Behodler will go to V3 pyrotokens exclusively.

## Lessons learnt from prior migrations

Migrations in Ethereum have certain best practices, one of which is to never rely on external state. The V2 to V3 migration will be a purely mechanistic invocation of redeem and mint functionality with no reliance on exchange rates or balances. Indeed, the migration contract is not even aware of which pyrotoken is being migrated in particular but simply consults the mappings of the respective Liquidity Receiver contracts.

# The history of pyrotokens

Pyrotokens have been a part of Behodler from the very beginning. In fact the concept traces its roots to WeiDai and therefore predates the existence of Behodler. The practical lessons learnt since V1 have informed an incremental improvement in each successive generation. This section briefly outlines the history of pyrotokens.

## V1

When a token was sold on Behodler 1, a portion of the input token would be wrapped into a Pyrotoken. A percentage of the newly minted Pyrotoken was then burnt and the remaining quantity sent to the trader, all in the span of 1 transaction.
The intent here was to give traders an immediate stake in the success of the Behodler protocol, similar to loyalty points earned in traditional retail stores.
Early adopters benefit the most since subsequent trade by other users increases the value of existing Pyrotoken holders. There was no explicit mechanism for users to mint Pyrotokens. Instead, trade on Behodler was required.

The drawback to this approach was the gas cost of minting up, burning and then transferring a pyrotoken in the span of a trade. When coupled with other features of Behodler 1 such as ephemeral minting of Scarcity, the gas cost of a trade on Behodler 1 exceeded all other popular AMMs.

## V2

Behodler 1 served as a very useful proof of concept AMM so that Behodler 2 could be optimized around gas usage. Pyrotokens are no longer minted per trade. Instead a portion of incoming trade is sent to a holder contract called the LiquidityReceiver. This indirect approach leads to significant gas savings on Behodler 2. When minting and redeeming occurs on a Pyrotoken, pending transfer revenue is fetched from LiquidityReceiver first, similar to the drip() function in Dai's Pot.sol contract.
Borrowing from Aave's generation of ATokens, V2 Pyrotokens are given names and symbols derived from the name and symbol properties of the base token. Unfortunately, this precludes certain tokens which do not possess a name or symbol such as MKR.

## V3

The use of a router contract on Uniswap V2 leads to an incompatibility between Pyrotoken V2 and Uniswap at the level of the front end user. Bots and technical users can still go directly to the underlying pair contracts. External AMM trade is an important feature of the tokenomic interaction between Pyrotokens and Limbo and allowing non technical users to route their pyrotokens through external AMMs would reduce UX friction.
Since the advent of V2, DeFi yield opportunities have proliferated, coupled with an increasing emphasis on making capital efficient. V2 reserves were left intentionally idle to protect the protocol from external protocol risk. While it is impossible to protect from the protocol risks of the underlying base tokens, nothing should undermine the 3 Laws of Pyrotokens. V3 introduces economic risk free loans that are compliant with the 3 Laws.


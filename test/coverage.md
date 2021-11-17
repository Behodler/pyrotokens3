

**Note: for security reasons, this page does not render correctly in Github but a local markdown parser will show the correct colours.**
<style>
div{
    color:red;
    font-weight:bold;
    font-style:italic;
    font-size:1.2rem;
}
p {
    color:green;
    font-weight:bold;
    font-size:1.2rem;
}
</style>

# Legend
<div> Red is not covered</div>
<p> Green is covered</p>
Note: the line items don't necessarily correspond to tests 1:1 but instead represent features that need to be covered in the tests.

## Liquidity Receiver

<p> CREATE2: Deployed PyroToken address matches predicted address</p>
<p> SetFeeExempt on EOA fails</p>
<div> Non fee exempt contract charged all fees, EOA charged all fees</div>
<div> SetFeeExempt on Contract passes for each scenario</div>
<div> Redeploying existing PyroToken fails</div>
<div> Only valid nonburnable tokens can have pyroTokens</div>
<div> Transfer of pyroToken to new liquidity receiver works fully</div>

## PyroToken

<div> Redeploying existing PyroToken fails</div>
<div> Mint when LR has pending reserves increases redeem rate</div>
<div>Burning, transferring, redeeming or sending tokens to reserve increases redeem rate</div>
<div>Redeeming with pending LR has a bigger update than just regular redeem</div>
<div>Minted amount and redeemed amount match predictions based on redeemRate</div>
<div>RedeemFor requires ERC20 allowance as though it's a transferFrom operation</div>
<div>Redeeming all pyroTokens sets redeemRate to 1</div>
<div>FOT transfer tokens can be minted and redeemed without causing reverts</div>
<div>Rebase up tokens increase redeem rate</div>
<div>transferFrom works correctly</div>
<div>calculated fee matches reality</div>


## PyroToken loans (PyroToken side)
<div>Loan officer cannot borrow if not approved</div>
<div>Owner cannot stake more pyroTokens than owned.</div>
<div>Borrower cannot borrow more base than implied by redeem rate.</div>
<div>After borrowing max, redeem rate growth allows for larger borrowing</div>
<div>Borrower cannot borrow more base than implied by redeem rate.</div>
<div>Paying back all debt allows for total unstaking of pyro</div>
<div>Loan officer cannot borrow if not approved</div>

## PyroWeth Proxy
<div>Minting incurs no fee, redeeming only incurs the exit fee</div>

## V2 Migrator
<div>Providing incorrect corresponding V3 token address fails</div>
<div>Minted V3 amount must match expected amount</div>
<div>Only fee is 2% exit V2 fee</div>
<div>Minted V2 amount must match expected amount</div>
<div>Sending more base token or pyroToken2 or pyroToken3 to migrator before migration doesn't break migrator</div>
<div>Mint many works.</div>

## Constant Product Loan Officer test 






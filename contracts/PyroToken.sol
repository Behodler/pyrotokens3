// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./facades/Enums.sol";
import "./facades/IERC20.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract ERC20 is Context, IERC20 {
    mapping(address => uint256) internal _balances;

    mapping(address => mapping(address => uint256)) internal _allowances;

    uint256 internal _totalSupply;

    string internal _name;
    string internal _symbol;

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overridden;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender] + addedValue
        );
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual;

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, uint128(amount), 0);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), uint128(amount), 0);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom(address account, uint256 amount) public virtual {
        uint256 currentAllowance = allowance(account, _msgSender());
        require(
            currentAllowance >= amount,
            "ERC20: burn amount exceeds allowance"
        );
        unchecked {
            _approve(account, _msgSender(), currentAllowance - amount);
        }
        _burn(account, amount);
    }
}

// File @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol@v4.3.2

// : MIT

// File contracts/BurnableToken.sol

//: Unlicense

interface LiquidiyReceiverLike {
    function drain(address baseToken) external returns (uint256);
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}

contract PyroToken is ERC20, ReentrancyGuard {
    struct Configuration {
        address liquidityReceiver;
        IERC20 baseToken;
        address loanOfficer;
        bool pullPendingFeeRevenue;
    }
    struct DebtObligation {
        uint256 base;
        uint256 pyro;
        uint256 redeemRate;
    }
    Configuration public config;
    uint256 private constant ONE = 1 ether;

    /*
    Exemptions aren't a form of cronyism. Rather, it will be decided on fair, open cryptoeconomic rules to allow protocols that need to
    frequently work with pyroTokens to be able to do so without incurring untenable cost to themselves. Always bear in mind that the big
    AMMs including Behodler will burn PyroTokens with abandon and without exception.
    We don't need every single protocol to bear the cost of Pyro growth and would 
    prefer to hit the high volume bots where they benefit most.
    Regarding fair cryptoeconomic incentives, a contract that requires burning a certain level of EYE would be a good example though we may get more sophisticated than that. 
    As a pertinent example, since Behodler burns as a primitive, 
    if we list a pyroToken for trade as burnable, then the total fee will be the Behodler burn fee plus the incoming transfer burn as well as the outgoing transfer burn when it is bought.
    This might be a little too much burning. In this case, we can turn of the transfer burns and still get the pyroToken burning on sale.  
    */
    mapping(address => FeeExemption) feeExemptionStatus;

    //By separating logic (loan officer) from state(debtObligations), we can upgrade the loan system without requiring existing borrowers migrate.
    //Seamless upgrade. This allows for better loan logic to replace the initial version.
    //By mapping debt on an individual pyroToken basis, it means each pyroToken can have it's own loan system. Potentially creating
    //a flourising of competing ideas. Seasteading for debt.
    mapping(address => DebtObligation) debtObligations;

    constructor(){
        config.liquidityReceiver = _msgSender();
        config.pullPendingFeeRevenue = true;
    }

    modifier initialized {
        require(address(config.baseToken)!=address(0), "PyroToken: base token not set");
        _;
    }
    function initialize(
        address baseToken,
        string memory name_,
        string memory symbol_
    ) public onlyReceiver {
        config.baseToken = IERC20(baseToken);
        _name = name_;
        _symbol = symbol_;
    }

    modifier onlyReceiver() {
        require(
            _msgSender() == config.liquidityReceiver,
            "PyroToken: Only Liquidity Receiver."
        );
        _;
    }

    modifier updateReserve() {
        if (config.pullPendingFeeRevenue) {
            LiquidiyReceiverLike(config.liquidityReceiver).drain(address(this));
        }
        _;
    }

    modifier onlyLoanOfficer() {
        require(
            _msgSender() == config.loanOfficer,
            "PyroToken: Only Loan Officer."
        );
        _;
    }

    function setLoanOfficer(address loanOfficer) external onlyReceiver {
        config.loanOfficer = loanOfficer;
    }

    function togglePullPendingFeeRevenue(bool pullPendingFeeRevenue)
        external
        onlyReceiver
    {
        config.pullPendingFeeRevenue = pullPendingFeeRevenue;
    }

    function setFeeExemptionStatusFor(address exempt, FeeExemption status)
        public
        onlyReceiver
    {
        feeExemptionStatus[exempt] = status;
    }

    function transferToNewLiquidityReceiver(address liquidityReceiver)
        external
        onlyReceiver
    {
        require(
            liquidityReceiver != address(0),
            "PyroToken: New Liquidity Receiver cannot be the zero address."
        );
        config.liquidityReceiver = liquidityReceiver;
    }

    function mint(address recipient, uint256 amount)
        external
        updateReserve
        initialized
        returns (uint256)
    {
        uint256 _redeemRate = redeemRate();
        require(
            config.baseToken.transferFrom(_msgSender(), address(this), amount)
        );

        //fee on transfer tokens
        uint256 baseBalance = config.baseToken.balanceOf(address(this));
        uint256 pyro = (baseBalance * ONE) / _redeemRate;
        _mint(recipient, pyro);
        emit Transfer(address(0), recipient, uint128(amount), 0);
        return pyro;
    }

    function redeemFrom(
        address owner,
        address recipient,
        uint256 amount
    ) external returns (uint256) {
        uint256 currentAllowance = _allowances[owner][_msgSender()];
        _approve(owner, _msgSender(), currentAllowance - amount);
        return _redeem(owner, recipient, amount);
    }

    function redeem(address recipient, uint256 amount)
        external
        returns (uint256)
    {
        return _redeem(recipient, _msgSender(), amount);
    }

    function _redeem(
        address recipient,
        address owner,
        uint256 amount
    ) internal updateReserve returns (uint256) {
        uint256 _redeemRate = redeemRate();
        _balances[owner] -= amount;
        _totalSupply -= amount;
        uint256 fee = calculateRedemptionFee(amount, owner);

        uint256 net = amount - fee;
        uint256 baseTokens = (_redeemRate * net) / ONE;
        emit Transfer(owner, address(0), uint128(amount), uint128(amount));
        require(
            config.baseToken.transfer(recipient, baseTokens),
            "PyroToken reserve transfer failed."
        );
        return baseTokens;
    }

    function redeemRate() public view returns (uint256) {
        uint256 balanceOfBase = config.baseToken.balanceOf(address(this));
        if (_totalSupply == 0 || balanceOfBase == 0) return ONE;

        return (balanceOfBase * ONE) / _totalSupply;
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    function setObligationFor(
        address borrower,
        uint256 baseTokenBorrowed,
        uint256 pyroTokenStaked
    ) external onlyLoanOfficer nonReentrant returns (bool success) {
        DebtObligation memory currentDebt = debtObligations[borrower];
        uint256 rate = redeemRate();
        uint256 minPyroStake = (baseTokenBorrowed * ONE) / rate;
        require(pyroTokenStaked >= minPyroStake, "Pyro: Unsustainable loan.");

        debtObligations[borrower] = DebtObligation(
            baseTokenBorrowed,
            pyroTokenStaked,
            rate
        );

        int256 netStake = int256(pyroTokenStaked) - int256(currentDebt.pyro);
        uint256 stake;
        if (netStake > 0) {
            stake = uint256(netStake);

            uint256 currentAllowance = _allowances[borrower][_msgSender()];
            _approve(borrower, _msgSender(), currentAllowance - stake);

            _balances[borrower] -= stake;
            _balances[address(this)] += stake;
        } else if (netStake < 0) {
            stake = uint256(-netStake);
            _balances[borrower] += stake;
            _balances[address(this)] -= stake;
        }

        int256 netBorrowing = int256(baseTokenBorrowed) -
            int256(currentDebt.base);
        if (netBorrowing > 0) {
            config.baseToken.transfer(borrower, uint256(netBorrowing));
        } else if (netBorrowing < 0) {
            config.baseToken.transferFrom(
                borrower,
                address(this),
                uint256(-netBorrowing)
            );
        }

        success = true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        if (recipient == address(0)) {
            burn(amount);
            return;
        }
        uint256 senderBalance = _balances[sender];
        uint256 fee = calculateTransferFee(amount, sender, recipient);

        _totalSupply -= fee;

        uint256 netReceived = amount - fee;
        _balances[sender] = senderBalance - amount;
        _balances[recipient] += netReceived;

        emit Transfer(sender, recipient, uint128(amount), uint128(fee)); //extra parameters don't throw off parsers when interpreted through JSON.
    }

    function calculateTransferFee(
        uint256 amount,
        address sender,
        address receiver
    ) public view returns (uint256) {
        uint256 senderStatus = uint256(feeExemptionStatus[sender]);
        uint256 receiverStatus = uint256(feeExemptionStatus[receiver]);
        if (
            (senderStatus >= 1 && senderStatus <= 4) ||
            (receiverStatus >= 4 && receiverStatus <= 6)
        ) {
            return 0;
        }
        return amount / 1000;
    }

    function calculateRedemptionFee(uint256 amount, address redeemer)
        public
        view
        returns (uint256)
    {
        uint256 status = uint256(feeExemptionStatus[redeemer]);
        if ((status >= 3 || status <= 4) || status > 5) return 0;
        return (amount * 2) / 100;
    }
}

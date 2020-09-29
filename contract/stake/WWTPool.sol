pragma solidity ^0.5.8;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./SafeTRC20.sol";
import "./Math.sol";

contract IRewardDistributionRecipient is Ownable {
    address public rewardDistribution;

    function notifyRewardAmount(uint256 reward) external;

    modifier onlyRewardDistribution() {
        require(_msgSender() == rewardDistribution, "Caller is not reward distribution");
        _;
    }

    function setRewardDistribution(address _rewardDistribution)
        external
        onlyOwner
    {
        rewardDistribution = _rewardDistribution;
    }
}


contract LPTokenWrapper {
    using SafeMath for uint256;
    using SafeTRC20 for ITRC20;

    ITRC20 public tokenAddr;
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        tokenAddr.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) public {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        tokenAddr.safeTransfer(msg.sender, amount);
    }
}

contract WWTPool is LPTokenWrapper, IRewardDistributionRecipient {
    // wwtToken,"41c8e782045cf996e8af0708323c416fff1313b8a6"
    ITRC20 public wwtToken = ITRC20(0x41c8e782045cf996e8af0708323c416fff1313b8a6);
    uint256 public DURATION = 1_209_600; // 14 days

    uint256 public starttime = 1601391600; // 2020/9/29 23:0:0 (HKT)
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event Rescue(address indexed dst, uint sad);
    event RescueToken(address indexed dst,address indexed token, uint sad);

    constructor(address _trc20, uint256 _starttime,uint256 duration) public{
        tokenAddr = ITRC20(_trc20);
        rewardDistribution = _msgSender();
        starttime = _starttime;
        DURATION = duration;
    }


    modifier checkStart() {
        require(block.timestamp >= starttime,"not start");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount) public updateReward(msg.sender) checkStart {
        require(amount > 0, "Cannot stake 0");
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) checkStart {
        require(amount > 0, "Cannot withdraw 0");
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawAndGetReward(uint256 amount) public updateReward(msg.sender) checkStart {
        require(amount <= balanceOf(msg.sender), "Cannot withdraw exceed the balance");
        withdraw(amount);
        getReward();
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }

    function getReward() public updateReward(msg.sender) checkStart {
        uint256 trueReward = earned(msg.sender);
        if (trueReward > 0) {
            rewards[msg.sender] = 0;
            wwtToken.safeTransfer(msg.sender, trueReward);
            emit RewardPaid(msg.sender, trueReward);
        }
    }

    function notifyRewardAmount(uint256 reward)
        external
        onlyRewardDistribution
        updateReward(address(0))
    {
        if (block.timestamp > starttime) {
          if (block.timestamp >= periodFinish) {
              rewardRate = reward.div(DURATION);
          } else {
              uint256 remaining = periodFinish.sub(block.timestamp);
              uint256 leftover = remaining.mul(rewardRate);
              rewardRate = reward.add(leftover).div(DURATION);
          }
          lastUpdateTime = block.timestamp;
          periodFinish = block.timestamp.add(DURATION);
          emit RewardAdded(reward);
        } else {
          rewardRate = reward.div(DURATION);
          lastUpdateTime = starttime;
          periodFinish = starttime.add(DURATION);
          emit RewardAdded(reward);
        }
    }
    /**
    * @dev rescue simple transfered TRX.
    */
    function rescue(address payable to_, uint256 amount_)
    external
    onlyOwner
    {
        require(to_ != address(0), "must not 0");
        require(amount_ > 0, "must gt 0");

        to_.transfer(amount_);
        emit Rescue(to_, amount_);
    }
    /**
     * @dev rescue simple transfered unrelated token.
     */
    function rescue(address to_, ITRC20 token_, uint256 amount_)
    external
    onlyOwner
    {
        require(to_ != address(0), "must not 0");
        require(amount_ > 0, "must gt 0");
        require(token_ != wwtToken, "must not wwtToken");
        require(token_ != tokenAddr, "must not this plToken");

        token_.transfer(to_, amount_);
        emit RescueToken(to_, address(token_), amount_);
    }
}

pragma solidity ^0.5.8;

import "./Context.sol";
import "./ITRC20.sol";
import "./BaseTRC20.sol";

contract WWTToken is ITRC20, TRC20Detailed {
    constructor() public TRC20Detailed("WinWin TOKEN", "WWT", 18){
        _mint(msg.sender, 2100 * 10 ** 18);
    }
}

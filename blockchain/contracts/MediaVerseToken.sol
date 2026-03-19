//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MediaVerseToken
 * @dev ERC-20 token that users can get rewarded for completing tasks
 */
contract MediaVerseToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    
    //Events
    event UserRewarded(address indexed user, uint256 amount, string taskId);
    
    constructor() 
        ERC20("MediaVerse Token", "MVT") 
        ERC20Permit("MediaVerse Token") 
        Ownable(msg.sender) 
    {
        //Start supply to contract owner (backend wallet)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    /**
     * @dev Backend calls this function to reward users
     * @param user The user wallet address
     * @param amount How much token (in wei)
     */
    function rewardUser(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(user, amount);
        
        emit UserRewarded(user, amount, "");
    }
}
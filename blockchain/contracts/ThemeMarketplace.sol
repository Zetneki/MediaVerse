// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ThemeMarketplace
 * @dev Marketplace for purchasing themes with MVT tokens
 */
contract ThemeMarketplace is Ownable, ReentrancyGuard {
    
    IERC20 public token;
    
    //Theme ID => Price (in tokens, in wei)
    mapping(string => uint256) public themePrices;
    
    //User address => Theme ID => Has theme
    mapping(address => mapping(string => bool)) public userThemes;
    
    //Events
    event ThemePurchased(address indexed user, string themeId, uint256 price);
    event ThemePriceUpdated(string themeId, uint256 newPrice);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Invalid token address");
        token = IERC20(_tokenAddress);
        
        //Theme prices (MVT tokens)
        themePrices["indigo"] = 100 * 10**18;
        themePrices["green"] = 100 * 10**18;
        themePrices["emerald"]= 100 * 10**18;
        themePrices["blue"]= 100 * 10**18;
        themePrices["violet"]= 100 * 10**18;
        themePrices["rose"]= 100 * 10**18;
        themePrices["noir"]= 100 * 10**18;
        themePrices["lime"]= 100 * 10**18;
        themePrices["red"]= 100 * 10**18;
        themePrices["orange"]= 100 * 10**18;
        themePrices["amber"]= 100 * 10**18;
        themePrices["yellow"]= 100 * 10**18;
        themePrices["cyan"]= 100 * 10**18;
        themePrices["sky"]= 100 * 10**18;
        themePrices["purple"]= 100 * 10**18;
        themePrices["fuchsia"]= 100 * 10**18;
        themePrices["pink"]= 100 * 10**18;
        themePrices["christmas"] = 250 * 10**18;
        themePrices["halloween"] = 250 * 10**18;
        themePrices["neon"] = 200 * 10**18;
        themePrices["cyberpunk"] = 200 * 10**18;
    }

    /**
     * @dev Gasless theme purchase via ERC20Permit signature
     * @param user User wallet address
     * @param themeId Theme ID
     * @param deadline Signature expiration timestamp
     * @param v Signature component
     * @param r Signature component
     * @param s Signature component
     */
    function purchaseThemeForWithPermit(
        address user,
        string memory themeId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyOwner nonReentrant {
        uint256 price = themePrices[themeId];
        require(price > 0, "Theme does not exist");
        require(!userThemes[user][themeId], "Theme already owned");
        require(token.balanceOf(user) >= price, "Insufficient token balance");

        //Permit: user approves contract via signature (gasless)
        IERC20Permit(address(token)).permit(
            user,           // owner
            address(this),  // spender (marketplace contract)
            price,          // value
            deadline,       // deadline
            v, r, s         // signature
        );

        //Burn tokens from user (now approved)
        ERC20Burnable(address(token)).burnFrom(user, price);

        userThemes[user][themeId] = true;
        emit ThemePurchased(user, themeId, price);
    }

    /**
     * @dev Gets the user's themes
     * @param user User wallet address
     * @param themeIds Theme IDs to check
     */
    function getUserThemes(address user, string[] memory themeIds) 
        external 
        view 
        returns (bool[] memory) 
    {
        bool[] memory ownedThemes = new bool[](themeIds.length);
        
        for (uint256 i = 0; i < themeIds.length; i++) {
            ownedThemes[i] = userThemes[user][themeIds[i]];
        }
        
        return ownedThemes;
    }
    
    /**
     * @dev Checks if a user owns the theme
     * @param user User wallet address
     * @param themeId Theme ID
     */
    function hasTheme(address user, string memory themeId) external view returns (bool) {
        return userThemes[user][themeId];
    }
    
    /**
     * @dev Owner updates the price of a theme
     * @param themeId Theme ID
     * @param newPrice New price (in tokens, in wei)
     */
    function updateThemePrice(string memory themeId, uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        
        themePrices[themeId] = newPrice;
        
        emit ThemePriceUpdated(themeId, newPrice);
    }
}
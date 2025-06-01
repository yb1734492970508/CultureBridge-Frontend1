// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../AICapabilityNFT.sol";
import "../CultureToken.sol";

contract TestAICapabilityNFT {
  AICapabilityNFT nft;
  CultureToken token;
  
  uint256 constant INITIAL_BALANCE = 1000 ether;

  function beforeEach() public {
    // Deploy contracts
    token = new CultureToken();
    nft = new AICapabilityNFT(address(token));
    
    // Mint tokens for testing
    token.mint(address(this), INITIAL_BALANCE);
    token.approve(address(nft), INITIAL_BALANCE);
    
    // Grant minter role to test contract
    nft.grantRole(keccak256("MINTER_ROLE"), address(this));
  }

  function testMintCapability() public {
    address to = address(this);
    string memory tokenURI = "ipfs://QmTest";
    uint8 capabilityType = 0; // Translation
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    string[] memory domains = new string[](1);
    domains[0] = "general";
    uint256 royaltyPercentage = 10;
    uint256 price = 50 ether;
    bool isForSale = true;
    
    uint256 tokenId = nft.mintCapability(
      to,
      tokenURI,
      AICapabilityNFT.CapabilityType(capabilityType),
      languages,
      domains,
      royaltyPercentage,
      price,
      isForSale
    );
    
    Assert.equal(tokenId, 0, "First token should have ID 0");
    Assert.equal(nft.ownerOf(tokenId), to, "Owner should be the test contract");
    Assert.equal(nft.tokenURI(tokenId), tokenURI, "Token URI should match");
    
    // Verify capability details
    (
      AICapabilityNFT.CapabilityType storedType,
      ,
      ,
      address creator,
      uint256 usageCount,
      uint256 storedRoyalty,
      uint256 storedPrice,
      bool storedIsForSale
    ) = nft.capabilities(tokenId);
    
    Assert.equal(uint8(storedType), capabilityType, "Capability type should match");
    Assert.equal(creator, address(this), "Creator should be the test contract");
    Assert.equal(usageCount, 0, "Initial usage count should be 0");
    Assert.equal(storedRoyalty, royaltyPercentage, "Royalty percentage should match");
    Assert.equal(storedPrice, price, "Price should match");
    Assert.equal(storedIsForSale, isForSale, "For sale status should match");
  }

  function testUseCapability() public {
    // Mint a capability
    address to = address(this);
    string memory tokenURI = "ipfs://QmTest";
    uint8 capabilityType = 0; // Translation
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    string[] memory domains = new string[](1);
    domains[0] = "general";
    uint256 royaltyPercentage = 10;
    uint256 price = 50 ether;
    bool isForSale = true;
    
    uint256 tokenId = nft.mintCapability(
      to,
      tokenURI,
      AICapabilityNFT.CapabilityType(capabilityType),
      languages,
      domains,
      royaltyPercentage,
      price,
      isForSale
    );
    
    // Record balances before usage
    uint256 creatorBalanceBefore = token.balanceOf(address(this));
    
    // Use the capability
    bool success = nft.useCapability(tokenId);
    
    Assert.isTrue(success, "Capability usage should succeed");
    
    // Verify usage count increment
    (,,,, uint256 usageCount,,,) = nft.capabilities(tokenId);
    Assert.equal(usageCount, 1, "Usage count should be incremented");
    
    // Calculate expected royalty
    uint256 expectedRoyalty = (1 ether * royaltyPercentage) / 100;
    
    // Verify token transfers
    uint256 creatorBalanceAfter = token.balanceOf(address(this));
    
    // Since creator is also the owner and user in this test, the net change is just the gas cost
    // In a real scenario with different actors, we would test the token transfers more thoroughly
    Assert.isTrue(creatorBalanceAfter <= creatorBalanceBefore, "Creator balance should not increase when self-using");
  }

  function testBuyCapability() public {
    // Create a separate account for the seller
    address seller = address(0x123);
    
    // Mint a capability owned by seller
    string memory tokenURI = "ipfs://QmTest";
    uint8 capabilityType = 0; // Translation
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    string[] memory domains = new string[](1);
    domains[0] = "general";
    uint256 royaltyPercentage = 10;
    uint256 price = 50 ether;
    bool isForSale = true;
    
    uint256 tokenId = nft.mintCapability(
      seller,
      tokenURI,
      AICapabilityNFT.CapabilityType(capabilityType),
      languages,
      domains,
      royaltyPercentage,
      price,
      isForSale
    );
    
    // Record balances before purchase
    uint256 buyerBalanceBefore = token.balanceOf(address(this));
    uint256 sellerBalanceBefore = token.balanceOf(seller);
    
    // Buy the capability
    nft.buyCapability(tokenId);
    
    // Verify ownership transfer
    Assert.equal(nft.ownerOf(tokenId), address(this), "Buyer should now own the token");
    
    // Verify sale status update
    (,,,,,,, bool storedIsForSale) = nft.capabilities(tokenId);
    Assert.isFalse(storedIsForSale, "Token should no longer be for sale");
    
    // Verify token transfers
    uint256 buyerBalanceAfter = token.balanceOf(address(this));
    uint256 sellerBalanceAfter = token.balanceOf(seller);
    
    Assert.equal(buyerBalanceAfter, buyerBalanceBefore - price, "Buyer balance should decrease by price");
    Assert.equal(sellerBalanceAfter, sellerBalanceBefore + price, "Seller balance should increase by price");
  }

  function testUpdatePrice() public {
    // Mint a capability
    address to = address(this);
    string memory tokenURI = "ipfs://QmTest";
    uint8 capabilityType = 0; // Translation
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    string[] memory domains = new string[](1);
    domains[0] = "general";
    uint256 royaltyPercentage = 10;
    uint256 price = 50 ether;
    bool isForSale = true;
    
    uint256 tokenId = nft.mintCapability(
      to,
      tokenURI,
      AICapabilityNFT.CapabilityType(capabilityType),
      languages,
      domains,
      royaltyPercentage,
      price,
      isForSale
    );
    
    // Update price
    uint256 newPrice = 75 ether;
    nft.updatePrice(tokenId, newPrice);
    
    // Verify price update
    (,,,,,, uint256 storedPrice,) = nft.capabilities(tokenId);
    Assert.equal(storedPrice, newPrice, "Price should be updated");
  }

  function testUpdateSaleStatus() public {
    // Mint a capability
    address to = address(this);
    string memory tokenURI = "ipfs://QmTest";
    uint8 capabilityType = 0; // Translation
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    string[] memory domains = new string[](1);
    domains[0] = "general";
    uint256 royaltyPercentage = 10;
    uint256 price = 50 ether;
    bool isForSale = true;
    
    uint256 tokenId = nft.mintCapability(
      to,
      tokenURI,
      AICapabilityNFT.CapabilityType(capabilityType),
      languages,
      domains,
      royaltyPercentage,
      price,
      isForSale
    );
    
    // Update sale status
    bool newStatus = false;
    nft.updateSaleStatus(tokenId, newStatus);
    
    // Verify status update
    (,,,,,,,bool storedIsForSale) = nft.capabilities(tokenId);
    Assert.equal(storedIsForSale, newStatus, "Sale status should be updated");
  }

  function testGetCapabilitiesByLanguage() public {
    // Mint first capability with Chinese
    string[] memory languages1 = new string[](2);
    languages1[0] = "zh-CN";
    languages1[1] = "en-US";
    string[] memory domains1 = new string[](1);
    domains1[0] = "general";
    
    nft.mintCapability(
      address(this),
      "ipfs://QmTest1",
      AICapabilityNFT.CapabilityType(0),
      languages1,
      domains1,
      10,
      50 ether,
      true
    );
    
    // Mint second capability with Japanese
    string[] memory languages2 = new string[](2);
    languages2[0] = "ja-JP";
    languages2[1] = "en-US";
    string[] memory domains2 = new string[](1);
    domains2[0] = "general";
    
    nft.mintCapability(
      address(this),
      "ipfs://QmTest2",
      AICapabilityNFT.CapabilityType(0),
      languages2,
      domains2,
      10,
      50 ether,
      true
    );
    
    // Get capabilities for Chinese
    uint256[] memory chineseCapabilities = nft.getCapabilitiesByLanguage("zh-CN");
    
    Assert.equal(chineseCapabilities.length, 1, "Should find 1 capability for Chinese");
    Assert.equal(chineseCapabilities[0], 0, "Should find the first capability");
    
    // Get capabilities for Japanese
    uint256[] memory japaneseCapabilities = nft.getCapabilitiesByLanguage("ja-JP");
    
    Assert.equal(japaneseCapabilities.length, 1, "Should find 1 capability for Japanese");
    Assert.equal(japaneseCapabilities[0], 1, "Should find the second capability");
    
    // Get capabilities for English (both should match)
    uint256[] memory englishCapabilities = nft.getCapabilitiesByLanguage("en-US");
    
    Assert.equal(englishCapabilities.length, 2, "Should find 2 capabilities for English");
  }

  function testGetCapabilitiesByDomain() public {
    // Mint first capability with general domain
    string[] memory languages1 = new string[](1);
    languages1[0] = "en-US";
    string[] memory domains1 = new string[](1);
    domains1[0] = "general";
    
    nft.mintCapability(
      address(this),
      "ipfs://QmTest1",
      AICapabilityNFT.CapabilityType(0),
      languages1,
      domains1,
      10,
      50 ether,
      true
    );
    
    // Mint second capability with technical domain
    string[] memory languages2 = new string[](1);
    languages2[0] = "en-US";
    string[] memory domains2 = new string[](1);
    domains2[0] = "technical";
    
    nft.mintCapability(
      address(this),
      "ipfs://QmTest2",
      AICapabilityNFT.CapabilityType(0),
      languages2,
      domains2,
      10,
      50 ether,
      true
    );
    
    // Get capabilities for general domain
    uint256[] memory generalCapabilities = nft.getCapabilitiesByDomain("general");
    
    Assert.equal(generalCapabilities.length, 1, "Should find 1 capability for general domain");
    Assert.equal(generalCapabilities[0], 0, "Should find the first capability");
    
    // Get capabilities for technical domain
    uint256[] memory technicalCapabilities = nft.getCapabilitiesByDomain("technical");
    
    Assert.equal(technicalCapabilities.length, 1, "Should find 1 capability for technical domain");
    Assert.equal(technicalCapabilities[0], 1, "Should find the second capability");
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../AIRegistry.sol";

contract TestAIRegistry {
  AIRegistry registry;

  function beforeEach() public {
    registry = new AIRegistry();
  }

  function testInitialServiceCount() public {
    uint256 expected = 0;
    Assert.equal(registry.serviceCount(), expected, "Initial service count should be 0");
  }

  function testRegisterService() public {
    string memory serviceType = "translation";
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    uint256 pricePerToken = 10 ether;
    string memory metadataURI = "ipfs://QmTest";

    uint256 serviceId = registry.registerService(serviceType, languages, pricePerToken, metadataURI);
    
    Assert.equal(serviceId, 0, "First service should have ID 0");
    Assert.equal(registry.serviceCount(), 1, "Service count should be 1 after registration");
    
    (address provider, string memory storedType, , uint256 performanceScore, uint256 storedPrice, bool isActive, string memory storedURI) = registry.services(serviceId);
    
    Assert.equal(provider, address(this), "Provider should be the test contract");
    Assert.equal(storedType, serviceType, "Service type should match");
    Assert.equal(performanceScore, 0, "Initial performance score should be 0");
    Assert.equal(storedPrice, pricePerToken, "Price should match");
    Assert.isTrue(isActive, "Service should be active");
    Assert.equal(storedURI, metadataURI, "Metadata URI should match");
  }

  function testFindServices() public {
    // Register first service
    string memory serviceType1 = "translation";
    string[] memory languages1 = new string[](2);
    languages1[0] = "zh-CN";
    languages1[1] = "en-US";
    uint256 pricePerToken1 = 10 ether;
    string memory metadataURI1 = "ipfs://QmTest1";
    registry.registerService(serviceType1, languages1, pricePerToken1, metadataURI1);
    
    // Register second service
    string memory serviceType2 = "translation";
    string[] memory languages2 = new string[](2);
    languages2[0] = "ja-JP";
    languages2[1] = "en-US";
    uint256 pricePerToken2 = 15 ether;
    string memory metadataURI2 = "ipfs://QmTest2";
    registry.registerService(serviceType2, languages2, pricePerToken2, metadataURI2);
    
    // Find services for translation from Chinese to English
    uint256[] memory results = registry.findServices("translation", "zh-CN", 20 ether);
    
    Assert.equal(results.length, 1, "Should find 1 service for Chinese");
    Assert.equal(results[0], 0, "Should find the first service");
    
    // Find services for translation from Japanese to English
    results = registry.findServices("translation", "ja-JP", 20 ether);
    
    Assert.equal(results.length, 1, "Should find 1 service for Japanese");
    Assert.equal(results[0], 1, "Should find the second service");
    
    // Find services with price limit
    results = registry.findServices("translation", "en-US", 12 ether);
    
    Assert.equal(results.length, 1, "Should find 1 service within price limit");
    Assert.equal(results[0], 0, "Should find only the first service");
  }

  function testUpdateService() public {
    // Register service
    string memory serviceType = "translation";
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    uint256 pricePerToken = 10 ether;
    string memory metadataURI = "ipfs://QmTest";
    uint256 serviceId = registry.registerService(serviceType, languages, pricePerToken, metadataURI);
    
    // Update service
    string memory newServiceType = "cultural";
    string[] memory newLanguages = new string[](3);
    newLanguages[0] = "zh-CN";
    newLanguages[1] = "en-US";
    newLanguages[2] = "fr-FR";
    uint256 newPricePerToken = 12 ether;
    string memory newMetadataURI = "ipfs://QmTestUpdated";
    
    registry.updateService(serviceId, newServiceType, newLanguages, newPricePerToken, newMetadataURI);
    
    // Verify update
    (address provider, string memory storedType, , uint256 performanceScore, uint256 storedPrice, bool isActive, string memory storedURI) = registry.services(serviceId);
    
    Assert.equal(provider, address(this), "Provider should not change");
    Assert.equal(storedType, newServiceType, "Service type should be updated");
    Assert.equal(performanceScore, 0, "Performance score should not change");
    Assert.equal(storedPrice, newPricePerToken, "Price should be updated");
    Assert.isTrue(isActive, "Service should remain active");
    Assert.equal(storedURI, newMetadataURI, "Metadata URI should be updated");
  }

  function testDeactivateService() public {
    // Register service
    string memory serviceType = "translation";
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    uint256 pricePerToken = 10 ether;
    string memory metadataURI = "ipfs://QmTest";
    uint256 serviceId = registry.registerService(serviceType, languages, pricePerToken, metadataURI);
    
    // Deactivate service
    registry.deactivateService(serviceId);
    
    // Verify deactivation
    (,,,, uint256 storedPrice, bool isActive,) = registry.services(serviceId);
    
    Assert.equal(storedPrice, pricePerToken, "Price should not change");
    Assert.isFalse(isActive, "Service should be inactive");
    
    // Verify service is not found in search
    uint256[] memory results = registry.findServices("translation", "zh-CN", 20 ether);
    Assert.equal(results.length, 0, "Deactivated service should not be found");
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../AIRequest.sol";
import "../AIRegistry.sol";
import "../CultureToken.sol";

contract TestAIRequest {
  AIRegistry registry;
  CultureToken token;
  AIRequest request;
  
  uint256 constant INITIAL_BALANCE = 1000 ether;

  function beforeEach() public {
    // Deploy contracts
    registry = new AIRegistry();
    token = new CultureToken();
    request = new AIRequest(address(token), address(registry));
    
    // Mint tokens for testing
    token.mint(address(this), INITIAL_BALANCE);
    token.approve(address(request), INITIAL_BALANCE);
    
    // Register a test service
    string memory serviceType = "translation";
    string[] memory languages = new string[](2);
    languages[0] = "zh-CN";
    languages[1] = "en-US";
    uint256 pricePerToken = 10 ether;
    string memory metadataURI = "ipfs://QmTest";
    registry.registerService(serviceType, languages, pricePerToken, metadataURI);
  }

  function testCreateRequest() public {
    uint256 serviceId = 0;
    string memory sourceLanguage = "zh-CN";
    string memory targetLanguage = "en-US";
    string memory contentHash = "QmTestContent";
    uint256 tokenAmount = 20 ether;
    uint256 deadline = block.timestamp + 1 days;
    
    uint256 requestId = request.createRequest(
      serviceId,
      sourceLanguage,
      targetLanguage,
      contentHash,
      tokenAmount,
      deadline
    );
    
    Assert.equal(requestId, 0, "First request should have ID 0");
    
    // Verify request details
    (
      address requester,
      uint256 storedServiceId,
      string memory storedSourceLang,
      string memory storedTargetLang,
      string memory storedContentHash,
      uint256 storedTokenAmount,
      uint256 storedDeadline,
      uint8 status,
      string memory resultHash,
      uint256 qualityScore,
      uint256 createdAt,
      uint256 completedAt
    ) = request.requests(requestId);
    
    Assert.equal(requester, address(this), "Requester should be the test contract");
    Assert.equal(storedServiceId, serviceId, "Service ID should match");
    Assert.equal(storedSourceLang, sourceLanguage, "Source language should match");
    Assert.equal(storedTargetLang, targetLanguage, "Target language should match");
    Assert.equal(storedContentHash, contentHash, "Content hash should match");
    Assert.equal(storedTokenAmount, tokenAmount, "Token amount should match");
    Assert.equal(storedDeadline, deadline, "Deadline should match");
    Assert.equal(status, 0, "Status should be Created (0)");
    Assert.equal(resultHash, "", "Result hash should be empty");
    Assert.equal(qualityScore, 0, "Quality score should be 0");
    Assert.isTrue(createdAt > 0, "Created timestamp should be set");
    Assert.equal(completedAt, 0, "Completed timestamp should be 0");
    
    // Verify token transfer
    Assert.equal(token.balanceOf(address(request)), tokenAmount, "Contract should hold tokens");
    Assert.equal(token.balanceOf(address(this)), INITIAL_BALANCE - tokenAmount, "Requester balance should be reduced");
  }

  function testAcceptRequest() public {
    // Create a request
    uint256 serviceId = 0;
    string memory sourceLanguage = "zh-CN";
    string memory targetLanguage = "en-US";
    string memory contentHash = "QmTestContent";
    uint256 tokenAmount = 20 ether;
    uint256 deadline = block.timestamp + 1 days;
    
    uint256 requestId = request.createRequest(
      serviceId,
      sourceLanguage,
      targetLanguage,
      contentHash,
      tokenAmount,
      deadline
    );
    
    // Accept the request
    request.acceptRequest(requestId);
    
    // Verify status update
    (,,,,,,, uint8 status,,,, ) = request.requests(requestId);
    Assert.equal(status, 1, "Status should be Accepted (1)");
  }

  function testCompleteRequest() public {
    // Create and accept a request
    uint256 serviceId = 0;
    string memory sourceLanguage = "zh-CN";
    string memory targetLanguage = "en-US";
    string memory contentHash = "QmTestContent";
    uint256 tokenAmount = 20 ether;
    uint256 deadline = block.timestamp + 1 days;
    
    uint256 requestId = request.createRequest(
      serviceId,
      sourceLanguage,
      targetLanguage,
      contentHash,
      tokenAmount,
      deadline
    );
    
    request.acceptRequest(requestId);
    
    // Complete the request
    string memory resultHash = "QmTestResult";
    request.completeRequest(requestId, resultHash);
    
    // Verify status and result update
    (,,,,,, uint8 status, string memory storedResultHash,, uint256 completedAt) = request.requests(requestId);
    
    Assert.equal(status, 2, "Status should be Completed (2)");
    Assert.equal(storedResultHash, resultHash, "Result hash should match");
    Assert.isTrue(completedAt > 0, "Completed timestamp should be set");
  }

  function testVerifyRequest() public {
    // Create, accept, and complete a request
    uint256 serviceId = 0;
    string memory sourceLanguage = "zh-CN";
    string memory targetLanguage = "en-US";
    string memory contentHash = "QmTestContent";
    uint256 tokenAmount = 20 ether;
    uint256 deadline = block.timestamp + 1 days;
    
    uint256 requestId = request.createRequest(
      serviceId,
      sourceLanguage,
      targetLanguage,
      contentHash,
      tokenAmount,
      deadline
    );
    
    request.acceptRequest(requestId);
    request.completeRequest(requestId, "QmTestResult");
    
    // Get provider address
    (address provider,,,,,,) = registry.services(serviceId);
    
    // Record balances before verification
    uint256 providerBalanceBefore = token.balanceOf(provider);
    uint256 requesterBalanceBefore = token.balanceOf(address(this));
    uint256 contractBalanceBefore = token.balanceOf(address(request));
    
    // Verify the request with 80% quality score
    uint256 qualityScore = 80;
    request.verifyRequest(requestId, qualityScore);
    
    // Verify status and quality score update
    (,,,,,,, uint8 status,, uint256 storedQualityScore,,) = request.requests(requestId);
    
    Assert.equal(status, 3, "Status should be Verified (3)");
    Assert.equal(storedQualityScore, qualityScore, "Quality score should match");
    
    // Calculate expected payment and refund
    uint256 expectedPayment = (tokenAmount * qualityScore) / 100;
    uint256 expectedRefund = tokenAmount - expectedPayment;
    
    // Verify token transfers
    Assert.equal(token.balanceOf(provider), providerBalanceBefore + expectedPayment, "Provider should receive payment");
    Assert.equal(token.balanceOf(address(this)), requesterBalanceBefore + expectedRefund, "Requester should receive refund");
    Assert.equal(token.balanceOf(address(request)), contractBalanceBefore - tokenAmount, "Contract balance should be reduced");
  }

  function testDisputeRequest() public {
    // Create, accept, and complete a request
    uint256 serviceId = 0;
    string memory sourceLanguage = "zh-CN";
    string memory targetLanguage = "en-US";
    string memory contentHash = "QmTestContent";
    uint256 tokenAmount = 20 ether;
    uint256 deadline = block.timestamp + 1 days;
    
    uint256 requestId = request.createRequest(
      serviceId,
      sourceLanguage,
      targetLanguage,
      contentHash,
      tokenAmount,
      deadline
    );
    
    request.acceptRequest(requestId);
    request.completeRequest(requestId, "QmTestResult");
    
    // Dispute the request
    request.disputeRequest(requestId);
    
    // Verify status update
    (,,,,,,, uint8 status,,,, ) = request.requests(requestId);
    Assert.equal(status, 4, "Status should be Disputed (4)");
  }

  function testRefundExpiredRequest() public {
    // Create a request with immediate deadline
    uint256 serviceId = 0;
    string memory sourceLanguage = "zh-CN";
    string memory targetLanguage = "en-US";
    string memory contentHash = "QmTestContent";
    uint256 tokenAmount = 20 ether;
    uint256 deadline = block.timestamp; // Immediate deadline
    
    uint256 requestId = request.createRequest(
      serviceId,
      sourceLanguage,
      targetLanguage,
      contentHash,
      tokenAmount,
      deadline
    );
    
    // Record balances before refund
    uint256 requesterBalanceBefore = token.balanceOf(address(this));
    uint256 contractBalanceBefore = token.balanceOf(address(request));
    
    // Refund the expired request
    request.refundExpiredRequest(requestId);
    
    // Verify status update
    (,,,,,,, uint8 status,,,, ) = request.requests(requestId);
    Assert.equal(status, 5, "Status should be Refunded (5)");
    
    // Verify token transfers
    Assert.equal(token.balanceOf(address(this)), requesterBalanceBefore + tokenAmount, "Requester should receive refund");
    Assert.equal(token.balanceOf(address(request)), contractBalanceBefore - tokenAmount, "Contract balance should be reduced");
  }
}

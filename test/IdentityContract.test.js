const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityContract", function () {
  let identityContract;
  let owner;
  let verifier;
  let user1;
  let user2;
  
  // 角色常量
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const VERIFIER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VERIFIER_ROLE"));
  
  beforeEach(async function () {
    // 获取合约工厂
    const IdentityContract = await ethers.getContractFactory("IdentityContract");
    
    // 获取测试账户
    [owner, verifier, user1, user2] = await ethers.getSigners();
    
    // 部署合约
    identityContract = await IdentityContract.deploy();
    await identityContract.deployed();
    
    // 授予verifier验证者角色
    await identityContract.grantRole(VERIFIER_ROLE, verifier.address);
  });
  
  describe("部署", function () {
    it("应该将部署者设置为管理员和验证者", async function () {
      expect(await identityContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await identityContract.hasRole(VERIFIER_ROLE, owner.address)).to.equal(true);
    });
  });
  
  describe("身份注册", function () {
    it("应该允许用户注册身份", async function () {
      await identityContract.connect(user1).registerIdentity(
        "John Doe",
        "China",
        "Chinese",
        "ipfs://profile1"
      );
      
      const identity = await identityContract.identities(user1.address);
      expect(identity.name).to.equal("John Doe");
      expect(identity.country).to.equal("China");
      expect(identity.culture).to.equal("Chinese");
      expect(identity.profileURI).to.equal("ipfs://profile1");
      expect(identity.isRegistered).to.equal(true);
      expect(identity.isVerified).to.equal(false);
    });
    
    it("不应该允许重复注册", async function () {
      await identityContract.connect(user1).registerIdentity(
        "John Doe",
        "China",
        "Chinese",
        "ipfs://profile1"
      );
      
      await expect(
        identityContract.connect(user1).registerIdentity(
          "John Smith",
          "USA",
          "American",
          "ipfs://profile2"
        )
      ).to.be.revertedWith("Already registered");
    });
  });
  
  describe("身份验证", function () {
    beforeEach(async function () {
      await identityContract.connect(user1).registerIdentity(
        "John Doe",
        "China",
        "Chinese",
        "ipfs://profile1"
      );
    });
    
    it("应该允许验证者验证身份", async function () {
      await identityContract.connect(verifier).verifyIdentity(
        user1.address,
        "Passport",
        "ipfs://verification1"
      );
      
      const identity = await identityContract.identities(user1.address);
      expect(identity.isVerified).to.equal(true);
      expect(identity.verificationDocument).to.equal("Passport");
      expect(identity.verificationURI).to.equal("ipfs://verification1");
      expect(identity.verifier).to.equal(verifier.address);
    });
    
    it("不应该允许非验证者验证身份", async function () {
      await expect(
        identityContract.connect(user2).verifyIdentity(
          user1.address,
          "Passport",
          "ipfs://verification1"
        )
      ).to.be.reverted;
    });
    
    it("不应该允许验证未注册的身份", async function () {
      await expect(
        identityContract.connect(verifier).verifyIdentity(
          user2.address,
          "Passport",
          "ipfs://verification1"
        )
      ).to.be.revertedWith("Not registered");
    });
  });
  
  describe("身份更新", function () {
    beforeEach(async function () {
      await identityContract.connect(user1).registerIdentity(
        "John Doe",
        "China",
        "Chinese",
        "ipfs://profile1"
      );
    });
    
    it("应该允许用户更新个人资料", async function () {
      await identityContract.connect(user1).updateProfile(
        "John Smith",
        "China",
        "Chinese",
        "ipfs://profile_updated"
      );
      
      const identity = await identityContract.identities(user1.address);
      expect(identity.name).to.equal("John Smith");
      expect(identity.profileURI).to.equal("ipfs://profile_updated");
    });
    
    it("不应该允许更新未注册的身份", async function () {
      await expect(
        identityContract.connect(user2).updateProfile(
          "Jane Doe",
          "USA",
          "American",
          "ipfs://profile3"
        )
      ).to.be.revertedWith("Not registered");
    });
    
    it("应该在更新后保持验证状态", async function () {
      // 先验证身份
      await identityContract.connect(verifier).verifyIdentity(
        user1.address,
        "Passport",
        "ipfs://verification1"
      );
      
      // 更新个人资料
      await identityContract.connect(user1).updateProfile(
        "John Smith",
        "China",
        "Chinese",
        "ipfs://profile_updated"
      );
      
      const identity = await identityContract.identities(user1.address);
      expect(identity.isVerified).to.equal(true);
    });
  });
  
  describe("身份查询", function () {
    beforeEach(async function () {
      // 注册多个身份
      await identityContract.connect(user1).registerIdentity(
        "John Doe",
        "China",
        "Chinese",
        "ipfs://profile1"
      );
      
      await identityContract.connect(user2).registerIdentity(
        "Jane Smith",
        "Japan",
        "Japanese",
        "ipfs://profile2"
      );
      
      // 验证user1的身份
      await identityContract.connect(verifier).verifyIdentity(
        user1.address,
        "Passport",
        "ipfs://verification1"
      );
    });
    
    it("应该正确获取用户身份信息", async function () {
      const identity = await identityContract.getIdentity(user1.address);
      expect(identity.name).to.equal("John Doe");
      expect(identity.country).to.equal("China");
      expect(identity.culture).to.equal("Chinese");
      expect(identity.isVerified).to.equal(true);
    });
    
    it("应该正确获取特定文化的用户列表", async function () {
      const chineseUsers = await identityContract.getUsersByculture("Chinese");
      expect(chineseUsers.length).to.equal(1);
      expect(chineseUsers[0]).to.equal(user1.address);
      
      const japaneseUsers = await identityContract.getUsersByculture("Japanese");
      expect(japaneseUsers.length).to.equal(1);
      expect(japaneseUsers[0]).to.equal(user2.address);
    });
    
    it("应该正确获取已验证用户列表", async function () {
      const verifiedUsers = await identityContract.getVerifiedUsers();
      expect(verifiedUsers.length).to.equal(1);
      expect(verifiedUsers[0]).to.equal(user1.address);
    });
  });
  
  describe("信任关系", function () {
    beforeEach(async function () {
      // 注册身份
      await identityContract.connect(user1).registerIdentity(
        "John Doe",
        "China",
        "Chinese",
        "ipfs://profile1"
      );
      
      await identityContract.connect(user2).registerIdentity(
        "Jane Smith",
        "Japan",
        "Japanese",
        "ipfs://profile2"
      );
    });
    
    it("应该允许用户建立信任关系", async function () {
      await identityContract.connect(user1).trustUser(user2.address);
      
      expect(await identityContract.isTrusted(user1.address, user2.address)).to.equal(true);
      expect(await identityContract.isTrusted(user2.address, user1.address)).to.equal(false);
    });
    
    it("应该允许用户撤销信任关系", async function () {
      await identityContract.connect(user1).trustUser(user2.address);
      await identityContract.connect(user1).untrustUser(user2.address);
      
      expect(await identityContract.isTrusted(user1.address, user2.address)).to.equal(false);
    });
    
    it("应该正确获取用户信任的地址列表", async function () {
      await identityContract.connect(user1).trustUser(user2.address);
      
      const trustedUsers = await identityContract.getTrustedUsers(user1.address);
      expect(trustedUsers.length).to.equal(1);
      expect(trustedUsers[0]).to.equal(user2.address);
    });
    
    it("应该正确获取信任用户的地址列表", async function () {
      await identityContract.connect(user1).trustUser(user2.address);
      
      const trustedByUsers = await identityContract.getTrustedByUsers(user2.address);
      expect(trustedByUsers.length).to.equal(1);
      expect(trustedByUsers[0]).to.equal(user1.address);
    });
  });
});

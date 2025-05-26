const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CultureTokenContract", function () {
  let tokenContract;
  let owner;
  let minter;
  let user1;
  let user2;
  
  // 角色常量
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  
  // 初始供应量
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  
  beforeEach(async function () {
    // 获取合约工厂
    const CultureTokenContract = await ethers.getContractFactory("CultureTokenContract");
    
    // 获取测试账户
    [owner, minter, user1, user2] = await ethers.getSigners();
    
    // 部署合约
    tokenContract = await CultureTokenContract.deploy(
      "CultureBridge Token",
      "CBT",
      INITIAL_SUPPLY
    );
    await tokenContract.deployed();
    
    // 授予minter铸币者角色
    await tokenContract.grantRole(MINTER_ROLE, minter.address);
  });
  
  describe("部署", function () {
    it("应该将部署者设置为管理员和铸币者", async function () {
      expect(await tokenContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await tokenContract.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
    });
    
    it("应该正确设置代币名称、符号和初始供应量", async function () {
      expect(await tokenContract.name()).to.equal("CultureBridge Token");
      expect(await tokenContract.symbol()).to.equal("CBT");
      expect(await tokenContract.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await tokenContract.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
  });
  
  describe("铸造代币", function () {
    it("应该允许铸币者铸造新代币", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await tokenContract.connect(minter).mint(user1.address, mintAmount);
      
      expect(await tokenContract.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await tokenContract.totalSupply()).to.equal(INITIAL_SUPPLY.add(mintAmount));
    });
    
    it("不应该允许非铸币者铸造代币", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await expect(
        tokenContract.connect(user1).mint(user2.address, mintAmount)
      ).to.be.reverted;
    });
  });
  
  describe("代币锁定", function () {
    beforeEach(async function () {
      // 转移一些代币给用户1
      const transferAmount = ethers.utils.parseEther("10000");
      await tokenContract.connect(owner).transfer(user1.address, transferAmount);
    });
    
    it("应该允许用户锁定代币", async function () {
      const lockAmount = ethers.utils.parseEther("5000");
      const lockDuration = 60 * 60 * 24 * 30; // 30天
      
      await tokenContract.connect(user1).lockTokens(lockAmount, lockDuration);
      
      expect(await tokenContract.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("5000"));
      expect(await tokenContract.balanceOf(tokenContract.address)).to.equal(lockAmount);
      
      const locks = await tokenContract.getLockedTokens(user1.address);
      expect(locks.length).to.equal(1);
      expect(locks[0].amount).to.equal(lockAmount);
      expect(locks[0].released).to.equal(false);
    });
    
    it("不应该允许锁定超过余额的代币", async function () {
      const lockAmount = ethers.utils.parseEther("15000"); // 超过用户余额
      const lockDuration = 60 * 60 * 24 * 30;
      
      await expect(
        tokenContract.connect(user1).lockTokens(lockAmount, lockDuration)
      ).to.be.revertedWith("Insufficient balance");
    });
    
    it("应该正确计算锁定的代币总量", async function () {
      // 锁定两次
      const lockAmount1 = ethers.utils.parseEther("2000");
      const lockAmount2 = ethers.utils.parseEther("3000");
      const lockDuration = 60 * 60 * 24 * 30;
      
      await tokenContract.connect(user1).lockTokens(lockAmount1, lockDuration);
      await tokenContract.connect(user1).lockTokens(lockAmount2, lockDuration);
      
      const totalLocked = await tokenContract.getTotalLockedAmount(user1.address);
      expect(totalLocked).to.equal(lockAmount1.add(lockAmount2));
    });
  });
  
  describe("代币释放", function () {
    beforeEach(async function () {
      // 转移一些代币给用户1
      const transferAmount = ethers.utils.parseEther("10000");
      await tokenContract.connect(owner).transfer(user1.address, transferAmount);
      
      // 锁定一些代币
      const lockAmount = ethers.utils.parseEther("5000");
      const lockDuration = 1; // 1秒，便于测试
      
      await tokenContract.connect(user1).lockTokens(lockAmount, lockDuration);
    });
    
    it("应该允许用户释放已到期的锁定代币", async function () {
      // 等待锁定期过后
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await tokenContract.connect(user1).releaseLockedTokens();
      
      expect(await tokenContract.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("10000"));
      
      const locks = await tokenContract.getLockedTokens(user1.address);
      expect(locks[0].released).to.equal(true);
    });
    
    it("应该正确计算可释放的代币数量", async function () {
      // 等待锁定期过后
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const releasable = await tokenContract.getReleasableAmount(user1.address);
      expect(releasable).to.equal(ethers.utils.parseEther("5000"));
    });
  });
});

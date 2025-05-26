const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PointSystemContract", function () {
  let pointContract;
  let owner;
  let pointManager;
  let user1;
  let user2;
  
  // 角色常量
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const POINT_MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("POINT_MANAGER_ROLE"));
  
  // 用户等级
  const UserLevel = {
    Basic: 0,
    Silver: 1,
    Gold: 2,
    Platinum: 3,
    Diamond: 4
  };
  
  beforeEach(async function () {
    // 获取合约工厂
    const PointSystemContract = await ethers.getContractFactory("PointSystemContract");
    
    // 获取测试账户
    [owner, pointManager, user1, user2] = await ethers.getSigners();
    
    // 部署合约
    pointContract = await PointSystemContract.deploy();
    await pointContract.deployed();
    
    // 授予pointManager积分管理者角色
    await pointContract.grantRole(POINT_MANAGER_ROLE, pointManager.address);
  });
  
  describe("部署", function () {
    it("应该将部署者设置为管理员和积分管理者", async function () {
      expect(await pointContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await pointContract.hasRole(POINT_MANAGER_ROLE, owner.address)).to.equal(true);
    });
    
    it("应该正确设置默认等级要求", async function () {
      expect(await pointContract.levelRequirements(UserLevel.Basic)).to.equal(0);
      expect(await pointContract.levelRequirements(UserLevel.Silver)).to.equal(1000);
      expect(await pointContract.levelRequirements(UserLevel.Gold)).to.equal(5000);
      expect(await pointContract.levelRequirements(UserLevel.Platinum)).to.equal(20000);
      expect(await pointContract.levelRequirements(UserLevel.Diamond)).to.equal(50000);
    });
  });
  
  describe("积分管理", function () {
    it("应该允许积分管理者添加积分", async function () {
      const pointAmount = 500;
      await pointContract.connect(pointManager).addPoints(
        user1.address,
        pointAmount,
        "Participation reward"
      );
      
      const userPoints = await pointContract.userPoints(user1.address);
      expect(userPoints.totalEarned).to.equal(pointAmount);
      expect(userPoints.currentBalance).to.equal(pointAmount);
      expect(userPoints.level).to.equal(UserLevel.Basic);
    });
    
    it("不应该允许非积分管理者添加积分", async function () {
      const pointAmount = 500;
      await expect(
        pointContract.connect(user2).addPoints(
          user1.address,
          pointAmount,
          "Unauthorized reward"
        )
      ).to.be.reverted;
    });
    
    it("应该允许积分管理者消费积分", async function () {
      // 先添加积分
      const earnAmount = 1000;
      await pointContract.connect(pointManager).addPoints(
        user1.address,
        earnAmount,
        "Initial points"
      );
      
      // 消费积分
      const spendAmount = 300;
      await pointContract.connect(pointManager).spendPoints(
        user1.address,
        spendAmount,
        "Redeem reward"
      );
      
      const userPoints = await pointContract.userPoints(user1.address);
      expect(userPoints.totalEarned).to.equal(earnAmount);
      expect(userPoints.totalSpent).to.equal(spendAmount);
      expect(userPoints.currentBalance).to.equal(earnAmount - spendAmount);
    });
    
    it("不应该允许消费超过余额的积分", async function () {
      // 添加积分
      const earnAmount = 500;
      await pointContract.connect(pointManager).addPoints(
        user1.address,
        earnAmount,
        "Initial points"
      );
      
      // 尝试消费超过余额的积分
      const spendAmount = 600;
      await expect(
        pointContract.connect(pointManager).spendPoints(
          user1.address,
          spendAmount,
          "Exceed balance"
        )
      ).to.be.revertedWith("Insufficient points");
    });
  });
  
  describe("用户等级", function () {
    it("应该根据积分自动更新用户等级", async function () {
      // 添加足够升级到Silver的积分
      await pointContract.connect(pointManager).addPoints(
        user1.address,
        1000,
        "Silver level points"
      );
      
      let userPoints = await pointContract.userPoints(user1.address);
      expect(userPoints.level).to.equal(UserLevel.Silver);
      
      // 添加足够升级到Gold的积分
      await pointContract.connect(pointManager).addPoints(
        user1.address,
        4000,
        "Gold level points"
      );
      
      userPoints = await pointContract.userPoints(user1.address);
      expect(userPoints.level).to.equal(UserLevel.Gold);
    });
    
    it("应该允许管理员修改等级要求", async function () {
      const newRequirement = 2000;
      await pointContract.connect(owner).setLevelRequirement(
        UserLevel.Silver,
        newRequirement
      );
      
      expect(await pointContract.levelRequirements(UserLevel.Silver)).to.equal(newRequirement);
    });
    
    it("不应该允许设置无效的等级要求", async function () {
      // 尝试将Silver等级要求设置为高于Gold等级
      await expect(
        pointContract.connect(owner).setLevelRequirement(
          UserLevel.Silver,
          6000 // 高于Gold等级要求
        )
      ).to.be.revertedWith("Requirement must be less than next level");
    });
  });
  
  describe("积分记录", function () {
    beforeEach(async function () {
      // 添加一些积分
      await pointContract.connect(pointManager).addPoints(
        user1.address,
        1000,
        "Initial points"
      );
      
      // 消费一些积分
      await pointContract.connect(pointManager).spendPoints(
        user1.address,
        300,
        "Spend points"
      );
    });
    
    it("应该正确记录积分历史", async function () {
      const records = await pointContract.getUserPointRecords(user1.address);
      expect(records.length).to.equal(2);
      
      const earnRecord = await pointContract.pointRecords(records[0]);
      expect(earnRecord.user).to.equal(user1.address);
      expect(earnRecord.amount).to.equal(1000);
      expect(earnRecord.recordType).to.equal(0); // Earned
      
      const spendRecord = await pointContract.pointRecords(records[1]);
      expect(spendRecord.user).to.equal(user1.address);
      expect(spendRecord.amount).to.equal(300);
      expect(spendRecord.recordType).to.equal(1); // Spent
    });
    
    it("应该正确计算积分余额和总量", async function () {
      expect(await pointContract.getPointBalance(user1.address)).to.equal(700);
      expect(await pointContract.getTotalEarnedPoints(user1.address)).to.equal(1000);
      expect(await pointContract.getTotalSpentPoints(user1.address)).to.equal(300);
    });
    
    it("应该正确计算升级所需积分", async function () {
      // 用户1当前有1000积分，处于Silver等级
      // 升级到Gold需要再获得4000积分
      expect(await pointContract.getPointsToNextLevel(user1.address)).to.equal(4000);
    });
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CultureNFTContract", function () {
  let nftContract;
  let owner;
  let creator;
  let user1;
  let user2;
  
  // 角色常量
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const CREATOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CREATOR_ROLE"));
  
  beforeEach(async function () {
    // 获取合约工厂
    const CultureNFTContract = await ethers.getContractFactory("CultureNFTContract");
    
    // 获取测试账户
    [owner, creator, user1, user2] = await ethers.getSigners();
    
    // 部署合约
    nftContract = await CultureNFTContract.deploy();
    await nftContract.deployed();
    
    // 授予creator创作者角色
    await nftContract.grantRole(CREATOR_ROLE, creator.address);
  });
  
  describe("部署", function () {
    it("应该将部署者设置为管理员和创作者", async function () {
      expect(await nftContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await nftContract.hasRole(CREATOR_ROLE, owner.address)).to.equal(true);
    });
    
    it("应该正确设置NFT名称和符号", async function () {
      expect(await nftContract.name()).to.equal("CultureBridge NFT");
      expect(await nftContract.symbol()).to.equal("CBNFT");
    });
  });
  
  describe("铸造NFT", function () {
    it("应该允许创作者铸造NFT", async function () {
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Calligraphy",
        "Visual Arts",
        "ipfs://metadata1"
      );
      
      expect(await nftContract.balanceOf(user1.address)).to.equal(1);
      expect(await nftContract.ownerOf(0)).to.equal(user1.address);
      
      const metadata = await nftContract.getNFTMetadata(0);
      expect(metadata.title).to.equal("Chinese Calligraphy");
      expect(metadata.culturalCategory).to.equal("Visual Arts");
      expect(metadata.creator).to.equal(creator.address);
      expect(metadata.isListed).to.equal(false);
    });
    
    it("不应该允许非创作者铸造NFT", async function () {
      await expect(
        nftContract.connect(user1).mintNFT(
          user2.address,
          "Japanese Origami",
          "Crafts",
          "ipfs://metadata2"
        )
      ).to.be.reverted;
    });
    
    it("应该正确记录创作者的NFT", async function () {
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Calligraphy",
        "Visual Arts",
        "ipfs://metadata1"
      );
      
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Painting",
        "Visual Arts",
        "ipfs://metadata3"
      );
      
      const creatorNFTs = await nftContract.getNFTsByCreator(creator.address);
      expect(creatorNFTs.length).to.equal(2);
      expect(creatorNFTs[0]).to.equal(0);
      expect(creatorNFTs[1]).to.equal(1);
    });
    
    it("应该正确记录文化类别的NFT", async function () {
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Calligraphy",
        "Visual Arts",
        "ipfs://metadata1"
      );
      
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Painting",
        "Visual Arts",
        "ipfs://metadata3"
      );
      
      await nftContract.connect(creator).mintNFT(
        user2.address,
        "Chinese Poetry",
        "Literature",
        "ipfs://metadata4"
      );
      
      const visualArtsNFTs = await nftContract.getNFTsByCategory("Visual Arts");
      expect(visualArtsNFTs.length).to.equal(2);
      expect(visualArtsNFTs[0]).to.equal(0);
      expect(visualArtsNFTs[1]).to.equal(1);
      
      const literatureNFTs = await nftContract.getNFTsByCategory("Literature");
      expect(literatureNFTs.length).to.equal(1);
      expect(literatureNFTs[0]).to.equal(2);
    });
  });
  
  describe("NFT上架和销售", function () {
    beforeEach(async function () {
      // 铸造NFT给用户1
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Calligraphy",
        "Visual Arts",
        "ipfs://metadata1"
      );
    });
    
    it("应该允许NFT所有者上架NFT", async function () {
      await nftContract.connect(user1).listNFT(0, ethers.utils.parseEther("1.0"));
      
      const metadata = await nftContract.getNFTMetadata(0);
      expect(metadata.isListed).to.equal(true);
      expect(metadata.price).to.equal(ethers.utils.parseEther("1.0"));
    });
    
    it("不应该允许非所有者上架NFT", async function () {
      await expect(
        nftContract.connect(user2).listNFT(0, ethers.utils.parseEther("1.0"))
      ).to.be.revertedWith("Not the owner");
    });
    
    it("应该允许NFT所有者下架NFT", async function () {
      await nftContract.connect(user1).listNFT(0, ethers.utils.parseEther("1.0"));
      await nftContract.connect(user1).unlistNFT(0);
      
      const metadata = await nftContract.getNFTMetadata(0);
      expect(metadata.isListed).to.equal(false);
      expect(metadata.price).to.equal(0);
    });
    
    it("应该允许NFT所有者更改价格", async function () {
      await nftContract.connect(user1).listNFT(0, ethers.utils.parseEther("1.0"));
      await nftContract.connect(user1).changeNFTPrice(0, ethers.utils.parseEther("2.0"));
      
      const metadata = await nftContract.getNFTMetadata(0);
      expect(metadata.price).to.equal(ethers.utils.parseEther("2.0"));
    });
    
    it("应该正确获取所有上架的NFT", async function () {
      // 再铸造一个NFT给用户2
      await nftContract.connect(creator).mintNFT(
        user2.address,
        "Japanese Origami",
        "Crafts",
        "ipfs://metadata2"
      );
      
      // 用户1上架NFT
      await nftContract.connect(user1).listNFT(0, ethers.utils.parseEther("1.0"));
      
      // 用户2上架NFT
      await nftContract.connect(user2).listNFT(1, ethers.utils.parseEther("2.0"));
      
      const listedNFTs = await nftContract.getListedNFTs();
      expect(listedNFTs.length).to.equal(2);
      expect(listedNFTs[0]).to.equal(0);
      expect(listedNFTs[1]).to.equal(1);
    });
  });
  
  describe("NFT转移", function () {
    beforeEach(async function () {
      // 铸造NFT给用户1
      await nftContract.connect(creator).mintNFT(
        user1.address,
        "Chinese Calligraphy",
        "Visual Arts",
        "ipfs://metadata1"
      );
    });
    
    it("应该允许NFT所有者转移NFT", async function () {
      await nftContract.connect(user1).transferFrom(user1.address, user2.address, 0);
      
      expect(await nftContract.ownerOf(0)).to.equal(user2.address);
    });
    
    it("应该在转移后自动下架NFT", async function () {
      // 先上架NFT
      await nftContract.connect(user1).listNFT(0, ethers.utils.parseEther("1.0"));
      
      // 转移NFT
      await nftContract.connect(user1).transferFrom(user1.address, user2.address, 0);
      
      const metadata = await nftContract.getNFTMetadata(0);
      expect(metadata.isListed).to.equal(false);
    });
  });
});

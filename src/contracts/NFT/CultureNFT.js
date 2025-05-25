// CultureNFT.js - 文化资产NFT智能合约接口

import { ethers } from 'ethers';

// NFT合约ABI（应用二进制接口）
const CultureNFTABI = [
  // ERC-721标准接口
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  
  // 自定义功能
  "function mintNFT(address recipient, string memory tokenURI) returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event NFTMinted(address indexed creator, address indexed owner, uint256 indexed tokenId, string tokenURI)"
];

// 测试网络合约地址（Sepolia测试网）
const CULTURE_NFT_CONTRACT_ADDRESS = {
  1: "0x0000000000000000000000000000000000000000", // 以太坊主网（待部署）
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia测试网（待部署）
  80001: "0x0000000000000000000000000000000000000000" // Polygon Mumbai测试网（待部署）
};

/**
 * 获取NFT合约实例
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 合约实例
 */
export const getCultureNFTContract = (provider, chainId) => {
  const address = CULTURE_NFT_CONTRACT_ADDRESS[chainId];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`当前网络(chainId: ${chainId})不支持CultureNFT合约`);
  }
  
  return new ethers.Contract(address, CultureNFTABI, provider);
};

/**
 * 获取带签名的NFT合约实例（用于写操作）
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @returns {ethers.Contract} 带签名的合约实例
 */
export const getSignedCultureNFTContract = async (provider, chainId) => {
  const signer = provider.getSigner();
  const contract = getCultureNFTContract(provider, chainId);
  return contract.connect(signer);
};

/**
 * 铸造新的文化NFT
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} tokenURI - NFT元数据URI（IPFS链接）
 * @returns {Promise<Object>} 交易结果
 */
export const mintCultureNFT = async (provider, chainId, tokenURI) => {
  try {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const contract = await getSignedCultureNFTContract(provider, chainId);
    
    // 发送铸造交易
    const tx = await contract.mintNFT(address, tokenURI);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    // 从事件中获取tokenId
    const event = receipt.events.find(event => event.event === 'NFTMinted');
    const tokenId = event.args.tokenId.toString();
    
    return {
      success: true,
      tokenId,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("铸造NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取用户拥有的所有NFT
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} ownerAddress - 所有者地址
 * @returns {Promise<Array>} NFT列表
 */
export const getUserNFTs = async (provider, chainId, ownerAddress) => {
  try {
    const contract = getCultureNFTContract(provider, chainId);
    const balance = await contract.balanceOf(ownerAddress);
    
    const nfts = [];
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
      const tokenURI = await contract.tokenURI(tokenId);
      
      // 获取NFT元数据
      let metadata = {};
      if (tokenURI.startsWith('ipfs://')) {
        const ipfsHash = tokenURI.replace('ipfs://', '');
        const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
        metadata = await response.json();
      } else {
        const response = await fetch(tokenURI);
        metadata = await response.json();
      }
      
      nfts.push({
        tokenId: tokenId.toString(),
        tokenURI,
        metadata
      });
    }
    
    return nfts;
  } catch (error) {
    console.error("获取用户NFT失败:", error);
    return [];
  }
};

/**
 * 转移NFT所有权
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} toAddress - 接收者地址
 * @param {string} tokenId - NFT的tokenId
 * @returns {Promise<Object>} 交易结果
 */
export const transferNFT = async (provider, chainId, toAddress, tokenId) => {
  try {
    const signer = provider.getSigner();
    const fromAddress = await signer.getAddress();
    const contract = await getSignedCultureNFTContract(provider, chainId);
    
    // 发送转移交易
    const tx = await contract.transferFrom(fromAddress, toAddress, tokenId);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("转移NFT失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取NFT详情
 * @param {ethers.providers.Web3Provider} provider - Web3提供者
 * @param {number} chainId - 链ID
 * @param {string} tokenId - NFT的tokenId
 * @returns {Promise<Object>} NFT详情
 */
export const getNFTDetails = async (provider, chainId, tokenId) => {
  try {
    const contract = getCultureNFTContract(provider, chainId);
    
    // 获取所有者
    const owner = await contract.ownerOf(tokenId);
    
    // 获取元数据URI
    const tokenURI = await contract.tokenURI(tokenId);
    
    // 获取NFT元数据
    let metadata = {};
    if (tokenURI.startsWith('ipfs://')) {
      const ipfsHash = tokenURI.replace('ipfs://', '');
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      metadata = await response.json();
    } else {
      const response = await fetch(tokenURI);
      metadata = await response.json();
    }
    
    return {
      tokenId,
      owner,
      tokenURI,
      metadata
    };
  } catch (error) {
    console.error("获取NFT详情失败:", error);
    return null;
  }
};

export default {
  getCultureNFTContract,
  getSignedCultureNFTContract,
  mintCultureNFT,
  getUserNFTs,
  transferNFT,
  getNFTDetails
};

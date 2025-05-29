import { ethers } from 'ethers';
import CultureGovernorABI from './CultureGovernorABI';

// 合约地址配置
const CONTRACT_ADDRESSES = {
  1: '0x1234567890123456789012345678901234567890', // Mainnet
  5: '0x2345678901234567890123456789012345678901', // Goerli
  137: '0x3456789012345678901234567890123456789012', // Polygon
  80001: '0x4567890123456789012345678901234567890123', // Mumbai
};

/**
 * 获取提案列表
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {Number} page - 页码
 * @param {Number} pageSize - 每页数量
 * @returns {Array} 提案列表
 */
export const getProposals = async (library, chainId, page = 1, pageSize = 10) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 获取提案总数
    const proposalCount = await contract.getProposalCount();
    
    // 计算分页
    const startIndex = Math.max(0, proposalCount - page * pageSize);
    const endIndex = Math.max(0, proposalCount - (page - 1) * pageSize);
    
    // 获取提案ID列表
    const proposalIds = [];
    for (let i = startIndex; i < endIndex; i++) {
      const proposalId = await contract.getProposalIdAtIndex(i);
      proposalIds.push(proposalId);
    }
    
    // 获取提案详情
    const proposals = await Promise.all(
      proposalIds.map(async (id) => {
        const proposal = await contract.proposals(id);
        const state = await contract.state(id);
        
        // 获取提案描述
        const descriptionHash = ethers.utils.id(proposal.description);
        const description = await contract.getProposalDescription(descriptionHash);
        
        return {
          id: id.toString(),
          proposer: proposal.proposer,
          startBlock: proposal.startBlock.toString(),
          endBlock: proposal.endBlock.toString(),
          forVotes: ethers.utils.formatEther(proposal.forVotes),
          againstVotes: ethers.utils.formatEther(proposal.againstVotes),
          abstainVotes: ethers.utils.formatEther(proposal.abstainVotes),
          canceled: proposal.canceled,
          executed: proposal.executed,
          state,
          description
        };
      })
    );
    
    return proposals;
  } catch (error) {
    console.error('获取提案列表失败:', error);
    throw error;
  }
};

/**
 * 获取提案详情
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} proposalId - 提案ID
 * @returns {Object} 提案详情
 */
export const getProposalDetails = async (library, chainId, proposalId) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 获取提案基本信息
    const proposal = await contract.proposals(proposalId);
    const state = await contract.state(proposalId);
    
    // 获取提案描述
    const descriptionHash = ethers.utils.id(proposal.description);
    const description = await contract.getProposalDescription(descriptionHash);
    
    // 获取提案操作
    const proposalData = await contract.getActions(proposalId);
    const { targets, values, calldatas } = proposalData;
    
    // 获取法定人数
    const quorumVotes = await contract.quorum(proposal.startBlock);
    
    return {
      id: proposalId,
      proposer: proposal.proposer,
      startBlock: proposal.startBlock.toString(),
      endBlock: proposal.endBlock.toString(),
      forVotes: ethers.utils.formatEther(proposal.forVotes),
      againstVotes: ethers.utils.formatEther(proposal.againstVotes),
      abstainVotes: ethers.utils.formatEther(proposal.abstainVotes),
      canceled: proposal.canceled,
      executed: proposal.executed,
      state,
      description,
      targets,
      values: values.map(v => v.toString()),
      calldatas,
      quorumVotes: ethers.utils.formatEther(quorumVotes)
    };
  } catch (error) {
    console.error('获取提案详情失败:', error);
    throw error;
  }
};

/**
 * 创建提案
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {Array} targets - 目标合约地址列表
 * @param {Array} values - ETH数量列表
 * @param {Array} calldatas - 调用数据列表
 * @param {String} description - 提案描述
 * @returns {Object} 创建结果
 */
export const createProposal = async (library, chainId, targets, values, calldatas, description) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 创建提案
    const tx = await contract.propose(targets, values, calldatas, description);
    const receipt = await tx.wait();
    
    // 从事件中获取提案ID
    const proposalCreatedEvent = receipt.events.find(
      event => event.event === 'ProposalCreated'
    );
    
    if (!proposalCreatedEvent) {
      throw new Error('无法获取提案ID');
    }
    
    const proposalId = proposalCreatedEvent.args.proposalId.toString();
    
    return {
      success: true,
      proposalId
    };
  } catch (error) {
    console.error('创建提案失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 投票
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} proposalId - 提案ID
 * @param {Number} support - 投票选项 (0: 反对, 1: 支持, 2: 弃权)
 * @param {String} reason - 投票理由
 * @returns {Object} 投票结果
 */
export const castVote = async (library, chainId, proposalId, support, reason = '') => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 投票
    let tx;
    if (reason) {
      tx = await contract.castVoteWithReason(proposalId, support, reason);
    } else {
      tx = await contract.castVote(proposalId, support);
    }
    
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('投票失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 将提案加入队列
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} proposalId - 提案ID
 * @returns {Object} 操作结果
 */
export const queueProposal = async (library, chainId, proposalId) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 获取提案详情
    const proposal = await contract.proposals(proposalId);
    const descriptionHash = ethers.utils.id(proposal.description);
    
    // 获取提案操作
    const proposalData = await contract.getActions(proposalId);
    const { targets, values, calldatas } = proposalData;
    
    // 将提案加入队列
    const tx = await contract.queue(targets, values, calldatas, descriptionHash);
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('加入队列失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 执行提案
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} proposalId - 提案ID
 * @returns {Object} 操作结果
 */
export const executeProposal = async (library, chainId, proposalId) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 获取提案详情
    const proposal = await contract.proposals(proposalId);
    const descriptionHash = ethers.utils.id(proposal.description);
    
    // 获取提案操作
    const proposalData = await contract.getActions(proposalId);
    const { targets, values, calldatas } = proposalData;
    
    // 执行提案
    const tx = await contract.execute(targets, values, calldatas, descriptionHash);
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('执行提案失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取用户投票记录
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} proposalId - 提案ID
 * @param {String} account - 用户地址
 * @returns {Object} 投票记录
 */
export const getVoteReceipt = async (library, chainId, proposalId, account) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 检查用户是否已投票
    const hasVoted = await contract.hasVoted(proposalId, account);
    
    if (!hasVoted) {
      return null;
    }
    
    // 获取投票记录
    const receipt = await contract.getReceipt(proposalId, account);
    
    return {
      hasVoted: receipt.hasVoted,
      support: receipt.support,
      weight: ethers.utils.formatEther(receipt.votes),
      reason: receipt.reason || ''
    };
  } catch (error) {
    console.error('获取投票记录失败:', error);
    return null;
  }
};

/**
 * 获取用户投票权重
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} account - 用户地址
 * @returns {String} 投票权重
 */
export const getVotingPower = async (library, chainId, account) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 获取当前区块
    const blockNumber = await library.getBlockNumber();
    
    // 获取投票权重
    const votingPower = await contract.getVotes(account, blockNumber - 1);
    
    return ethers.utils.formatEther(votingPower);
  } catch (error) {
    console.error('获取投票权重失败:', error);
    throw error;
  }
};

/**
 * 获取带声誉加成的投票权重
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} account - 用户地址
 * @param {Number} reputation - 用户声誉
 * @returns {String} 投票权重
 */
export const getVotingPowerWithReputation = async (library, chainId, account, reputation) => {
  try {
    // 获取基础投票权重
    const baseVotingPower = await getVotingPower(library, chainId, account);
    
    // 计算声誉加成
    const reputationBoost = reputation > 80 ? 1.2 : 
                           reputation > 60 ? 1.1 : 
                           reputation > 40 ? 1.0 : 0.9;
    
    // 计算最终投票权重
    const finalVotingPower = parseFloat(baseVotingPower) * reputationBoost;
    
    return finalVotingPower.toString();
  } catch (error) {
    console.error('获取带声誉加成的投票权重失败:', error);
    throw error;
  }
};

/**
 * 取消提案
 * @param {Object} library - Web3 Provider
 * @param {Number} chainId - 链ID
 * @param {String} proposalId - 提案ID
 * @returns {Object} 操作结果
 */
export const cancelProposal = async (library, chainId, proposalId) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      throw new Error('不支持的网络');
    }
    
    const contract = new ethers.Contract(
      contractAddress,
      CultureGovernorABI,
      library.getSigner()
    );
    
    // 取消提案
    const tx = await contract.cancel(proposalId);
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('取消提案失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getProposals,
  getProposalDetails,
  createProposal,
  castVote,
  queueProposal,
  executeProposal,
  getVoteReceipt,
  getVotingPower,
  getVotingPowerWithReputation,
  cancelProposal
};

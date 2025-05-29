const CultureGovernorABI = [
  // 查询函数
  "function proposals(uint256 proposalId) external view returns (address proposer, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool canceled, bool executed)",
  "function state(uint256 proposalId) external view returns (uint8)",
  "function getProposalCount() external view returns (uint256)",
  "function getProposalIdAtIndex(uint256 index) external view returns (uint256)",
  "function getProposalDescription(bytes32 descriptionHash) external view returns (string)",
  "function getActions(uint256 proposalId) external view returns (address[] targets, uint256[] values, bytes[] calldatas)",
  "function quorum(uint256 blockNumber) external view returns (uint256)",
  "function hasVoted(uint256 proposalId, address account) external view returns (bool)",
  "function getReceipt(uint256 proposalId, address voter) external view returns (bool hasVoted, uint8 support, uint256 votes, string reason)",
  "function getVotes(address account, uint256 blockNumber) external view returns (uint256)",
  
  // 写入函数
  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) external returns (uint256)",
  "function castVote(uint256 proposalId, uint8 support) external returns (uint256)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) external returns (uint256)",
  "function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) external returns (uint256)",
  "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) external payable returns (uint256)",
  "function cancel(uint256 proposalId) external",
  
  // 事件
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)",
  "event ProposalCanceled(uint256 proposalId)",
  "event ProposalExecuted(uint256 proposalId)",
  "event ProposalQueued(uint256 proposalId, uint256 eta)",
  "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)"
];

export default CultureGovernorABI;

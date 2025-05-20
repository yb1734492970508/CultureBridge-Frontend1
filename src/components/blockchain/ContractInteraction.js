import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './ContractInteraction.css';

/**
 * 智能合约交互组件
 * 允许用户与任意智能合约进行交互
 */
const ContractInteraction = () => {
  const { active, account, library } = useBlockchain();
  
  // 合约信息
  const [contractAddress, setContractAddress] = useState('');
  const [contractABI, setContractABI] = useState('');
  const [parsedABI, setParsedABI] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  
  // 交互状态
  const [functionInputs, setFunctionInputs] = useState({});
  const [callResult, setCallResult] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [gasEstimate, setGasEstimate] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 合约事件
  const [events, setEvents] = useState([]);
  const [isListeningEvents, setIsListeningEvents] = useState(false);
  
  // 常用合约模板
  const contractTemplates = [
    { 
      name: 'ERC20代币', 
      abi: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
      ]
    },
    { 
      name: 'ERC721 NFT', 
      abi: [
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
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
        "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
        "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
      ]
    }
  ];

  // 当合约地址或ABI变化时，尝试创建合约实例
  useEffect(() => {
    if (active && library && contractAddress && parsedABI) {
      try {
        const contractInstance = new ethers.Contract(
          contractAddress,
          parsedABI,
          library.getSigner()
        );
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error('创建合约实例失败:', err);
        setContract(null);
        setError('创建合约实例失败，请检查合约地址和ABI格式');
      }
    } else {
      setContract(null);
    }
  }, [active, library, contractAddress, parsedABI]);

  // 解析ABI
  const parseABI = (abiString) => {
    try {
      // 尝试解析JSON格式的ABI
      let parsedABI;
      try {
        parsedABI = JSON.parse(abiString);
      } catch {
        // 如果不是JSON，尝试解析人类可读格式的ABI
        parsedABI = abiString.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }
      
      setParsedABI(parsedABI);
      setSelectedFunction(null);
      setFunctionInputs({});
      setCallResult(null);
      setTransactionHash('');
      setTransactionStatus('');
      setGasEstimate(null);
      setError(null);
      return true;
    } catch (err) {
      console.error('解析ABI失败:', err);
      setError('解析ABI失败，请检查格式');
      setParsedABI(null);
      return false;
    }
  };

  // 处理ABI输入变化
  const handleABIChange = (e) => {
    const newABI = e.target.value;
    setContractABI(newABI);
    
    if (newABI.trim()) {
      parseABI(newABI);
    } else {
      setParsedABI(null);
    }
  };

  // 处理模板选择
  const handleTemplateSelect = (e) => {
    const templateIndex = parseInt(e.target.value);
    if (templateIndex >= 0) {
      const template = contractTemplates[templateIndex];
      setContractABI(JSON.stringify(template.abi, null, 2));
      parseABI(JSON.stringify(template.abi));
    }
  };

  // 处理函数选择
  const handleFunctionSelect = (functionName) => {
    if (!contract) return;
    
    try {
      // 查找选中的函数
      const selectedFunc = Object.keys(contract.interface.functions)
        .map(key => contract.interface.functions[key])
        .find(func => func.name === functionName);
      
      if (selectedFunc) {
        setSelectedFunction(selectedFunc);
        
        // 重置输入和结果
        const initialInputs = {};
        selectedFunc.inputs.forEach(input => {
          initialInputs[input.name || `param${input.idx}`] = '';
        });
        setFunctionInputs(initialInputs);
        setCallResult(null);
        setTransactionHash('');
        setTransactionStatus('');
        setGasEstimate(null);
        setError(null);
      }
    } catch (err) {
      console.error('选择函数失败:', err);
      setError('选择函数失败，请检查ABI格式');
    }
  };

  // 处理输入变化
  const handleInputChange = (name, value) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 估算Gas
  const estimateGas = async () => {
    if (!contract || !selectedFunction || !active) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 准备函数参数
      const params = selectedFunction.inputs.map(input => 
        functionInputs[input.name || `param${input.idx}`]
      );
      
      // 只有非只读函数才需要估算gas
      if (!selectedFunction.constant) {
        const estimate = await contract.estimateGas[selectedFunction.name](...params);
        setGasEstimate(ethers.utils.formatUnits(estimate, 'gwei'));
      }
    } catch (err) {
      console.error('估算Gas失败:', err);
      setError(`估算Gas失败: ${err.message || '请检查参数是否正确'}`);
      setGasEstimate(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 调用合约函数
  const callContractFunction = async () => {
    if (!contract || !selectedFunction || !active) return;
    
    setIsLoading(true);
    setCallResult(null);
    setTransactionHash('');
    setTransactionStatus('');
    setError(null);
    
    try {
      // 准备函数参数
      const params = selectedFunction.inputs.map(input => 
        functionInputs[input.name || `param${input.idx}`]
      );
      
      // 根据函数类型调用
      if (selectedFunction.constant) {
        // 只读函数
        const result = await contract[selectedFunction.name](...params);
        setCallResult(formatCallResult(result));
      } else {
        // 写入函数
        setTransactionStatus('pending');
        
        // 发送交易
        const tx = await contract[selectedFunction.name](...params);
        setTransactionHash(tx.hash);
        setTransactionStatus('mining');
        
        // 等待交易确认
        const receipt = await tx.wait();
        setTransactionStatus('confirmed');
        
        // 解析事件日志
        if (receipt.logs && receipt.logs.length > 0) {
          try {
            const parsedLogs = receipt.logs
              .map(log => {
                try {
                  return contract.interface.parseLog(log);
                } catch (e) {
                  return null;
                }
              })
              .filter(Boolean);
            
            if (parsedLogs.length > 0) {
              setEvents(prev => [...parsedLogs, ...prev].slice(0, 10));
            }
          } catch (logErr) {
            console.error('解析事件日志失败:', logErr);
          }
        }
      }
    } catch (err) {
      console.error('调用合约函数失败:', err);
      
      // 提供详细错误信息
      if (err.code === 'ACTION_REJECTED') {
        setError('您拒绝了交易签名');
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('您的钱包余额不足，无法支付交易费用');
      } else if (err.message && err.message.includes('gas')) {
        setError('Gas估算失败，请检查参数是否正确');
      } else {
        setError(`调用失败: ${err.message || '请检查参数是否正确'}`);
      }
      
      setTransactionStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化调用结果
  const formatCallResult = (result) => {
    if (result === null || result === undefined) {
      return 'null';
    }
    
    // 处理BigNumber
    if (ethers.BigNumber.isBigNumber(result)) {
      return result.toString();
    }
    
    // 处理数组
    if (Array.isArray(result)) {
      return result.map(item => formatCallResult(item));
    }
    
    // 处理对象
    if (typeof result === 'object') {
      const formatted = {};
      for (const key in result) {
        if (isNaN(parseInt(key))) { // 跳过数字键（用于数组）
          formatted[key] = formatCallResult(result[key]);
        }
      }
      return formatted;
    }
    
    return result.toString();
  };

  // 监听合约事件
  const listenToEvents = () => {
    if (!contract || !active || isListeningEvents) return;
    
    try {
      // 获取所有事件
      const eventFilters = Object.keys(contract.interface.events)
        .map(key => {
          const event = contract.interface.events[key];
          return contract.filters[event.name]();
        });
      
      // 为每个事件添加监听器
      eventFilters.forEach(filter => {
        contract.on(filter, (...args) => {
          const event = args[args.length - 1];
          setEvents(prev => [event, ...prev].slice(0, 10));
        });
      });
      
      setIsListeningEvents(true);
      setError(null);
    } catch (err) {
      console.error('监听事件失败:', err);
      setError('监听事件失败，请检查合约ABI是否包含事件定义');
    }
  };

  // 停止监听事件
  const stopListeningEvents = () => {
    if (!contract || !isListeningEvents) return;
    
    try {
      contract.removeAllListeners();
      setIsListeningEvents(false);
      setError(null);
    } catch (err) {
      console.error('停止监听事件失败:', err);
      setError('停止监听事件失败');
    }
  };

  // 清除事件列表
  const clearEvents = () => {
    setEvents([]);
  };

  // 渲染函数列表
  const renderFunctionList = () => {
    if (!contract) return null;
    
    try {
      // 获取所有函数
      const functions = Object.keys(contract.interface.functions)
        .map(key => contract.interface.functions[key])
        .filter(func => func.type === 'function'); // 只显示函数，不显示事件
      
      // 分为读取函数和写入函数
      const readFunctions = functions.filter(func => func.constant);
      const writeFunctions = functions.filter(func => !func.constant);
      
      return (
        <div className="function-list">
          <div className="function-category">
            <h4>读取函数</h4>
            <div className="function-buttons">
              {readFunctions.map(func => (
                <button
                  key={func.name}
                  className={`function-button read ${selectedFunction?.name === func.name ? 'selected' : ''}`}
                  onClick={() => handleFunctionSelect(func.name)}
                >
                  {func.name}
                </button>
              ))}
              {readFunctions.length === 0 && <p className="no-functions">无读取函数</p>}
            </div>
          </div>
          
          <div className="function-category">
            <h4>写入函数</h4>
            <div className="function-buttons">
              {writeFunctions.map(func => (
                <button
                  key={func.name}
                  className={`function-button write ${selectedFunction?.name === func.name ? 'selected' : ''}`}
                  onClick={() => handleFunctionSelect(func.name)}
                >
                  {func.name}
                </button>
              ))}
              {writeFunctions.length === 0 && <p className="no-functions">无写入函数</p>}
            </div>
          </div>
        </div>
      );
    } catch (err) {
      console.error('渲染函数列表失败:', err);
      return <div className="error-message">解析合约函数失败，请检查ABI格式</div>;
    }
  };

  // 渲染函数表单
  const renderFunctionForm = () => {
    if (!selectedFunction) return null;
    
    return (
      <div className="function-form">
        <h3>{selectedFunction.name}</h3>
        <div className="function-signature">
          {`${selectedFunction.name}(${selectedFunction.inputs.map(input => `${input.type} ${input.name || ''}`).join(', ')})`}
          {selectedFunction.outputs.length > 0 && 
            ` returns (${selectedFunction.outputs.map(output => output.type).join(', ')})`
          }
        </div>
        
        {selectedFunction.inputs.length > 0 ? (
          <div className="function-inputs">
            {selectedFunction.inputs.map((input, index) => {
              const inputName = input.name || `param${index}`;
              return (
                <div key={index} className="input-group">
                  <label htmlFor={inputName}>
                    {input.name || `参数 ${index + 1}`} ({input.type})
                  </label>
                  <input
                    id={inputName}
                    type="text"
                    value={functionInputs[inputName] || ''}
                    onChange={(e) => handleInputChange(inputName, e.target.value)}
                    placeholder={`输入 ${input.type} 类型的值`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-inputs">此函数不需要参数</p>
        )}
        
        <div className="function-actions">
          {!selectedFunction.constant && (
            <button 
              className="estimate-gas-btn" 
              onClick={estimateGas}
              disabled={isLoading}
            >
              估算Gas
            </button>
          )}
          
          <button 
            className="call-function-btn" 
            onClick={callContractFunction}
            disabled={isLoading}
          >
            {selectedFunction.constant ? '调用' : '发送交易'}
          </button>
        </div>
        
        {gasEstimate && (
          <div className="gas-estimate">
            <span>估算Gas: </span>
            <span className="gas-value">{gasEstimate} Gwei</span>
          </div>
        )}
        
        {transactionStatus && (
          <div className={`transaction-status ${transactionStatus}`}>
            <span>交易状态: </span>
            <span className="status-value">
              {transactionStatus === 'pending' && '等待签名...'}
              {transactionStatus === 'mining' && '交易确认中...'}
              {transactionStatus === 'confirmed' && '交易已确认'}
              {transactionStatus === 'failed' && '交易失败'}
            </span>
          </div>
        )}
        
        {transactionHash && (
          <div className="transaction-hash">
            <span>交易哈希: </span>
            <a 
              href={`https://etherscan.io/tx/${transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hash-link"
            >
              {`${transactionHash.substring(0, 10)}...${transactionHash.substring(transactionHash.length - 8)}`}
            </a>
          </div>
        )}
      </div>
    );
  };

  // 渲染调用结果
  const renderCallResult = () => {
    if (!callResult) return null;
    
    return (
      <div className="call-result">
        <h3>调用结果</h3>
        <pre className="result-data">
          {typeof callResult === 'object' 
            ? JSON.stringify(callResult, null, 2) 
            : callResult.toString()
          }
        </pre>
      </div>
    );
  };

  // 渲染事件列表
  const renderEvents = () => {
    if (events.length === 0) return null;
    
    return (
      <div className="events-list">
        <div className="events-header">
          <h3>合约事件</h3>
          <div className="events-actions">
            <button 
              className="clear-events-btn" 
              onClick={clearEvents}
            >
              清除
            </button>
          </div>
        </div>
        
        <div className="events-container">
          {events.map((event, index) => (
            <div key={index} className="event-item">
              <div className="event-name">{event.name || '未知事件'}</div>
              <div className="event-data">
                {event.args && Object.keys(event.args).map(key => {
                  if (isNaN(parseInt(key))) { // 跳过数字键（用于数组）
                    return (
                      <div key={key} className="event-arg">
                        <span className="arg-name">{key}:</span>
                        <span className="arg-value">{event.args[key].toString()}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              {event.transactionHash && (
                <div className="event-tx">
                  <a 
                    href={`https://etherscan.io/tx/${event.transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    查看交易
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染组件
  return (
    <div className="contract-interaction">
      <div className="interaction-header">
        <h2>智能合约交互</h2>
        <p>与以太坊区块链上的智能合约进行交互</p>
      </div>
      
      {!active ? (
        <div className="interaction-message">
          <p>请连接您的钱包以与智能合约交互</p>
        </div>
      ) : (
        <div className="interaction-content">
          <div className="contract-setup">
            <div className="form-group">
              <label htmlFor="contractAddress">合约地址</label>
              <input
                type="text"
                id="contractAddress"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="输入智能合约地址 (0x...)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contractTemplate">选择合约模板（可选）</label>
              <select 
                id="contractTemplate" 
                onChange={handleTemplateSelect}
                defaultValue=""
              >
                <option value="">-- 选择模板 --</option>
                {contractTemplates.map((template, index) => (
                  <option key={index} value={index}>{template.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="contractABI">合约ABI</label>
              <textarea
                id="contractABI"
                value={contractABI}
                onChange={handleABIChange}
                placeholder="输入合约ABI（JSON格式或人类可读格式）"
                rows={5}
              />
            </div>
            
            <div className="events-control">
              <button 
                className={`listen-events-btn ${isListeningEvents ? 'active' : ''}`} 
                onClick={isListeningEvents ? stopListeningEvents : listenToEvents}
                disabled={!contract}
              >
                {isListeningEvents ? '停止监听事件' : '监听合约事件'}
              </button>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {contract && (
            <div className="contract-functions">
              {renderFunctionList()}
              {renderFunctionForm()}
              {renderCallResult()}
            </div>
          )}
          
          {renderEvents()}
        </div>
      )}
    </div>
  );
};

export default ContractInteraction;

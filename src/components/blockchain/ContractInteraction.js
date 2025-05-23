import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useBlockchain } from '../../context/blockchain';
import './ContractInteraction.css';

/**
 * 智能合约交互组件
 * 允许用户与任意智能合约进行交互
 */
const ContractInteraction = () => {
  const { active, account, library, chainId } = useBlockchain();
  
  // 合约信息状态
  const [contractAddress, setContractAddress] = useState('');
  const [contractABI, setContractABI] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [contractFunctions, setContractFunctions] = useState([]);
  const [contractEvents, setContractEvents] = useState([]);
  const [isValidABI, setIsValidABI] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  // 函数调用状态
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionInputs, setFunctionInputs] = useState({});
  const [functionResult, setFunctionResult] = useState(null);
  const [isCallPending, setIsCallPending] = useState(false);
  const [callError, setCallError] = useState(null);
  
  // 交易状态
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null); // 'pending', 'confirmed', 'failed'
  const [txReceipt, setTxReceipt] = useState(null);
  
  // 事件监听状态
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  // 气体估算状态
  const [gasEstimate, setGasEstimate] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [customGasPrice, setCustomGasPrice] = useState('');
  const [useCustomGasPrice, setUseCustomGasPrice] = useState(false);
  
  // 验证合约地址
  const validateContractAddress = (address) => {
    try {
      return ethers.utils.isAddress(address);
    } catch (error) {
      return false;
    }
  };
  
  // 验证ABI
  const validateABI = (abiString) => {
    try {
      const parsedABI = JSON.parse(abiString);
      return Array.isArray(parsedABI);
    } catch (error) {
      return false;
    }
  };
  
  // 解析ABI，提取函数和事件
  const parseABI = (abiString) => {
    try {
      const parsedABI = JSON.parse(abiString);
      
      // 提取函数
      const functions = parsedABI.filter(item => 
        item.type === 'function'
      ).map(func => ({
        name: func.name,
        inputs: func.inputs || [],
        outputs: func.outputs || [],
        stateMutability: func.stateMutability,
        isView: func.stateMutability === 'view' || func.stateMutability === 'pure',
        signature: `${func.name}(${(func.inputs || []).map(input => input.type).join(',')})`
      }));
      
      // 提取事件
      const events = parsedABI.filter(item => 
        item.type === 'event'
      ).map(event => ({
        name: event.name,
        inputs: event.inputs || [],
        signature: `${event.name}(${(event.inputs || []).map(input => input.type).join(',')})`
      }));
      
      return { functions, events };
    } catch (error) {
      console.error('解析ABI失败:', error);
      return { functions: [], events: [] };
    }
  };
  
  // 初始化合约实例
  const initializeContract = () => {
    if (!active || !library || !validateContractAddress(contractAddress) || !isValidABI) {
      return;
    }
    
    try {
      setIsValidating(true);
      
      // 解析ABI
      const { functions, events } = parseABI(contractABI);
      
      // 创建合约实例
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        library.getSigner()
      );
      
      setContractInstance(contract);
      setContractFunctions(functions);
      setContractEvents(events);
      setSelectedFunction(null);
      setSelectedEvent(null);
      setFunctionInputs({});
      setFunctionResult(null);
      setCallError(null);
      setTxHash(null);
      setTxStatus(null);
      setTxReceipt(null);
      setEventLogs([]);
      
    } catch (error) {
      console.error('初始化合约失败:', error);
      setContractInstance(null);
      setContractFunctions([]);
      setContractEvents([]);
    } finally {
      setIsValidating(false);
    }
  };
  
  // 处理ABI输入变化
  const handleABIChange = (e) => {
    const value = e.target.value;
    setContractABI(value);
    setIsValidABI(validateABI(value));
  };
  
  // 处理函数选择
  const handleFunctionSelect = (func) => {
    setSelectedFunction(func);
    setFunctionInputs({});
    setFunctionResult(null);
    setCallError(null);
    setTxHash(null);
    setTxStatus(null);
    setTxReceipt(null);
    setGasEstimate(null);
    
    // 如果是状态修改函数，获取当前gas价格
    if (func && !func.isView) {
      fetchGasPrice();
    }
  };
  
  // 处理事件选择
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setEventLogs([]);
    setIsListening(false);
  };
  
  // 处理函数输入变化
  const handleInputChange = (name, type, value) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: formatInputValue(type, value)
    }));
  };
  
  // 格式化输入值，根据类型转换
  const formatInputValue = (type, value) => {
    if (type.includes('int') && value !== '') {
      // 处理整数类型
      try {
        if (type.includes('uint')) {
          return ethers.BigNumber.from(value);
        } else {
          return ethers.BigNumber.from(value);
        }
      } catch (error) {
        return value;
      }
    } else if (type === 'bool') {
      // 处理布尔类型
      return value === 'true';
    } else if (type.includes('[]')) {
      // 处理数组类型
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    } else {
      // 其他类型直接返回
      return value;
    }
  };
  
  // 获取当前gas价格
  const fetchGasPrice = async () => {
    if (!library) return;
    
    try {
      const price = await library.getGasPrice();
      setGasPrice(price);
    } catch (error) {
      console.error('获取gas价格失败:', error);
    }
  };
  
  // 估算gas用量
  const estimateGas = async () => {
    if (!contractInstance || !selectedFunction || !selectedFunction.inputs) return;
    
    try {
      setIsCallPending(true);
      
      // 准备参数
      const params = selectedFunction.inputs.map(input => 
        functionInputs[input.name] || getDefaultValue(input.type)
      );
      
      // 估算gas
      const estimatedGas = await contractInstance.estimateGas[selectedFunction.name](...params);
      setGasEstimate(estimatedGas);
      
    } catch (error) {
      console.error('估算gas失败:', error);
      setCallError(`估算gas失败: ${error.message}`);
    } finally {
      setIsCallPending(false);
    }
  };
  
  // 获取类型的默认值
  const getDefaultValue = (type) => {
    if (type.includes('int')) return 0;
    if (type === 'bool') return false;
    if (type === 'address') return ethers.constants.AddressZero;
    if (type.includes('[]')) return [];
    return '';
  };
  
  // 调用合约函数
  const callContractFunction = async () => {
    if (!contractInstance || !selectedFunction) return;
    
    setIsCallPending(true);
    setFunctionResult(null);
    setCallError(null);
    setTxHash(null);
    setTxStatus(null);
    setTxReceipt(null);
    
    try {
      // 准备参数
      const params = selectedFunction.inputs.map(input => 
        functionInputs[input.name] || getDefaultValue(input.type)
      );
      
      // 如果是只读函数
      if (selectedFunction.isView) {
        const result = await contractInstance[selectedFunction.name](...params);
        setFunctionResult(formatResult(result));
      } 
      // 如果是状态修改函数
      else {
        // 准备交易选项
        const options = {};
        
        // 如果使用自定义gas价格
        if (useCustomGasPrice && customGasPrice) {
          options.gasPrice = ethers.utils.parseUnits(customGasPrice, 'gwei');
        }
        
        // 发送交易
        const tx = await contractInstance[selectedFunction.name](...params, options);
        setTxHash(tx.hash);
        setTxStatus('pending');
        
        // 等待交易确认
        const receipt = await tx.wait();
        setTxReceipt(receipt);
        setTxStatus('confirmed');
      }
    } catch (error) {
      console.error('调用合约函数失败:', error);
      setCallError(`调用失败: ${error.message}`);
      setTxStatus('failed');
    } finally {
      setIsCallPending(false);
    }
  };
  
  // 格式化结果
  const formatResult = (result) => {
    // 如果是BigNumber
    if (ethers.BigNumber.isBigNumber(result)) {
      return result.toString();
    }
    
    // 如果是数组
    if (Array.isArray(result)) {
      return result.map(item => formatResult(item));
    }
    
    // 如果是对象但不是数组
    if (typeof result === 'object' && result !== null) {
      const formatted = {};
      for (const key in result) {
        if (isNaN(parseInt(key))) { // 只处理非数字键
          formatted[key] = formatResult(result[key]);
        }
      }
      return formatted;
    }
    
    // 其他类型直接返回
    return result;
  };
  
  // 开始监听事件
  const startEventListener = () => {
    if (!contractInstance || !selectedEvent) return;
    
    setIsListening(true);
    setEventLogs([]);
    
    // 创建事件过滤器
    const filter = contractInstance.filters[selectedEvent.name]();
    
    // 监听事件
    contractInstance.on(filter, (...args) => {
      const event = args[args.length - 1];
      const values = {};
      
      // 提取事件参数
      selectedEvent.inputs.forEach((input, index) => {
        values[input.name] = formatResult(args[index]);
      });
      
      // 添加到日志
      setEventLogs(prev => [{
        id: `${event.blockNumber}-${event.transactionIndex}-${event.logIndex}`,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        values,
        timestamp: new Date().toISOString()
      }, ...prev]);
    });
  };
  
  // 停止监听事件
  const stopEventListener = () => {
    if (!contractInstance || !selectedEvent) return;
    
    // 移除所有监听器
    contractInstance.removeAllListeners(selectedEvent.name);
    setIsListening(false);
  };
  
  // 当组件卸载时停止所有事件监听
  useEffect(() => {
    return () => {
      if (contractInstance && selectedEvent) {
        contractInstance.removeAllListeners(selectedEvent.name);
      }
    };
  }, [contractInstance, selectedEvent]);
  
  // 渲染函数输入表单
  const renderFunctionInputs = () => {
    if (!selectedFunction || !selectedFunction.inputs) return null;
    
    return (
      <div className="function-inputs">
        <h4>函数参数</h4>
        {selectedFunction.inputs.length === 0 ? (
          <p>此函数没有参数</p>
        ) : (
          selectedFunction.inputs.map((input, index) => (
            <div key={`${input.name}-${index}`} className="input-field">
              <label>
                {input.name || `参数 ${index + 1}`} ({input.type})
                <input
                  type="text"
                  value={functionInputs[input.name] || ''}
                  onChange={(e) => handleInputChange(input.name, input.type, e.target.value)}
                  placeholder={`输入${input.type}类型的值`}
                />
              </label>
              {input.type.includes('[]') && (
                <small className="input-hint">数组格式: [1, 2, 3] 或 ["a", "b", "c"]</small>
              )}
            </div>
          ))
        )}
      </div>
    );
  };
  
  // 渲染函数输出
  const renderFunctionOutputs = () => {
    if (!selectedFunction || !selectedFunction.outputs) return null;
    
    return (
      <div className="function-outputs">
        <h4>返回值类型</h4>
        {selectedFunction.outputs.length === 0 ? (
          <p>此函数没有返回值</p>
        ) : (
          <div className="output-types">
            {selectedFunction.outputs.map((output, index) => (
              <span key={index} className="output-type">
                {output.name ? `${output.name}: ${output.type}` : output.type}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染函数调用结果
  const renderFunctionResult = () => {
    if (!functionResult && !callError && !txHash) return null;
    
    return (
      <div className="function-result">
        <h4>调用结果</h4>
        
        {callError && (
          <div className="result-error">
            <p>{callError}</p>
          </div>
        )}
        
        {txHash && (
          <div className="tx-info">
            <div className="tx-status">
              <span className="status-label">交易状态:</span>
              <span className={`status-value status-${txStatus}`}>
                {txStatus === 'pending' ? '确认中' : 
                 txStatus === 'confirmed' ? '已确认' : 
                 txStatus === 'failed' ? '失败' : '未知'}
              </span>
            </div>
            
            <div className="tx-hash">
              <span className="hash-label">交易哈希:</span>
              <span className="hash-value">{txHash}</span>
            </div>
            
            {txReceipt && (
              <div className="tx-receipt">
                <div className="receipt-item">
                  <span className="receipt-label">区块号:</span>
                  <span className="receipt-value">{txReceipt.blockNumber}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Gas使用量:</span>
                  <span className="receipt-value">{txReceipt.gasUsed.toString()}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">确认数:</span>
                  <span className="receipt-value">1</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {functionResult && (
          <div className="result-value">
            <pre>{JSON.stringify(functionResult, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染Gas设置
  const renderGasSettings = () => {
    if (!selectedFunction || selectedFunction.isView) return null;
    
    return (
      <div className="gas-settings">
        <h4>Gas设置</h4>
        
        <div className="gas-price">
          <div className="gas-price-current">
            <span className="gas-label">当前Gas价格:</span>
            <span className="gas-value">
              {gasPrice ? `${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei` : '加载中...'}
            </span>
          </div>
          
          <div className="gas-price-custom">
            <label className="custom-gas-checkbox">
              <input
                type="checkbox"
                checked={useCustomGasPrice}
                onChange={(e) => setUseCustomGasPrice(e.target.checked)}
              />
              使用自定义Gas价格
            </label>
            
            {useCustomGasPrice && (
              <div className="custom-gas-input">
                <input
                  type="text"
                  value={customGasPrice}
                  onChange={(e) => setCustomGasPrice(e.target.value)}
                  placeholder="输入Gas价格 (Gwei)"
                />
                <span className="gas-unit">Gwei</span>
              </div>
            )}
          </div>
        </div>
        
        {gasEstimate && (
          <div className="gas-estimate">
            <span className="gas-label">估算Gas用量:</span>
            <span className="gas-value">{gasEstimate.toString()}</span>
          </div>
        )}
        
        <button 
          className="estimate-gas-btn"
          onClick={estimateGas}
          disabled={isCallPending || !selectedFunction || selectedFunction.isView}
        >
          估算Gas用量
        </button>
      </div>
    );
  };
  
  // 渲染事件监听
  const renderEventListener = () => {
    if (!contractInstance || contractEvents.length === 0) return null;
    
    return (
      <div className="event-listener">
        <h3>事件监听</h3>
        
        <div className="event-selector">
          <label>
            选择事件
            <select
              value={selectedEvent ? selectedEvent.name : ''}
              onChange={(e) => {
                const event = contractEvents.find(ev => ev.name === e.target.value);
                handleEventSelect(event);
              }}
            >
              <option value="">-- 选择事件 --</option>
              {contractEvents.map((event, index) => (
                <option key={index} value={event.name}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        {selectedEvent && (
          <>
            <div className="event-details">
              <h4>事件参数</h4>
              {selectedEvent.inputs.length === 0 ? (
                <p>此事件没有参数</p>
              ) : (
                <div className="event-params">
                  {selectedEvent.inputs.map((input, index) => (
                    <div key={index} className="event-param">
                      <span className="param-name">{input.name || `参数 ${index + 1}`}</span>
                      <span className="param-type">{input.type}</span>
                      <span className="param-indexed">{input.indexed ? '(indexed)' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="event-controls">
              {isListening ? (
                <button 
                  className="stop-listening-btn"
                  onClick={stopEventListener}
                >
                  停止监听
                </button>
              ) : (
                <button 
                  className="start-listening-btn"
                  onClick={startEventListener}
                >
                  开始监听
                </button>
              )}
            </div>
            
            <div className="event-logs">
              <h4>事件日志 {isListening && <span className="listening-indicator">监听中...</span>}</h4>
              
              {eventLogs.length === 0 ? (
                <p className="no-logs">{isListening ? '等待事件...' : '无事件日志'}</p>
              ) : (
                <div className="logs-list">
                  {eventLogs.map((log) => (
                    <div key={log.id} className="log-item">
                      <div className="log-header">
                        <span className="log-block">区块: {log.blockNumber}</span>
                        <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="log-tx">
                        <span className="log-tx-label">交易:</span>
                        <span className="log-tx-hash">{log.transactionHash.substring(0, 10)}...</span>
                      </div>
                      <div className="log-values">
                        {Object.entries(log.values).map(([key, value]) => (
                          <div key={key} className="log-value">
                            <span className="log-value-name">{key}:</span>
                            <span className="log-value-data">
                              {typeof value === 'object' 
                                ? JSON.stringify(value) 
                                : value.toString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="contract-interaction">
      <div className="contract-header">
        <h2>智能合约交互</h2>
        <p>与以太坊智能合约进行交互</p>
      </div>
      
      {!active ? (
        <div className="contract-message">
          <p>请连接您的钱包以与智能合约交互</p>
        </div>
      ) : (
        <div className="contract-content">
          <div className="contract-setup">
            <div className="contract-address">
              <label>
                合约地址
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="输入智能合约地址"
                  className={validateContractAddress(contractAddress) ? '' : 'invalid'}
                />
              </label>
              {contractAddress && !validateContractAddress(contractAddress) && (
                <p className="validation-error">无效的合约地址</p>
              )}
            </div>
            
            <div className="contract-abi">
              <label>
                合约ABI
                <textarea
                  value={contractABI}
                  onChange={handleABIChange}
                  placeholder="粘贴合约ABI (JSON格式)"
                  className={isValidABI ? '' : 'invalid'}
                  rows={5}
                />
              </label>
              {contractABI && !isValidABI && (
                <p className="validation-error">无效的ABI格式</p>
              )}
            </div>
            
            <button
              className="initialize-btn"
              onClick={initializeContract}
              disabled={!validateContractAddress(contractAddress) || !isValidABI || isValidating}
            >
              {isValidating ? '初始化中...' : '初始化合约'}
            </button>
          </div>
          
          {contractInstance && (
            <div className="contract-interface">
              <div className="contract-functions">
                <h3>合约函数</h3>
                
                <div className="function-selector">
                  <label>
                    选择函数
                    <select
                      value={selectedFunction ? selectedFunction.name : ''}
                      onChange={(e) => {
                        const func = contractFunctions.find(f => f.name === e.target.value);
                        handleFunctionSelect(func);
                      }}
                    >
                      <option value="">-- 选择函数 --</option>
                      <optgroup label="只读函数">
                        {contractFunctions
                          .filter(f => f.isView)
                          .map((func, index) => (
                            <option key={`view-${index}`} value={func.name}>
                              {func.name}
                            </option>
                          ))
                        }
                      </optgroup>
                      <optgroup label="状态修改函数">
                        {contractFunctions
                          .filter(f => !f.isView)
                          .map((func, index) => (
                            <option key={`state-${index}`} value={func.name}>
                              {func.name}
                            </option>
                          ))
                        }
                      </optgroup>
                    </select>
                  </label>
                </div>
                
                {selectedFunction && (
                  <div className="function-details">
                    <div className="function-signature">
                      <h4>函数签名</h4>
                      <code>{selectedFunction.signature}</code>
                      <span className="function-type">
                        {selectedFunction.isView ? '(只读)' : '(状态修改)'}
                      </span>
                    </div>
                    
                    {renderFunctionInputs()}
                    {renderFunctionOutputs()}
                    {renderGasSettings()}
                    
                    <div className="function-actions">
                      <button
                        className="call-function-btn"
                        onClick={callContractFunction}
                        disabled={isCallPending}
                      >
                        {isCallPending ? '处理中...' : selectedFunction.isView ? '调用' : '发送交易'}
                      </button>
                    </div>
                    
                    {renderFunctionResult()}
                  </div>
                )}
              </div>
              
              {renderEventListener()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractInteraction;

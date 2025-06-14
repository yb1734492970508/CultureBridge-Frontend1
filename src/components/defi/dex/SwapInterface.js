import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import TokenSelector from '../common/TokenSelector';
import AmountInput from '../common/AmountInput';
import TransactionButton from '../common/TransactionButton';
import './SwapInterface.css';

/**
 * 去中心化交易所交换界面组件
 * 支持代币交换、滑点控制、价格计算等功能
 */
const SwapInterface = () => {
  // 状态管理
  const [tokenIn, setTokenIn] = useState(null);
  const [tokenOut, setTokenOut] = useState(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [priceImpact, setPriceImpact] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gasEstimate, setGasEstimate] = useState(null);

  // 常用代币列表
  const commonTokens = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: '/images/tokens/eth.png'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86a33E6441b8C5e6b8b4c8b5e6b8b4c8b5e6b',
      decimals: 6,
      logoURI: '/images/tokens/usdc.png'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      logoURI: '/images/tokens/usdt.png'
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      logoURI: '/images/tokens/dai.png'
    }
  ];

  // 计算输出金额
  const calculateOutputAmount = useMemo(() => {
    if (!amountIn || !exchangeRate || !tokenIn || !tokenOut) return '0';
    
    try {
      const inputAmount = parseFloat(amountIn);
      const rate = parseFloat(exchangeRate);
      const outputAmount = inputAmount * rate;
      
      // 考虑滑点
      const slippageDecimal = parseFloat(slippage) / 100;
      const minOutputAmount = outputAmount * (1 - slippageDecimal);
      
      return minOutputAmount.toFixed(6);
    } catch (error) {
      console.error('计算输出金额错误:', error);
      return '0';
    }
  }, [amountIn, exchangeRate, slippage, tokenIn, tokenOut]);

  // 获取交换汇率
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!tokenIn || !tokenOut || !amountIn) {
        setExchangeRate(null);
        setAmountOut('0');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // 模拟API调用获取汇率
        // 实际实现中应该调用Uniswap或其他DEX的API
        const mockRate = await simulateGetExchangeRate(tokenIn, tokenOut, amountIn);
        setExchangeRate(mockRate.rate);
        setPriceImpact(mockRate.priceImpact);
        
        // 计算输出金额
        const outputAmount = calculateOutputAmount;
        setAmountOut(outputAmount);

      } catch (error) {
        console.error('获取汇率失败:', error);
        setError('获取价格失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchExchangeRate, 500);
    return () => clearTimeout(debounceTimer);
  }, [tokenIn, tokenOut, amountIn, calculateOutputAmount]);

  // 模拟获取交换汇率
  const simulateGetExchangeRate = async (tokenIn, tokenOut, amount) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟汇率计算
    const baseRate = Math.random() * 2000 + 1000; // 1000-3000之间的随机汇率
    const priceImpact = parseFloat(amount) > 1000 ? 0.5 : 0.1; // 大额交易有更高价格影响
    
    return {
      rate: baseRate,
      priceImpact: priceImpact
    };
  };

  // 估算Gas费用
  useEffect(() => {
    const estimateGas = async () => {
      if (!tokenIn || !tokenOut || !amountIn) {
        setGasEstimate(null);
        return;
      }

      try {
        // 模拟Gas估算
        const gasPrice = await simulateGetGasPrice();
        const gasLimit = 150000; // 典型的swap交易gas limit
        const gasCost = gasPrice * gasLimit;
        
        setGasEstimate({
          gasPrice: gasPrice,
          gasLimit: gasLimit,
          gasCost: gasCost,
          gasCostUSD: gasCost * 2000 / 1e18 // 假设ETH价格为$2000
        });
      } catch (error) {
        console.error('Gas估算失败:', error);
      }
    };

    estimateGas();
  }, [tokenIn, tokenOut, amountIn]);

  // 模拟获取Gas价格
  const simulateGetGasPrice = async () => {
    // 模拟当前网络Gas价格 (单位: wei)
    return ethers.utils.parseUnits('20', 'gwei');
  };

  // 交换代币位置
  const swapTokens = () => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    
    const tempAmount = amountIn;
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
  };

  // 执行交换
  const executeSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !amountOut) {
      setError('请完整填写交换信息');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 验证输入
      if (parseFloat(amountIn) <= 0) {
        throw new Error('交换金额必须大于0');
      }

      if (parseFloat(slippage) > 50) {
        throw new Error('滑点设置过高，请重新设置');
      }

      // 模拟交换交易
      const txHash = await simulateSwapTransaction({
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        slippage
      });

      // 显示成功消息
      alert(`交换成功！交易哈希: ${txHash}`);
      
      // 重置表单
      setAmountIn('');
      setAmountOut('');
      
    } catch (error) {
      console.error('交换失败:', error);
      setError(error.message || '交换失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 模拟交换交易
  const simulateSwapTransaction = async (swapData) => {
    // 模拟交易处理时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 生成模拟交易哈希
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    return txHash;
  };

  // 获取价格影响颜色
  const getPriceImpactColor = (impact) => {
    if (impact < 0.1) return '#10B981'; // 绿色
    if (impact < 0.5) return '#F59E0B'; // 黄色
    return '#EF4444'; // 红色
  };

  return (
    <div className="swap-interface">
      <div className="swap-header">
        <h2>代币交换</h2>
        <div className="slippage-settings">
          <label>滑点容忍度:</label>
          <select 
            value={slippage} 
            onChange={(e) => setSlippage(e.target.value)}
            className="slippage-select"
          >
            <option value="0.1">0.1%</option>
            <option value="0.5">0.5%</option>
            <option value="1.0">1.0%</option>
            <option value="3.0">3.0%</option>
          </select>
        </div>
      </div>

      <div className="swap-container">
        {/* 输入代币 */}
        <div className="token-input-section">
          <div className="section-header">
            <span>支付</span>
            {tokenIn && (
              <span className="balance">余额: 1,234.56 {tokenIn.symbol}</span>
            )}
          </div>
          
          <div className="token-input-row">
            <AmountInput
              value={amountIn}
              onChange={setAmountIn}
              placeholder="0.0"
              className="amount-input"
            />
            <TokenSelector
              selectedToken={tokenIn}
              onTokenSelect={setTokenIn}
              tokens={commonTokens}
              className="token-selector"
            />
          </div>
        </div>

        {/* 交换按钮 */}
        <div className="swap-arrow-container">
          <button 
            className="swap-arrow-button"
            onClick={swapTokens}
            disabled={loading}
          >
            ⇅
          </button>
        </div>

        {/* 输出代币 */}
        <div className="token-input-section">
          <div className="section-header">
            <span>接收</span>
            {tokenOut && (
              <span className="balance">余额: 567.89 {tokenOut.symbol}</span>
            )}
          </div>
          
          <div className="token-input-row">
            <AmountInput
              value={amountOut}
              onChange={setAmountOut}
              placeholder="0.0"
              className="amount-input"
              readOnly
            />
            <TokenSelector
              selectedToken={tokenOut}
              onTokenSelect={setTokenOut}
              tokens={commonTokens}
              className="token-selector"
            />
          </div>
        </div>

        {/* 交换信息 */}
        {exchangeRate && (
          <div className="swap-info">
            <div className="info-row">
              <span>汇率</span>
              <span>
                1 {tokenIn?.symbol} = {exchangeRate?.toFixed(6)} {tokenOut?.symbol}
              </span>
            </div>
            
            <div className="info-row">
              <span>价格影响</span>
              <span style={{ color: getPriceImpactColor(priceImpact) }}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            
            <div className="info-row">
              <span>最小接收</span>
              <span>
                {(parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {tokenOut?.symbol}
              </span>
            </div>
            
            {gasEstimate && (
              <div className="info-row">
                <span>预估Gas费</span>
                <span>
                  ${gasEstimate.gasCostUSD.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 交换按钮 */}
        <TransactionButton
          onClick={executeSwap}
          loading={loading}
          disabled={!tokenIn || !tokenOut || !amountIn || !amountOut || loading}
          className="swap-button"
        >
          {loading ? '交换中...' : '交换'}
        </TransactionButton>

        {/* 高滑点警告 */}
        {parseFloat(slippage) > 5 && (
          <div className="warning-message">
            ⚠️ 滑点设置较高，可能导致不利的交换结果
          </div>
        )}
      </div>

      {/* 最近交易 */}
      <div className="recent-swaps">
        <h3>最近交换</h3>
        <div className="swap-history-list">
          <div className="swap-history-item">
            <span>1.5 ETH → 3,000 USDC</span>
            <span className="timestamp">2分钟前</span>
          </div>
          <div className="swap-history-item">
            <span>500 USDT → 0.25 ETH</span>
            <span className="timestamp">5分钟前</span>
          </div>
          <div className="swap-history-item">
            <span>1,000 DAI → 1,001 USDC</span>
            <span className="timestamp">10分钟前</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;


# 合约ABI文件说明

本目录用于存放CultureBridge项目的智能合约ABI文件，这些文件是前端与区块链交互的关键接口定义。

## 所需合约ABI文件

前端Web3服务需要以下合约的ABI文件：

1. `CultureBridgeIdentity.json` - 用户身份合约
2. `CultureBridgeAsset.json` - 文化资产合约
3. `CultureBridgeExchange.json` - 文化交流合约
4. `CultureBridgeToken.json` - 平台代币合约
5. `CultureBridgeMarketplace.json` - 市场交易合约

## 获取ABI文件

这些ABI文件可以通过以下方式获取：

1. 从后端项目的区块链编译输出中复制
2. 使用Hardhat或Truffle等工具编译合约后生成
3. 从已部署的合约中提取

## 文件格式

每个ABI文件应包含以下内容：

```json
{
  "abi": [...],  // 合约ABI数组
  "bytecode": "0x...",  // 合约字节码（可选）
  "deployedBytecode": "0x...",  // 部署后的字节码（可选）
  "contractName": "ContractName"  // 合约名称
}
```

## 使用说明

在前端开发中，这些ABI文件将被导入到Web3服务中，用于创建合约实例和调用合约方法。请确保这些文件与实际部署的合约版本一致，以避免交互错误。

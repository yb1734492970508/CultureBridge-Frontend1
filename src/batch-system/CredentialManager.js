// 批处理自动化协作系统 - 多账号凭证管理模块

/**
 * 多账号凭证管理模块
 * 
 * 该模块负责安全管理多个Manus账号的凭证信息，
 * 支持加密存储、安全访问和自动轮换等功能。
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class CredentialManager {
  constructor(configPath) {
    this.configPath = configPath || path.join(process.cwd(), 'credentials.enc');
    this.algorithm = 'aes-256-gcm';
    this.credentials = new Map();
    this.masterKey = null;
  }

  /**
   * 初始化凭证管理器
   * @param {string} masterPassword - 主密码，用于加密/解密所有凭证
   * @returns {Promise<boolean>} - 初始化是否成功
   */
  async initialize(masterPassword) {
    try {
      // 从主密码生成加密密钥
      this.masterKey = crypto.scryptSync(masterPassword, 'salt', 32);
      
      // 如果存在已保存的凭证文件，则加载
      if (fs.existsSync(this.configPath)) {
        await this.loadCredentials();
      }
      
      return true;
    } catch (error) {
      console.error('初始化凭证管理器失败:', error);
      return false;
    }
  }

  /**
   * 添加账号凭证
   * @param {string} accountId - 账号识别码
   * @param {Object} credentials - 凭证信息对象
   * @returns {boolean} - 添加是否成功
   */
  addCredential(accountId, credentials) {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      this.credentials.set(accountId, credentials);
      return true;
    } catch (error) {
      console.error(`添加账号 ${accountId} 凭证失败:`, error);
      return false;
    }
  }

  /**
   * 批量添加账号凭证
   * @param {Array<{accountId: string, credentials: Object}>} credentialsList - 凭证列表
   * @returns {boolean} - 添加是否成功
   */
  addBulkCredentials(credentialsList) {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      for (const item of credentialsList) {
        this.credentials.set(item.accountId, item.credentials);
      }
      
      return true;
    } catch (error) {
      console.error('批量添加凭证失败:', error);
      return false;
    }
  }

  /**
   * 获取账号凭证
   * @param {string} accountId - 账号识别码
   * @returns {Object|null} - 凭证信息对象，如果不存在则返回null
   */
  getCredential(accountId) {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      return this.credentials.get(accountId) || null;
    } catch (error) {
      console.error(`获取账号 ${accountId} 凭证失败:`, error);
      return null;
    }
  }

  /**
   * 保存凭证到加密文件
   * @returns {Promise<boolean>} - 保存是否成功
   */
  async saveCredentials() {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      // 将凭证转换为JSON字符串
      const credentialsData = JSON.stringify(Array.from(this.credentials.entries()));
      
      // 生成随机初始化向量
      const iv = crypto.randomBytes(16);
      
      // 创建加密器
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      
      // 加密数据
      let encrypted = cipher.update(credentialsData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // 获取认证标签
      const authTag = cipher.getAuthTag();
      
      // 创建包含所有必要信息的对象
      const encryptedData = {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: encrypted
      };
      
      // 写入文件
      await fs.promises.writeFile(this.configPath, JSON.stringify(encryptedData));
      
      return true;
    } catch (error) {
      console.error('保存凭证失败:', error);
      return false;
    }
  }

  /**
   * 从加密文件加载凭证
   * @returns {Promise<boolean>} - 加载是否成功
   */
  async loadCredentials() {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      // 读取加密文件
      const encryptedDataStr = await fs.promises.readFile(this.configPath, 'utf8');
      const encryptedData = JSON.parse(encryptedDataStr);
      
      // 解析加密数据
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      const encryptedText = encryptedData.data;
      
      // 创建解密器
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(authTag);
      
      // 解密数据
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // 解析凭证数据
      const credentialsEntries = JSON.parse(decrypted);
      this.credentials = new Map(credentialsEntries);
      
      return true;
    } catch (error) {
      console.error('加载凭证失败:', error);
      return false;
    }
  }

  /**
   * 验证账号凭证
   * @param {string} accountId - 账号识别码
   * @returns {Promise<boolean>} - 验证是否成功
   */
  async verifyCredential(accountId) {
    try {
      const credential = this.getCredential(accountId);
      if (!credential) {
        return false;
      }
      
      // 这里应该实现实际的验证逻辑，例如调用API验证凭证
      // 为了演示，我们假设所有存在的凭证都是有效的
      return true;
    } catch (error) {
      console.error(`验证账号 ${accountId} 凭证失败:`, error);
      return false;
    }
  }

  /**
   * 轮换账号凭证（例如更新令牌）
   * @param {string} accountId - 账号识别码
   * @param {Object} newCredentials - 新凭证信息
   * @returns {Promise<boolean>} - 轮换是否成功
   */
  async rotateCredential(accountId, newCredentials) {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      // 更新凭证
      this.credentials.set(accountId, newCredentials);
      
      // 保存更新后的凭证
      await this.saveCredentials();
      
      return true;
    } catch (error) {
      console.error(`轮换账号 ${accountId} 凭证失败:`, error);
      return false;
    }
  }

  /**
   * 删除账号凭证
   * @param {string} accountId - 账号识别码
   * @returns {Promise<boolean>} - 删除是否成功
   */
  async removeCredential(accountId) {
    try {
      if (!this.masterKey) {
        throw new Error('凭证管理器未初始化');
      }
      
      // 删除凭证
      const result = this.credentials.delete(accountId);
      
      // 保存更新后的凭证
      if (result) {
        await this.saveCredentials();
      }
      
      return result;
    } catch (error) {
      console.error(`删除账号 ${accountId} 凭证失败:`, error);
      return false;
    }
  }

  /**
   * 获取所有账号识别码
   * @returns {Array<string>} - 账号识别码列表
   */
  getAllAccountIds() {
    return Array.from(this.credentials.keys());
  }

  /**
   * 获取凭证数量
   * @returns {number} - 凭证数量
   */
  getCredentialCount() {
    return this.credentials.size;
  }
}

module.exports = CredentialManager;

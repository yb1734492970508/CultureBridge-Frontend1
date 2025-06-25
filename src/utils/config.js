/**
 * 配置管理工具
 * 提供环境变量验证、加载和管理功能
 */

// 配置验证规则
const CONFIG_SCHEMA = {
  // 应用基础配置
  VITE_APP_NAME: { required: true, type: 'string' },
  VITE_APP_VERSION: { required: true, type: 'string' },
  VITE_APP_ENVIRONMENT: { required: true, type: 'string', enum: ['development', 'test', 'production'] },
  
  // API配置
  VITE_API_BASE_URL: { required: true, type: 'string', pattern: /^https?:\/\/.+/ },
  VITE_API_TIMEOUT: { required: true, type: 'number', min: 1000, max: 60000 },
  VITE_API_RETRY_ATTEMPTS: { required: true, type: 'number', min: 0, max: 10 },
  
  // WebSocket配置
  VITE_SOCKET_URL: { required: true, type: 'string', pattern: /^https?:\/\/.+/ },
  VITE_SOCKET_TIMEOUT: { required: true, type: 'number', min: 1000, max: 30000 },
  VITE_SOCKET_RECONNECT_ATTEMPTS: { required: true, type: 'number', min: 0, max: 20 },
  
  // 区块链配置
  VITE_BLOCKCHAIN_NETWORK: { required: true, type: 'string', enum: ['mainnet', 'testnet'] },
  VITE_CBT_CONTRACT_ADDRESS: { required: true, type: 'string', pattern: /^0x[a-fA-F0-9]{40}$/ },
  VITE_BSC_RPC_URL: { required: true, type: 'string', pattern: /^https?:\/\/.+/ },
  VITE_BSC_CHAIN_ID: { required: true, type: 'number', enum: [56, 97] },
  
  // 功能开关
  VITE_FEATURE_VOICE_CHAT: { required: true, type: 'boolean' },
  VITE_FEATURE_BLOCKCHAIN: { required: true, type: 'boolean' },
  VITE_FEATURE_REAL_TIME_TRANSLATION: { required: true, type: 'boolean' },
  VITE_FEATURE_CULTURAL_CONTENT: { required: true, type: 'boolean' },
  VITE_FEATURE_GAMIFICATION: { required: true, type: 'boolean' },
};

/**
 * 配置管理类
 */
class ConfigManager {
  constructor() {
    this.config = {};
    this.isValidated = false;
    this.loadConfig();
  }

  /**
   * 加载配置
   */
  loadConfig() {
    // 加载所有以VITE_开头的环境变量
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        this.config[key] = this.parseValue(import.meta.env[key]);
      }
    });
  }

  /**
   * 解析配置值
   */
  parseValue(value) {
    if (typeof value !== 'string') return value;
    
    // 布尔值解析
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // 数字解析
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    
    return value;
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const errors = [];
    
    Object.entries(CONFIG_SCHEMA).forEach(([key, rules]) => {
      const value = this.config[key];
      
      // 检查必需字段
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Missing required config: ${key}`);
        return;
      }
      
      if (value === undefined || value === null) return;
      
      // 类型检查
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`Config ${key} must be a string, got ${typeof value}`);
      }
      
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`Config ${key} must be a number, got ${typeof value}`);
      }
      
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Config ${key} must be a boolean, got ${typeof value}`);
      }
      
      // 枚举检查
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Config ${key} must be one of [${rules.enum.join(', ')}], got ${value}`);
      }
      
      // 模式检查
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`Config ${key} does not match required pattern`);
      }
      
      // 数值范围检查
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`Config ${key} must be >= ${rules.min}, got ${value}`);
      }
      
      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`Config ${key} must be <= ${rules.max}, got ${value}`);
      }
    });
    
    if (errors.length > 0) {
      console.error('Configuration validation errors:', errors);
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
    
    this.isValidated = true;
    console.log('Configuration validation passed');
  }

  /**
   * 获取配置值
   */
  get(key, defaultValue = undefined) {
    if (!this.isValidated) {
      this.validateConfig();
    }
    
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * 获取所有配置
   */
  getAll() {
    if (!this.isValidated) {
      this.validateConfig();
    }
    
    return { ...this.config };
  }

  /**
   * 检查功能是否启用
   */
  isFeatureEnabled(feature) {
    const key = `VITE_FEATURE_${feature.toUpperCase()}`;
    return this.get(key, false);
  }

  /**
   * 获取API配置
   */
  getApiConfig() {
    return {
      baseURL: this.get('VITE_API_BASE_URL'),
      timeout: this.get('VITE_API_TIMEOUT'),
      retryAttempts: this.get('VITE_API_RETRY_ATTEMPTS'),
    };
  }

  /**
   * 获取WebSocket配置
   */
  getSocketConfig() {
    return {
      url: this.get('VITE_SOCKET_URL'),
      timeout: this.get('VITE_SOCKET_TIMEOUT'),
      reconnectAttempts: this.get('VITE_SOCKET_RECONNECT_ATTEMPTS'),
    };
  }

  /**
   * 获取区块链配置
   */
  getBlockchainConfig() {
    return {
      network: this.get('VITE_BLOCKCHAIN_NETWORK'),
      contractAddress: this.get('VITE_CBT_CONTRACT_ADDRESS'),
      rpcUrl: this.get('VITE_BSC_RPC_URL'),
      chainId: this.get('VITE_BSC_CHAIN_ID'),
    };
  }

  /**
   * 获取UI配置
   */
  getUIConfig() {
    return {
      defaultTheme: this.get('VITE_DEFAULT_THEME', 'light'),
      enableAnimations: this.get('VITE_ENABLE_ANIMATIONS', true),
      animationDuration: this.get('VITE_ANIMATION_DURATION', 300),
    };
  }

  /**
   * 是否为开发环境
   */
  isDevelopment() {
    return this.get('VITE_APP_ENVIRONMENT') === 'development';
  }

  /**
   * 是否为生产环境
   */
  isProduction() {
    return this.get('VITE_APP_ENVIRONMENT') === 'production';
  }

  /**
   * 是否为测试环境
   */
  isTest() {
    return this.get('VITE_APP_ENVIRONMENT') === 'test';
  }
}

// 创建全局配置实例
const config = new ConfigManager();

// 导出配置实例和便捷方法
export default config;

export const {
  get: getConfig,
  getAll: getAllConfig,
  isFeatureEnabled,
  getApiConfig,
  getSocketConfig,
  getBlockchainConfig,
  getUIConfig,
  isDevelopment,
  isProduction,
  isTest,
} = config;


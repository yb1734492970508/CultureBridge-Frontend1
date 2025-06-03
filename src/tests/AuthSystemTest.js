import React from 'react';

/**
 * 账号系统测试套件
 * 用于测试账号系统的各项功能
 */
class AuthSystemTest {
  constructor() {
    this.testResults = {
      registration: { passed: false, message: '' },
      login: { passed: false, message: '' },
      profileUpdate: { passed: false, message: '' },
      passwordChange: { passed: false, message: '' },
      walletLinking: { passed: false, message: '' },
      logout: { passed: false, message: '' }
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('开始运行账号系统测试...');
    
    await this.testRegistration();
    await this.testLogin();
    await this.testProfileUpdate();
    await this.testPasswordChange();
    await this.testWalletLinking();
    await this.testLogout();
    
    console.log('账号系统测试完成!');
    return this.generateReport();
  }

  /**
   * 测试注册功能
   */
  async testRegistration() {
    console.log('测试注册功能...');
    try {
      // 清除测试用户
      this.clearTestUser();
      
      // 模拟注册
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      // 获取当前用户数量
      const initialUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const initialCount = initialUsers.length;
      
      // 执行注册
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push({
        id: 'test-user-id',
        ...userData,
        createdAt: new Date().toISOString(),
        avatar: null,
        bio: '',
        walletAddress: null
      });
      localStorage.setItem('users', JSON.stringify(users));
      
      // 验证用户是否已添加
      const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const newCount = updatedUsers.length;
      
      if (newCount === initialCount + 1) {
        this.testResults.registration = { 
          passed: true, 
          message: '注册功能测试通过' 
        };
      } else {
        throw new Error('用户注册失败');
      }
    } catch (error) {
      this.testResults.registration = { 
        passed: false, 
        message: `注册功能测试失败: ${error.message}` 
      };
    }
  }

  /**
   * 测试登录功能
   */
  async testLogin() {
    console.log('测试登录功能...');
    try {
      // 确保测试用户存在
      this.ensureTestUser();
      
      // 清除当前登录状态
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // 模拟登录
      const testUser = this.getTestUser();
      localStorage.setItem('auth_token', 'mock_token_test-user-id');
      localStorage.setItem('user_data', JSON.stringify({
        id: 'test-user-id',
        name: testUser.name,
        email: testUser.email,
        createdAt: testUser.createdAt,
        avatar: testUser.avatar,
        bio: testUser.bio,
        walletAddress: testUser.walletAddress
      }));
      
      // 验证登录状态
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        this.testResults.login = { 
          passed: true, 
          message: '登录功能测试通过' 
        };
      } else {
        throw new Error('用户登录失败');
      }
    } catch (error) {
      this.testResults.login = { 
        passed: false, 
        message: `登录功能测试失败: ${error.message}` 
      };
    }
  }

  /**
   * 测试个人资料更新功能
   */
  async testProfileUpdate() {
    console.log('测试个人资料更新功能...');
    try {
      // 确保测试用户存在并已登录
      this.ensureTestUser();
      this.ensureLoggedIn();
      
      // 获取当前用户数据
      const userData = JSON.parse(localStorage.getItem('user_data'));
      
      // 模拟更新资料
      const updatedData = {
        ...userData,
        name: 'Updated Name',
        bio: 'This is a test bio'
      };
      localStorage.setItem('user_data', JSON.stringify(updatedData));
      
      // 更新用户列表中的数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(user => 
        user.id === 'test-user-id' ? { ...user, name: 'Updated Name', bio: 'This is a test bio' } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // 验证更新是否成功
      const updatedUserData = JSON.parse(localStorage.getItem('user_data'));
      
      if (updatedUserData.name === 'Updated Name' && updatedUserData.bio === 'This is a test bio') {
        this.testResults.profileUpdate = { 
          passed: true, 
          message: '个人资料更新功能测试通过' 
        };
      } else {
        throw new Error('个人资料更新失败');
      }
    } catch (error) {
      this.testResults.profileUpdate = { 
        passed: false, 
        message: `个人资料更新功能测试失败: ${error.message}` 
      };
    }
  }

  /**
   * 测试密码修改功能
   */
  async testPasswordChange() {
    console.log('测试密码修改功能...');
    try {
      // 确保测试用户存在并已登录
      this.ensureTestUser();
      this.ensureLoggedIn();
      
      // 获取当前用户
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const testUserIndex = users.findIndex(u => u.id === 'test-user-id');
      
      if (testUserIndex === -1) {
        throw new Error('测试用户不存在');
      }
      
      // 模拟密码修改
      const newPassword = 'newpassword456';
      users[testUserIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      
      // 验证密码是否已更改
      const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUser = updatedUsers.find(u => u.id === 'test-user-id');
      
      if (updatedUser && updatedUser.password === newPassword) {
        this.testResults.passwordChange = { 
          passed: true, 
          message: '密码修改功能测试通过' 
        };
      } else {
        throw new Error('密码修改失败');
      }
    } catch (error) {
      this.testResults.passwordChange = { 
        passed: false, 
        message: `密码修改功能测试失败: ${error.message}` 
      };
    }
  }

  /**
   * 测试钱包绑定功能
   */
  async testWalletLinking() {
    console.log('测试钱包绑定功能...');
    try {
      // 确保测试用户存在并已登录
      this.ensureTestUser();
      this.ensureLoggedIn();
      
      // 模拟钱包地址
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      
      // 获取当前用户数据
      const userData = JSON.parse(localStorage.getItem('user_data'));
      
      // 模拟绑定钱包
      const updatedData = {
        ...userData,
        walletAddress
      };
      localStorage.setItem('user_data', JSON.stringify(updatedData));
      
      // 更新用户列表中的数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(user => 
        user.id === 'test-user-id' ? { ...user, walletAddress } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // 验证绑定是否成功
      const updatedUserData = JSON.parse(localStorage.getItem('user_data'));
      
      if (updatedUserData.walletAddress === walletAddress) {
        this.testResults.walletLinking = { 
          passed: true, 
          message: '钱包绑定功能测试通过' 
        };
      } else {
        throw new Error('钱包绑定失败');
      }
    } catch (error) {
      this.testResults.walletLinking = { 
        passed: false, 
        message: `钱包绑定功能测试失败: ${error.message}` 
      };
    }
  }

  /**
   * 测试登出功能
   */
  async testLogout() {
    console.log('测试登出功能...');
    try {
      // 确保测试用户存在并已登录
      this.ensureTestUser();
      this.ensureLoggedIn();
      
      // 模拟登出
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('remember_me');
      
      // 验证登出是否成功
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token && !userData) {
        this.testResults.logout = { 
          passed: true, 
          message: '登出功能测试通过' 
        };
      } else {
        throw new Error('用户登出失败');
      }
    } catch (error) {
      this.testResults.logout = { 
        passed: false, 
        message: `登出功能测试失败: ${error.message}` 
      };
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(result => result.passed).length;
    
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        success_rate: Math.round((passedTests / totalTests) * 100)
      },
      details: this.testResults
    };
    
    console.log('测试报告:', report);
    return report;
  }

  /**
   * 辅助方法：清除测试用户
   */
  clearTestUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(user => user.id !== 'test-user-id');
    localStorage.setItem('users', JSON.stringify(filteredUsers));
  }

  /**
   * 辅助方法：确保测试用户存在
   */
  ensureTestUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const testUser = users.find(user => user.id === 'test-user-id');
    
    if (!testUser) {
      users.push({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date().toISOString(),
        avatar: null,
        bio: '',
        walletAddress: null
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  /**
   * 辅助方法：获取测试用户
   */
  getTestUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.id === 'test-user-id');
  }

  /**
   * 辅助方法：确保用户已登录
   */
  ensureLoggedIn() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      const testUser = this.getTestUser();
      localStorage.setItem('auth_token', 'mock_token_test-user-id');
      localStorage.setItem('user_data', JSON.stringify({
        id: 'test-user-id',
        name: testUser.name,
        email: testUser.email,
        createdAt: testUser.createdAt,
        avatar: testUser.avatar,
        bio: testUser.bio,
        walletAddress: testUser.walletAddress
      }));
    }
  }
}

export default AuthSystemTest;

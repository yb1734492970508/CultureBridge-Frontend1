import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Language,
  AccountBalance
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { connectWallet, isConnected, account } = useWeb3();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.success) {
        // 钱包连接成功，可以选择自动登录或提示用户
        console.log('钱包连接成功:', result.account);
      }
    } catch (err) {
      setError('钱包连接失败');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Language sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              CultureBridge
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              跨文化交流平台
            </Typography>
          </Box>

          {/* Features */}
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip icon={<Language />} label="语音翻译" size="small" />
            <Chip icon={<AccountBalance />} label="区块链" size="small" />
            <Chip label="实时聊天" size="small" />
            <Chip label="CBT代币" size="small" />
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Wallet Connection Status */}
          {isConnected && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              钱包已连接: {account?.slice(0, 6)}...{account?.slice(-4)}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                或
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleWalletConnect}
              sx={{ mb: 2, py: 1.5 }}
              startIcon={<AccountBalance />}
            >
              {isConnected ? '钱包已连接' : '连接MetaMask钱包'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                还没有账户？立即注册
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Features Description */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            为什么选择CultureBridge？
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              🎤 实时语音翻译，支持15种语言
            </Typography>
            <Typography variant="body2" color="text.secondary">
              💬 智能聊天系统，跨语言交流无障碍
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🔗 基于BNB链的区块链技术，安全可信
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🪙 CBT代币奖励，参与即可获得收益
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;


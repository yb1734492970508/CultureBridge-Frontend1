import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  Send,
  Receive,
  History,
  Security,
  Settings,
  Refresh,
  QrCode,
  ContentCopy,
  Launch,
  Add,
  Remove
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import axios from 'axios';

const CBTTokenManager = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(false);
  const [openStakeDialog, setOpenStakeDialog] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: '',
    memo: ''
  });
  const [stakeForm, setStakeForm] = useState({
    amount: '',
    duration: '30' // days
  });
  const [tokenStats, setTokenStats] = useState({
    totalSupply: 0,
    circulatingSupply: 0,
    marketCap: 0,
    price: 0,
    priceChange24h: 0,
    holders: 0
  });
  const [stakingInfo, setStakingInfo] = useState({
    totalStaked: 0,
    userStaked: 0,
    rewards: 0,
    apy: 0
  });

  const { user, isAuthenticated } = useAuth();
  const { web3, account, contract } = useWeb3();

  useEffect(() => {
    if (isAuthenticated && account) {
      fetchTokenData();
      fetchTransactions();
      fetchTokenStats();
      fetchStakingInfo();
    }
  }, [isAuthenticated, account]);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      
      // 获取CBT余额
      if (contract && account) {
        const balance = await contract.methods.balanceOf(account).call();
        setBalance(web3.utils.fromWei(balance, 'ether'));
      }
    } catch (err) {
      setError('获取代币数据失败');
      console.error('Error fetching token data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/cbt/transactions/${account}`
      );
      setTransactions(response.data.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchTokenStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/cbt/stats`
      );
      setTokenStats(response.data.data || {});
    } catch (err) {
      console.error('Error fetching token stats:', err);
    }
  };

  const fetchStakingInfo = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/cbt/staking/${account}`
      );
      setStakingInfo(response.data.data || {});
    } catch (err) {
      console.error('Error fetching staking info:', err);
    }
  };

  const handleSendTokens = async () => {
    try {
      if (!contract || !account) {
        setError('请先连接钱包');
        return;
      }

      const amount = web3.utils.toWei(sendForm.amount, 'ether');
      
      await contract.methods
        .transfer(sendForm.recipient, amount)
        .send({ from: account });

      // 记录交易
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/cbt/transactions`, {
        from: account,
        to: sendForm.recipient,
        amount: sendForm.amount,
        type: 'transfer',
        memo: sendForm.memo
      });

      setOpenSendDialog(false);
      setSendForm({ recipient: '', amount: '', memo: '' });
      fetchTokenData();
      fetchTransactions();
    } catch (err) {
      setError('发送代币失败');
      console.error('Error sending tokens:', err);
    }
  };

  const handleStakeTokens = async () => {
    try {
      if (!contract || !account) {
        setError('请先连接钱包');
        return;
      }

      const amount = web3.utils.toWei(stakeForm.amount, 'ether');
      const duration = parseInt(stakeForm.duration) * 24 * 60 * 60; // Convert days to seconds

      // 调用质押合约
      await contract.methods
        .stake(amount, duration)
        .send({ from: account });

      setOpenStakeDialog(false);
      setStakeForm({ amount: '', duration: '30' });
      fetchTokenData();
      fetchStakingInfo();
    } catch (err) {
      setError('质押代币失败');
      console.error('Error staking tokens:', err);
    }
  };

  const handleClaimRewards = async () => {
    try {
      if (!contract || !account) {
        setError('请先连接钱包');
        return;
      }

      await contract.methods
        .claimRewards()
        .send({ from: account });

      fetchTokenData();
      fetchStakingInfo();
    } catch (err) {
      setError('领取奖励失败');
      console.error('Error claiming rewards:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // 可以添加一个提示消息
  };

  const formatNumber = (num, decimals = 2) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send':
      case 'transfer':
        return <Send color="error" />;
      case 'receive':
        return <Receive color="success" />;
      case 'stake':
        return <Security color="primary" />;
      case 'reward':
        return <TrendingUp color="success" />;
      default:
        return <SwapHoriz />;
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          CBT代币管理
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          管理您的CultureBridge代币资产
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Token Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    代币价格
                  </Typography>
                  <Typography variant="h6">
                    ${tokenStats.price?.toFixed(4) || '0.0000'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {tokenStats.priceChange24h >= 0 ? (
                      <TrendingUp color="success" fontSize="small" />
                    ) : (
                      <TrendingDown color="error" fontSize="small" />
                    )}
                    <Typography 
                      variant="body2" 
                      color={tokenStats.priceChange24h >= 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {tokenStats.priceChange24h?.toFixed(2) || '0.00'}%
                    </Typography>
                  </Box>
                </Box>
                <TrendingUp color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    市值
                  </Typography>
                  <Typography variant="h6">
                    ${formatNumber(tokenStats.marketCap || 0)}
                  </Typography>
                </Box>
                <AccountBalanceWallet color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    流通供应量
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(tokenStats.circulatingSupply || 0)}
                  </Typography>
                </Box>
                <SwapHoriz color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    持有者数量
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(tokenStats.holders || 0, 0)}
                  </Typography>
                </Box>
                <Badge badgeContent={tokenStats.holders || 0} color="primary" max={999999}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <AccountBalanceWallet />
                  </Avatar>
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Wallet Balance */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">我的钱包</Typography>
                <IconButton onClick={fetchTokenData}>
                  <Refresh />
                </IconButton>
              </Box>
              
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" component="div" gutterBottom>
                  {parseFloat(balance).toFixed(4)}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  CBT
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ ${(balance * tokenStats.price).toFixed(2)} USD
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Send />}
                  onClick={() => setOpenSendDialog(true)}
                >
                  发送
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Receive />}
                  onClick={() => setOpenReceiveDialog(true)}
                >
                  接收
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Security />}
                  onClick={() => setOpenStakeDialog(true)}
                >
                  质押
                </Button>
              </Box>

              {/* Wallet Address */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  钱包地址
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatAddress(account)}
                  </Typography>
                  <Tooltip title="复制地址">
                    <IconButton size="small" onClick={() => copyToClipboard(account)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="在区块浏览器中查看">
                    <IconButton size="small">
                      <Launch fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                交易历史
              </Typography>
              
              {transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <History color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography color="text.secondary">
                    暂无交易记录
                  </Typography>
                </Box>
              ) : (
                <List>
                  {transactions.map((tx, index) => (
                    <React.Fragment key={tx._id || index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            {getTransactionIcon(tx.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body1">
                                {tx.type === 'send' || tx.type === 'transfer' ? '发送' : 
                                 tx.type === 'receive' ? '接收' :
                                 tx.type === 'stake' ? '质押' :
                                 tx.type === 'reward' ? '奖励' : tx.type}
                              </Typography>
                              <Typography 
                                variant="body1" 
                                color={tx.type === 'send' || tx.type === 'transfer' ? 'error' : 'success'}
                              >
                                {tx.type === 'send' || tx.type === 'transfer' ? '-' : '+'}
                                {parseFloat(tx.amount).toFixed(4)} CBT
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {tx.type === 'send' || tx.type === 'transfer' ? 
                                  `发送至: ${formatAddress(tx.to)}` :
                                  `来自: ${formatAddress(tx.from)}`
                                }
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(tx.createdAt)}
                              </Typography>
                              {tx.memo && (
                                <Typography variant="body2" color="text.secondary">
                                  备注: {tx.memo}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={tx.status || '已确认'} 
                            color={tx.status === 'confirmed' ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < transactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Staking Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                质押挖矿
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  年化收益率 (APY)
                </Typography>
                <Typography variant="h4" color="primary">
                  {stakingInfo.apy?.toFixed(2) || '0.00'}%
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  我的质押
                </Typography>
                <Typography variant="h6">
                  {parseFloat(stakingInfo.userStaked || 0).toFixed(4)} CBT
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  待领取奖励
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {parseFloat(stakingInfo.rewards || 0).toFixed(4)} CBT
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={handleClaimRewards}
                    disabled={!stakingInfo.rewards || stakingInfo.rewards <= 0}
                  >
                    领取
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  总质押量
                </Typography>
                <Typography variant="body1">
                  {formatNumber(stakingInfo.totalStaked || 0)} CBT
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                快捷操作
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<QrCode />}
                  onClick={() => setOpenReceiveDialog(true)}
                >
                  生成收款码
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<History />}
                >
                  导出交易记录
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<Settings />}
                >
                  代币设置
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Send Dialog */}
      <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>发送CBT代币</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="接收地址"
              value={sendForm.recipient}
              onChange={(e) => setSendForm({...sendForm, recipient: e.target.value})}
              placeholder="0x..."
            />
            
            <TextField
              fullWidth
              label="发送数量"
              type="number"
              value={sendForm.amount}
              onChange={(e) => setSendForm({...sendForm, amount: e.target.value})}
              inputProps={{ min: 0, step: 0.0001 }}
              InputProps={{
                endAdornment: (
                  <Button 
                    size="small"
                    onClick={() => setSendForm({...sendForm, amount: balance.toString()})}
                  >
                    最大
                  </Button>
                )
              }}
            />

            <TextField
              fullWidth
              label="备注（可选）"
              value={sendForm.memo}
              onChange={(e) => setSendForm({...sendForm, memo: e.target.value})}
              multiline
              rows={2}
            />

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                预计手续费: ~0.001 BNB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                您将发送: {sendForm.amount || '0'} CBT
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSendDialog(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSendTokens}
            variant="contained"
            disabled={!sendForm.recipient || !sendForm.amount || parseFloat(sendForm.amount) <= 0}
          >
            发送
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={openReceiveDialog} onClose={() => setOpenReceiveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>接收CBT代币</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              您的钱包地址
            </Typography>
            
            {/* QR Code placeholder */}
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                bgcolor: 'grey.100', 
                mx: 'auto', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <QrCode sx={{ fontSize: 100, color: 'grey.400' }} />
            </Box>

            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {account}
              </Typography>
            </Paper>

            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<ContentCopy />}
              onClick={() => copyToClipboard(account)}
              sx={{ mt: 2 }}
            >
              复制地址
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiveDialog(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stake Dialog */}
      <Dialog open={openStakeDialog} onClose={() => setOpenStakeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>质押CBT代币</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="质押数量"
              type="number"
              value={stakeForm.amount}
              onChange={(e) => setStakeForm({...stakeForm, amount: e.target.value})}
              inputProps={{ min: 0, step: 0.0001 }}
              InputProps={{
                endAdornment: (
                  <Button 
                    size="small"
                    onClick={() => setStakeForm({...stakeForm, amount: balance.toString()})}
                  >
                    最大
                  </Button>
                )
              }}
            />

            <FormControl fullWidth>
              <InputLabel>质押期限</InputLabel>
              <Select
                value={stakeForm.duration}
                onChange={(e) => setStakeForm({...stakeForm, duration: e.target.value})}
                label="质押期限"
              >
                <MenuItem value="30">30天 (APY: 5%)</MenuItem>
                <MenuItem value="90">90天 (APY: 8%)</MenuItem>
                <MenuItem value="180">180天 (APY: 12%)</MenuItem>
                <MenuItem value="365">365天 (APY: 20%)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                质押收益预估
              </Typography>
              <Typography variant="body1">
                预计年收益: {((parseFloat(stakeForm.amount) || 0) * 0.12).toFixed(4)} CBT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                质押期满后可提取本金和收益
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStakeDialog(false)}>
            取消
          </Button>
          <Button 
            onClick={handleStakeTokens}
            variant="contained"
            disabled={!stakeForm.amount || parseFloat(stakeForm.amount) <= 0}
          >
            确认质押
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CBTTokenManager;


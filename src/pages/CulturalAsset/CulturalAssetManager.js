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
  Fab,
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
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add,
  Palette,
  PhotoCamera,
  VideoLibrary,
  MusicNote,
  Article,
  Share,
  Favorite,
  FavoriteBorder,
  Visibility,
  Download,
  Edit,
  Delete,
  FilterList,
  Search
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CulturalAssetManager = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: 'published'
  });
  const [newAsset, setNewAsset] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    tags: '',
    file: null,
    isPublic: true,
    allowDownload: false,
    price: 0
  });

  const { user, isAuthenticated } = useAuth();

  const assetTypes = [
    { value: 'image', label: '图片', icon: <PhotoCamera /> },
    { value: 'video', label: '视频', icon: <VideoLibrary /> },
    { value: 'audio', label: '音频', icon: <MusicNote /> },
    { value: 'document', label: '文档', icon: <Article /> },
    { value: 'artwork', label: '艺术品', icon: <Palette /> }
  ];

  const categories = [
    '传统文化', '现代艺术', '音乐舞蹈', '文学作品', 
    '手工艺品', '建筑设计', '服饰文化', '美食文化',
    '节庆活动', '民俗传说', '历史文物', '其他'
  ];

  const tabs = [
    { label: '我的资产', value: 'my' },
    { label: '公开资产', value: 'public' },
    { label: '收藏夹', value: 'favorites' },
    { label: '购买记录', value: 'purchased' }
  ];

  useEffect(() => {
    fetchAssets();
  }, [tabValue, filters, searchTerm]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // 根据当前标签页设置不同的查询参数
      switch (tabValue) {
        case 0: // 我的资产
          params.append('owner', user._id);
          break;
        case 1: // 公开资产
          params.append('isPublic', 'true');
          break;
        case 2: // 收藏夹
          params.append('favorites', user._id);
          break;
        case 3: // 购买记录
          params.append('purchased', user._id);
          break;
      }

      // 添加筛选条件
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/cultural-assets?${params}`
      );
      setAssets(response.data.data || []);
    } catch (err) {
      setError('获取文化资产失败');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async () => {
    try {
      const formData = new FormData();
      Object.keys(newAsset).forEach(key => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(newAsset[key].split(',').map(tag => tag.trim())));
        } else {
          formData.append(key, newAsset[key]);
        }
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cultural-assets`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setAssets([response.data.data, ...assets]);
      setOpenCreateDialog(false);
      setNewAsset({
        title: '',
        description: '',
        type: '',
        category: '',
        tags: '',
        file: null,
        isPublic: true,
        allowDownload: false,
        price: 0
      });
    } catch (err) {
      setError('创建文化资产失败');
      console.error('Error creating asset:', err);
    }
  };

  const handleLikeAsset = async (assetId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cultural-assets/${assetId}/like`
      );
      
      // 更新本地状态
      setAssets(assets.map(asset => 
        asset._id === assetId 
          ? { 
              ...asset, 
              likes: asset.likes.includes(user._id)
                ? asset.likes.filter(id => id !== user._id)
                : [...asset.likes, user._id]
            }
          : asset
      ));
    } catch (err) {
      console.error('Error liking asset:', err);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('确定要删除这个文化资产吗？')) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/cultural-assets/${assetId}`
      );
      
      setAssets(assets.filter(asset => asset._id !== assetId));
    } catch (err) {
      setError('删除文化资产失败');
      console.error('Error deleting asset:', err);
    }
  };

  const handleDownloadAsset = async (asset) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/cultural-assets/${asset._id}/download`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', asset.originalName || asset.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('下载文化资产失败');
      console.error('Error downloading asset:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    const typeObj = assetTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : <Article />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'private': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'private': return '私有';
      case 'archived': return '已归档';
      default: return status;
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
          文化资产管理
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          创建、管理和分享您的文化作品
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="搜索文化资产..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          筛选
        </Button>
        
        {filterOpen && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>类型</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                label="类型"
              >
                <MenuItem value="">全部</MenuItem>
                {assetTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>分类</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                label="分类"
              >
                <MenuItem value="">全部</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>状态</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                label="状态"
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="published">已发布</MenuItem>
                <MenuItem value="draft">草稿</MenuItem>
                <MenuItem value="private">私有</MenuItem>
                <MenuItem value="archived">已归档</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Asset Grid */}
      <Grid container spacing={3}>
        {assets.map((asset) => (
          <Grid item xs={12} sm={6} md={4} key={asset._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              {/* Asset Preview */}
              <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                {asset.type === 'image' ? (
                  <img 
                    src={asset.thumbnailUrl || asset.fileUrl} 
                    alt={asset.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'grey.100'
                    }}
                  >
                    {getTypeIcon(asset.type)}
                  </Box>
                )}
                
                {/* Status Badge */}
                <Chip 
                  label={getStatusText(asset.status)} 
                  color={getStatusColor(asset.status)}
                  size="small"
                  sx={{ position: 'absolute', top: 8, left: 8 }}
                />

                {/* Type Badge */}
                <Chip 
                  label={assetTypes.find(t => t.value === asset.type)?.label || asset.type}
                  variant="outlined"
                  size="small"
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                {/* Title */}
                <Typography variant="h6" component="h2" gutterBottom>
                  {asset.title}
                </Typography>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, height: '3em', overflow: 'hidden' }}
                >
                  {asset.description}
                </Typography>

                {/* Metadata */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      分类: {asset.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(asset.fileSize)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      创建: {formatDate(asset.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      浏览: {asset.views || 0}
                    </Typography>
                  </Box>

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      {asset.tags.slice(0, 3).map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {asset.tags.length > 3 && (
                        <Chip 
                          label={`+${asset.tags.length - 3}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}

                  {/* Creator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Avatar 
                      src={asset.creator?.avatar} 
                      sx={{ width: 24, height: 24 }}
                    >
                      {asset.creator?.username?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {asset.creator?.username}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <IconButton 
                    onClick={() => handleLikeAsset(asset._id)}
                    color={asset.likes?.includes(user?._id) ? 'error' : 'default'}
                    size="small"
                  >
                    {asset.likes?.includes(user?._id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {asset.likes?.length || 0}
                  </Typography>
                  
                  <IconButton size="small">
                    <Share />
                  </IconButton>

                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                </Box>

                <Box>
                  {asset.allowDownload && (
                    <IconButton 
                      size="small"
                      onClick={() => handleDownloadAsset(asset)}
                    >
                      <Download />
                    </IconButton>
                  )}

                  {asset.creator?._id === user?._id && (
                    <>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDeleteAsset(asset._id)}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {assets.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无文化资产
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 ? '创建您的第一个文化资产！' : '暂时没有找到相关资产'}
          </Typography>
        </Box>
      )}

      {/* Create FAB */}
      {isAuthenticated && tabValue === 0 && (
        <Fab
          color="primary"
          aria-label="create"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setOpenCreateDialog(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Create Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>创建文化资产</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="资产标题"
              value={newAsset.title}
              onChange={(e) => setNewAsset({...newAsset, title: e.target.value})}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="资产描述"
              value={newAsset.description}
              onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>资产类型</InputLabel>
                  <Select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                    label="资产类型"
                  >
                    {assetTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>资产分类</InputLabel>
                  <Select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    label="资产分类"
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="标签（用逗号分隔）"
              value={newAsset.tags}
              onChange={(e) => setNewAsset({...newAsset, tags: e.target.value})}
              placeholder="例如：传统, 艺术, 文化"
            />

            <TextField
              fullWidth
              type="file"
              label="上传文件"
              onChange={(e) => setNewAsset({...newAsset, file: e.target.files[0]})}
              InputLabelProps={{ shrink: true }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>可见性</InputLabel>
                  <Select
                    value={newAsset.isPublic}
                    onChange={(e) => setNewAsset({...newAsset, isPublic: e.target.value})}
                    label="可见性"
                  >
                    <MenuItem value={true}>公开</MenuItem>
                    <MenuItem value={false}>私有</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>允许下载</InputLabel>
                  <Select
                    value={newAsset.allowDownload}
                    onChange={(e) => setNewAsset({...newAsset, allowDownload: e.target.value})}
                    label="允许下载"
                  >
                    <MenuItem value={true}>是</MenuItem>
                    <MenuItem value={false}>否</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              type="number"
              label="价格（CBT代币）"
              value={newAsset.price}
              onChange={(e) => setNewAsset({...newAsset, price: parseFloat(e.target.value)})}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>
            取消
          </Button>
          <Button 
            onClick={handleCreateAsset}
            variant="contained"
            disabled={!newAsset.title || !newAsset.description || !newAsset.type || !newAsset.file}
          >
            创建资产
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CulturalAssetManager;


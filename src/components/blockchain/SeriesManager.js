import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, Select, Input, Button, Tabs, List, Avatar, Tag, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './SeriesManager.css';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * 系列管理组件
 * 用于创建和管理NFT系列，设置系列属性和模板
 */
const SeriesManager = ({ value = {}, onChange, userSeries = [] }) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('select');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 系列信息默认值
  const seriesInfo = {
    isPartOfSeries: false,
    seriesId: '',
    seriesName: '',
    seriesDescription: '',
    seriesImage: '',
    seriesAttributes: [],
    ...value
  };
  
  // 处理系列信息变更
  const handleSeriesChange = (field, newValue) => {
    if (onChange) {
      onChange({
        ...seriesInfo,
        [field]: newValue
      });
    }
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  
  // 处理系列选择
  const handleSeriesSelect = (seriesId) => {
    if (seriesId === 'new') {
      // 创建新系列
      handleSeriesChange('seriesId', 'new');
      handleSeriesChange('seriesName', '');
      handleSeriesChange('seriesDescription', '');
      handleSeriesChange('seriesImage', '');
      handleSeriesChange('seriesAttributes', []);
      setActiveTab('create');
    } else {
      // 选择现有系列
      setLoading(true);
      
      // 模拟从API获取系列详情
      setTimeout(() => {
        const selectedSeries = userSeries.find(s => s.id === seriesId) || {};
        
        handleSeriesChange('seriesId', selectedSeries.id || '');
        handleSeriesChange('seriesName', selectedSeries.name || '');
        handleSeriesChange('seriesDescription', selectedSeries.description || '');
        handleSeriesChange('seriesImage', selectedSeries.image || '');
        handleSeriesChange('seriesAttributes', selectedSeries.attributes || []);
        
        setLoading(false);
      }, 500);
    }
  };
  
  // 验证系列信息
  const validateSeries = () => {
    const newErrors = {};
    
    if (seriesInfo.isPartOfSeries) {
      if (!seriesInfo.seriesName.trim()) {
        newErrors.seriesName = '请输入系列名称';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理系列创建
  const handleSeriesCreate = () => {
    if (!validateSeries()) {
      return;
    }
    
    setLoading(true);
    
    // 模拟API调用创建系列
    setTimeout(() => {
      const newSeriesId = `series_${Date.now()}`;
      
      // 更新系列ID
      handleSeriesChange('seriesId', newSeriesId);
      
      // 切换回选择标签页
      setActiveTab('select');
      setLoading(false);
    }, 1000);
  };
  
  // 渲染系列列表
  const renderSeriesList = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin />
        </div>
      );
    }
    
    if (userSeries.length === 0) {
      return (
        <Empty 
          description="暂无系列" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={userSeries}
        renderItem={item => (
          <List.Item
            actions={[
              <Button 
                key="select" 
                type={seriesInfo.seriesId === item.id ? 'primary' : 'default'}
                onClick={() => handleSeriesSelect(item.id)}
              >
                {seriesInfo.seriesId === item.id ? '已选择' : '选择'}
              </Button>
            ]}
            className={`series-list-item ${seriesInfo.seriesId === item.id ? 'selected' : ''}`}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  src={item.image} 
                  shape="square" 
                  size={64}
                  className="series-avatar"
                />
              }
              title={item.name}
              description={
                <div className="series-item-description">
                  <div className="series-description">{item.description}</div>
                  <div className="series-stats">
                    <Tag color="blue">{item.itemCount || 0} 个NFT</Tag>
                    <Tag color="green">创建于 {item.createdAt}</Tag>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  
  return (
    <div className="series-manager">
      <Card title="系列设置" className="series-card">
        <Form layout="vertical">
          <Form.Item label="是否属于系列">
            <Switch 
              checked={seriesInfo.isPartOfSeries}
              onChange={(checked) => {
                handleSeriesChange('isPartOfSeries', checked);
                if (!checked) {
                  // 重置系列信息
                  handleSeriesChange('seriesId', '');
                  handleSeriesChange('seriesName', '');
                  handleSeriesChange('seriesDescription', '');
                  handleSeriesChange('seriesImage', '');
                  handleSeriesChange('seriesAttributes', []);
                }
              }}
            />
          </Form.Item>
          
          {seriesInfo.isPartOfSeries && (
            <div className="series-content">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="选择系列" key="select">
                  <div className="series-selection">
                    <Form.Item label="选择操作">
                      <Select
                        placeholder="选择操作"
                        value={seriesInfo.seriesId || undefined}
                        onChange={handleSeriesSelect}
                        style={{ width: '100%' }}
                        allowClear
                      >
                        <Option value="new">创建新系列</Option>
                        {userSeries.map(series => (
                          <Option key={series.id} value={series.id}>
                            {series.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <div className="series-list">
                      {renderSeriesList()}
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="创建系列" key="create">
                  <div className="series-creation">
                    <Form.Item 
                      label="系列名称"
                      required
                      validateStatus={errors.seriesName ? 'error' : ''}
                      help={errors.seriesName}
                    >
                      <Input 
                        placeholder="输入系列名称" 
                        value={seriesInfo.seriesName}
                        onChange={(e) => handleSeriesChange('seriesName', e.target.value)}
                        maxLength={100}
                      />
                    </Form.Item>
                    
                    <Form.Item label="系列描述">
                      <TextArea 
                        placeholder="描述你的系列..." 
                        value={seriesInfo.seriesDescription}
                        onChange={(e) => handleSeriesChange('seriesDescription', e.target.value)}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        maxLength={1000}
                        showCount
                      />
                    </Form.Item>
                    
                    <Form.Item label="系列封面图片URL">
                      <Input 
                        placeholder="https://..." 
                        value={seriesInfo.seriesImage}
                        onChange={(e) => handleSeriesChange('seriesImage', e.target.value)}
                        addonBefore="URL:"
                      />
                    </Form.Item>
                    
                    <div className="series-actions">
                      <Button 
                        type="primary" 
                        onClick={handleSeriesCreate}
                        loading={loading}
                      >
                        创建系列
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('select')}
                        disabled={loading}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
              
              {seriesInfo.seriesId && seriesInfo.seriesId !== 'new' && (
                <div className="selected-series-info">
                  <div className="series-info-header">
                    <h3>已选择系列</h3>
                    <Tag color="green">已选择</Tag>
                  </div>
                  <div className="series-info-content">
                    <div className="series-info-item">
                      <span className="label">系列名称:</span>
                      <span className="value">{seriesInfo.seriesName}</span>
                    </div>
                    {seriesInfo.seriesDescription && (
                      <div className="series-info-item">
                        <span className="label">系列描述:</span>
                        <span className="value">{seriesInfo.seriesDescription}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Form>
        
        <div className="series-tips">
          <p>
            <InfoCircleOutlined /> 将NFT添加到系列可以提高其可发现性和收藏价值
          </p>
          <p>
            <InfoCircleOutlined /> 系列中的NFT可以共享属性模板和元数据结构
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SeriesManager;

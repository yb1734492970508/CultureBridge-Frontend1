import React, { useState, useCallback } from 'react';
import { Upload, message, Spin, Modal } from 'antd';
import { 
  UploadOutlined, PlusOutlined, MinusCircleOutlined, 
  FileImageOutlined, FileOutlined, VideoCameraOutlined,
  SoundOutlined, BlockOutlined
} from '@ant-design/icons';
import './MediaUploader.css';

/**
 * 媒体上传组件
 * 支持图片、视频、音频和3D模型等多种媒体格式的上传和预览
 */
const MediaUploader = ({ 
  value, 
  onChange,
  maxSize = 100, // 默认最大100MB
  accept = "image/*,video/*,audio/*,.glb,.gltf",
  showPreview = true,
  previewSize = 'medium' // small, medium, large
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // 媒体类型判断
  const getMediaType = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.endsWith('gltf') || type.endsWith('glb')) return 'model';
    return 'unknown';
  };
  
  // 文件上传前检查
  const beforeUpload = (file) => {
    // 文件类型检查
    const mediaType = getMediaType(file);
    if (mediaType === 'unknown') {
      message.error('不支持的文件类型!');
      return Upload.LIST_IGNORE;
    }
    
    // 文件大小检查
    const isLessThanMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLessThanMaxSize) {
      message.error(`文件大小不能超过${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }
    
    // 创建预览URL并更新状态
    setLoading(true);
    
    // 使用FileReader读取文件内容
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      onChange && onChange({
        file,
        url: result,
        type: mediaType
      });
      setLoading(false);
    };
    reader.onerror = () => {
      message.error('文件读取失败!');
      setLoading(false);
    };
    reader.readAsDataURL(file);
    
    // 阻止自动上传
    return false;
  };
  
  // 处理媒体文件移除
  const handleRemove = () => {
    onChange && onChange(null);
  };
  
  // 渲染媒体预览
  const renderMediaPreview = useCallback(() => {
    if (!value || !value.url) {
      return (
        <div className="upload-placeholder">
          <PlusOutlined />
          <div className="upload-text">上传媒体文件</div>
        </div>
      );
    }
    
    switch (value.type) {
      case 'image':
        return <img src={value.url} alt="Preview" className="media-preview" />;
      case 'video':
        return (
          <video 
            src={value.url} 
            controls={previewVisible}
            className="media-preview"
          />
        );
      case 'audio':
        return (
          <div className="audio-preview-container">
            <div className="audio-preview-icon">
              <SoundOutlined />
            </div>
            {previewVisible && (
              <audio 
                src={value.url} 
                controls 
                className="audio-preview"
              />
            )}
            {!previewVisible && (
              <div className="audio-preview-name">{value.file.name}</div>
            )}
          </div>
        );
      case 'model':
        return (
          <div className="model-preview-container">
            <div className="model-preview-icon">
              <BlockOutlined />
            </div>
            <div className="model-preview-name">{value.file.name}</div>
          </div>
        );
      default:
        return (
          <div className="file-preview-container">
            <div className="file-preview-icon">
              <FileOutlined />
            </div>
            <div className="file-preview-name">{value.file.name}</div>
          </div>
        );
    }
  }, [value, previewVisible]);
  
  // 渲染媒体图标
  const renderMediaTypeIcon = () => {
    if (!value) return <UploadOutlined />;
    
    switch (value.type) {
      case 'image':
        return <FileImageOutlined />;
      case 'video':
        return <VideoCameraOutlined />;
      case 'audio':
        return <SoundOutlined />;
      case 'model':
        return <BlockOutlined />;
      default:
        return <FileOutlined />;
    }
  };
  
  // 渲染预览模态框
  const renderPreviewModal = () => {
    return (
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        className="media-preview-modal"
      >
        <div className="media-preview-modal-content">
          {renderMediaPreview()}
        </div>
      </Modal>
    );
  };
  
  return (
    <div className={`media-uploader-container size-${previewSize}`}>
      <Upload
        name="media"
        listType="picture-card"
        className="media-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        accept={accept}
        disabled={loading}
      >
        {loading ? (
          <div className="loading-container">
            <Spin />
          </div>
        ) : (
          <div className="media-content">
            {showPreview ? renderMediaPreview() : (
              <div className="media-icon-only">
                {renderMediaTypeIcon()}
                <div className="media-name">
                  {value ? value.file.name : '上传媒体'}
                </div>
              </div>
            )}
            
            {value && (
              <div className="media-actions">
                <span 
                  className="media-action-btn preview-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewVisible(true);
                  }}
                  title="预览"
                >
                  👁️
                </span>
                <span 
                  className="media-action-btn remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  title="移除"
                >
                  ✕
                </span>
              </div>
            )}
          </div>
        )}
      </Upload>
      
      <div className="upload-tips">
        <p>支持的格式: 图片, 视频, 音频, 3D模型</p>
        <p>最大文件大小: {maxSize}MB</p>
      </div>
      
      {renderPreviewModal()}
    </div>
  );
};

export default MediaUploader;

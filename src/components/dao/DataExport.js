import React, { useState, useContext } from 'react';
import { DAOContext } from '../../context/dao/DAOContext';

// 数据导出服务
class DataExportService {
  // 导出为CSV格式
  static exportToCSV(data, filename) {
    if (!data || data.length === 0) {
      throw new Error('没有数据可导出');
    }

    // 获取所有列名
    const headers = Object.keys(data[0]);
    
    // 创建CSV内容
    const csvContent = [
      headers.join(','), // 表头
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // 处理包含逗号或引号的值
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // 创建并下载文件
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  // 导出为JSON格式
  static exportToJSON(data, filename) {
    if (!data) {
      throw new Error('没有数据可导出');
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
  }

  // 导出为Excel格式（简化版，实际应使用专门的库）
  static exportToExcel(data, filename) {
    if (!data || data.length === 0) {
      throw new Error('没有数据可导出');
    }

    // 创建简单的Excel XML格式
    const headers = Object.keys(data[0]);
    const xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Sheet1">
<Table>
<Row>
${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
</Row>
${data.map(row => `<Row>
${headers.map(header => `<Cell><Data ss:Type="String">${row[header] || ''}</Data></Cell>`).join('')}
</Row>`).join('')}
</Table>
</Worksheet>
</Workbook>`;

    this.downloadFile(xmlContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
  }

  // 下载文件
  static downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // 格式化提案数据用于导出
  static formatProposalsForExport(proposals) {
    return proposals.map(proposal => ({
      'ID': proposal.id,
      '标题': proposal.title,
      '类型': proposal.type,
      '状态': proposal.status,
      '创建者': proposal.creator,
      '创建时间': new Date(proposal.createdAt).toLocaleString('zh-CN'),
      '开始时间': new Date(proposal.startTime).toLocaleString('zh-CN'),
      '结束时间': new Date(proposal.endTime).toLocaleString('zh-CN'),
      '赞成票': proposal.votes?.for || 0,
      '反对票': proposal.votes?.against || 0,
      '弃权票': proposal.votes?.abstain || 0,
      '总票数': (proposal.votes?.for || 0) + (proposal.votes?.against || 0) + (proposal.votes?.abstain || 0),
      '通过阈值': proposal.threshold,
      '描述': proposal.description
    }));
  }

  // 格式化投票数据用于导出
  static formatVotesForExport(votes) {
    return votes.map(vote => ({
      'ID': vote.id,
      '提案ID': vote.proposalId,
      '投票者': vote.voter,
      '选择': vote.choice,
      '权重': vote.weight,
      '是否委托': vote.isDelegated ? '是' : '否',
      '代表': vote.delegate || '',
      '投票时间': new Date(vote.timestamp).toLocaleString('zh-CN'),
      '交易哈希': vote.txHash || ''
    }));
  }

  // 格式化委托数据用于导出
  static formatDelegationsForExport(delegations) {
    return delegations.map(delegation => ({
      'ID': delegation.id,
      '委托者': delegation.delegator,
      '代表': delegation.delegate,
      '委托金额': delegation.amount,
      '状态': delegation.status,
      '创建时间': new Date(delegation.createdAt).toLocaleString('zh-CN'),
      '生效时间': delegation.effectiveTime ? new Date(delegation.effectiveTime).toLocaleString('zh-CN') : '',
      '到期时间': delegation.expiryTime ? new Date(delegation.expiryTime).toLocaleString('zh-CN') : '',
      '交易哈希': delegation.txHash || ''
    }));
  }

  // 格式化代表数据用于导出
  static formatDelegatesForExport(delegates) {
    return delegates.map(delegate => ({
      'ID': delegate.id,
      '名称': delegate.name,
      '地址': delegate.address,
      '投票权重': delegate.votingPower,
      '委托者数量': delegate.delegatorCount || 0,
      '总委托金额': delegate.totalDelegated || 0,
      '参与率': delegate.participationRate || 0,
      '注册时间': new Date(delegate.registeredAt).toLocaleString('zh-CN'),
      '状态': delegate.status,
      '简介': delegate.bio || ''
    }));
  }
}

// 数据导出组件
const DataExport = () => {
  const { proposals, votes, delegations, delegates } = useContext(DAOContext);
  const [selectedDataType, setSelectedDataType] = useState('proposals');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  // 数据类型选项
  const dataTypeOptions = [
    { value: 'proposals', label: '提案数据' },
    { value: 'votes', label: '投票数据' },
    { value: 'delegations', label: '委托数据' },
    { value: 'delegates', label: '代表数据' }
  ];

  // 导出格式选项
  const formatOptions = [
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'excel', label: 'Excel' }
  ];

  // 日期范围选项
  const dateRangeOptions = [
    { value: 'all', label: '全部时间' },
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '1y', label: '最近1年' }
  ];

  // 根据日期范围筛选数据
  const filterDataByDateRange = (data, dateField) => {
    if (dateRange === 'all') return data;

    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };

    const cutoffDate = new Date(now.getTime() - timeRangeMs[dateRange]);
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= cutoffDate;
    });
  };

  // 获取要导出的数据
  const getExportData = () => {
    let data = [];
    let filename = '';

    switch (selectedDataType) {
      case 'proposals':
        data = filterDataByDateRange(proposals, 'createdAt');
        data = DataExportService.formatProposalsForExport(data);
        filename = `proposals_${dateRange}`;
        break;
      
      case 'votes':
        data = filterDataByDateRange(votes, 'timestamp');
        data = DataExportService.formatVotesForExport(data);
        filename = `votes_${dateRange}`;
        break;
      
      case 'delegations':
        data = filterDataByDateRange(delegations, 'createdAt');
        data = DataExportService.formatDelegationsForExport(data);
        filename = `delegations_${dateRange}`;
        break;
      
      case 'delegates':
        data = delegates; // 代表数据通常不按时间筛选
        data = DataExportService.formatDelegatesForExport(data);
        filename = `delegates`;
        break;
      
      default:
        throw new Error('未知的数据类型');
    }

    return { data, filename };
  };

  // 执行导出
  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      const { data, filename } = getExportData();
      
      if (!data || data.length === 0) {
        throw new Error('没有数据可导出');
      }

      // 添加时间戳到文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const finalFilename = `${filename}_${timestamp}`;

      // 根据选择的格式导出
      switch (selectedFormat) {
        case 'csv':
          DataExportService.exportToCSV(data, finalFilename);
          break;
        case 'json':
          DataExportService.exportToJSON(data, finalFilename);
          break;
        case 'excel':
          DataExportService.exportToExcel(data, finalFilename);
          break;
        default:
          throw new Error('未知的导出格式');
      }

      setExportStatus({
        type: 'success',
        message: `成功导出 ${data.length} 条记录`
      });

    } catch (error) {
      console.error('导出失败:', error);
      setExportStatus({
        type: 'error',
        message: `导出失败: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 获取数据统计信息
  const getDataStats = () => {
    try {
      const { data } = getExportData();
      return {
        count: data.length,
        hasData: data.length > 0
      };
    } catch (error) {
      return {
        count: 0,
        hasData: false
      };
    }
  };

  const stats = getDataStats();

  return (
    <div className="data-export">
      <div className="export-header">
        <h3>数据导出</h3>
        <p>导出DAO治理数据用于分析和备份</p>
      </div>

      <div className="export-form">
        <div className="form-row">
          <div className="form-group">
            <label>数据类型</label>
            <select 
              value={selectedDataType} 
              onChange={(e) => setSelectedDataType(e.target.value)}
              className="form-select"
            >
              {dataTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>导出格式</label>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="form-select"
            >
              {formatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>时间范围</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="form-select"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="export-info">
          <div className="data-preview">
            <h4>数据预览</h4>
            <div className="preview-stats">
              <span className="stat-item">
                <strong>记录数:</strong> {stats.count}
              </span>
              <span className="stat-item">
                <strong>格式:</strong> {selectedFormat.toUpperCase()}
              </span>
              <span className="stat-item">
                <strong>范围:</strong> {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
              </span>
            </div>
          </div>

          <div className="export-actions">
            <button
              onClick={handleExport}
              disabled={isExporting || !stats.hasData}
              className="export-button"
            >
              {isExporting ? '导出中...' : '开始导出'}
            </button>
          </div>
        </div>

        {exportStatus && (
          <div className={`export-status ${exportStatus.type}`}>
            {exportStatus.message}
          </div>
        )}
      </div>

      <div className="export-help">
        <h4>导出说明</h4>
        <ul>
          <li><strong>CSV格式:</strong> 适用于Excel和数据分析工具，文件较小</li>
          <li><strong>JSON格式:</strong> 适用于程序处理，保留完整数据结构</li>
          <li><strong>Excel格式:</strong> 适用于直接在Excel中查看和编辑</li>
          <li><strong>时间范围:</strong> 仅对有时间字段的数据类型有效</li>
          <li><strong>文件命名:</strong> 自动添加时间戳避免重名</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExport;


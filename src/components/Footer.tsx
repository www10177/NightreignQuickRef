import React from 'react';
import { Typography, Space } from 'antd';
import { HeartOutlined, GithubOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 格式化構建時間的函數
const formatBuildTime = (buildTime: string): string => {
  try {
    const date = new Date(buildTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    // 如果解析失敗，返回原始字符串
    return buildTime;
  }
};

const Footer: React.FC = React.memo(() => {
  // 獲取構建時間，如果不存在則使用當前時間
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();
  const formattedBuildTime = formatBuildTime(buildTime);

  return (
    <div className="footer">
      <Space direction="vertical" size="small" align="center">
        <Text type="secondary" className="footer-text">
          <HeartOutlined style={{ marginRight: '4px', color: '#ff4d4f' }} />
          Created by{' '}
          <a
            href="https://github.com/xxiixi"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Cecilia
          </a>
          {/* </a> */}
          {' '}｜{' '}
          <GithubOutlined style={{ marginRight: '4px' }} />
          Report an issue on{' '}
          <a
            href="https://github.com/xxiixi/NightreignQuickRef/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            NightreignQuickRef
          </a>
        </Text>
        <Text type="secondary" className="footer-text">
          © {new Date().getFullYear()} NightreignQuickRef · All Rights Reserved · Last updated: {formattedBuildTime}
        </Text>
      </Space>
    </div>
  );
});

export default Footer; 
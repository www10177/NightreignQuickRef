import React from 'react';
import { useVercount } from 'vercount-react';
import { Typography, Space, Button, Tooltip, Popover } from 'antd';
import { MoonOutlined, SunOutlined, FireOutlined, ReadOutlined, ArrowRightOutlined, GithubOutlined, PushpinOutlined, BaiduOutlined, BilibiliOutlined, LinkOutlined } from '@ant-design/icons';
import { getVersionDisplayText, getVersionNumber } from '../config/versionConfig';
import { DATA_SOURCE_CONFIG } from '../config/dataSourceConfig';
import type { DataSourceIcon } from '../config/dataSourceConfig';

const { Title, Text } = Typography;

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  // onToggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = React.memo(({
  isDarkMode,
  onToggleTheme,
  // onToggleLanguage
}) => {
  const { sitePv, siteUv, pagePv } = useVercount();

  // 根據圖標類型獲取對應的圖標組件
  const getDataSourceIcon = (iconType: DataSourceIcon): React.ReactNode => {
    switch (iconType) {
      case 'baidu':
        return <BaiduOutlined style={{ marginRight: '4px' }} />;
      case 'bilibili':
        return <BilibiliOutlined style={{ marginRight: '4px' }} />;
      case 'link':
        return <LinkOutlined style={{ marginRight: '4px' }} />;
      default:
        return null;
    }
  };

  // 渲染數據來源內容
  const renderDataSourceContent = () => {
    return (
      <div style={{ padding: '8px', maxWidth: '250px' }}>
        <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid rgba(198, 198, 198, 0.2)', paddingBottom: '8px' }}>
          數據來源鏈接 🔗
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          {DATA_SOURCE_CONFIG.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.showDivider && groupIndex > 0 && (
                <div style={{ marginBottom: '0px', borderTop: '1px solid rgba(198, 198, 198, 0.2)', paddingTop: '8px' }} />
              )}
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} style={{ marginBottom: '4px' }}>
                  {getDataSourceIcon(item.icon)}
                  {item.title}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowRightOutlined />
                  </a>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="top-bar-right">
            <Space size="small">
              <Tooltip title={isDarkMode ? "切換到亮色模式" : "切換到暗色模式"} placement="bottom">
                <Button
                  type="text"
                  icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />}
                  onClick={onToggleTheme}
                  className="theme-toggle-btn"
                />
              </Tooltip>

              <Tooltip title={"點擊跳轉【地圖種子篩選器】"} placement="bottom">
                <Button
                  type="text"
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-map" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z" />
                  </svg>}
                  onClick={() => window.open('https://xxiixi.github.io/NightreignMapFilter/', '_blank')}
                  className="theme-toggle-btn"
                />
              </Tooltip>

              <Tooltip title="查看訪問量" placement="bottom" className="theme-toggle-btn">
                <Popover
                  content={
                    <div style={{ padding: '5px' }}>
                      <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid rgba(198, 198, 198, 0.2)', paddingBottom: '4px' }}>
                        訪問量統計 🔥
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        本站總訪客數 <span style={{ color: '#1890ff' }}>{siteUv}</span> 人
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        本站總訪問量 <span style={{ color: '#1890ff' }}>{sitePv}</span> 次
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        數據查詢頁訪問量 <span style={{ color: '#1890ff' }}>{pagePv}</span> 次
                      </div>
                      <div style={{
                        marginTop: '8px',
                        borderTop: '1px solid rgba(198, 198, 198, 0.2)',
                        paddingTop: '8px',
                        fontSize: '10px',
                        color: '#999'
                      }}>
                        統計服務: Vercount
                      </div>
                    </div>
                  }
                  placement="bottom"
                  trigger="click"
                >
                  <Button
                    type="text"
                    icon={<FireOutlined />}
                    className="visits-counter-btn"
                  />
                </Popover>
              </Tooltip>

              <Tooltip title="查看數據來源" placement="bottom" className="theme-toggle-btn">
                <Popover
                  content={renderDataSourceContent()}
                  placement="bottom"
                  trigger="click"
                >
                  <Button
                    type="text"
                    icon={<ReadOutlined />}
                    className="visits-counter-btn"
                  />
                </Popover>
              </Tooltip>
              <Tooltip title="查看更新記錄和計劃" placement="bottom" className="theme-toggle-btn">
                <Popover
                  content={
                    <div style={{ padding: '8px', maxWidth: '280px' }}>
                      <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid rgba(198, 198, 198, 0.2)', paddingBottom: '8px' }}>
                        更新記錄 & 計劃 📋
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        {/* 最新更新 */}
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
                            ✅ 最新更新
                          </div>
                          <div style={{ marginLeft: '12px', marginBottom: '2px' }}>
                            • 添加了DLC新詞條數據；<br />
                            • 添加了{getVersionNumber()}版本更新後的新詞條數據；<br />
                            • 添加了DLC角色雷達圖數據；
                          </div>
                        </div>

                        <div style={{ marginBottom: '8px', borderTop: '1px solid rgba(198, 198, 198, 0.2)', paddingTop: '8px' }}>
                          <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                            🔧 TODO
                          </div>
                          <div style={{ marginLeft: '12px', marginBottom: '2px' }}>
                            • 添加新夜王、DLC新敵人數據<br />
                            • 更新新角色等級、閃避面板<br />
                            • 夜雨傷害數據待更新(無數據來源)
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  placement="bottom"
                  trigger="click"
                >
                  <Button
                    type="text"
                    icon={<PushpinOutlined />}
                    className="visits-counter-btn"
                  />
                </Popover>
              </Tooltip>
              <Tooltip title="查看本項目" placement="bottom" className="theme-toggle-btn">
                <Popover
                  content={
                    <div style={{ padding: '8px', maxWidth: '200px' }}>
                      <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>
                        <GithubOutlined style={{ marginRight: '4px' }} /> GitHub倉庫
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        <a
                          href="https://github.com/xxiixi/NightreignQuickRef"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="header-link"
                        >
                          NightreignQuickRef
                        </a>
                      </div>
                      <div style={{
                        marginTop: '8px',
                        borderTop: '1px solid rgba(198, 198, 198, 0.2)',
                        paddingTop: '8px',
                        fontSize: '10px',
                        color: '#999'
                      }}>
                        🙏 求個Star ⭐️ 感謝支持 🙏
                      </div>
                    </div>
                  }
                  placement="bottom"
                  trigger="click"
                >
                  <Button
                    type="text"
                    icon={<GithubOutlined />}
                    className="visits-counter-btn"
                  />
                </Popover>
              </Tooltip>
              {/* <Tooltip title="切換語言功能尚未開發" placement="bottom">
                <Button
                  type="text"
                  icon={<TranslationOutlined />}
                  onClick={onToggleLanguage}
                  className="language-toggle-btn"
                />
              </Tooltip> */}
            </Space>
          </div>
        </div>
      </div>

      <div className="header">
        <Title level={1} className="main-title">
          黑夜君臨速查手冊
        </Title>
        <Space direction="vertical" size="small" className="subtitle">
          <Text type="secondary" className="subtitle-text version-info">
            {getVersionDisplayText()}
          </Text>
          <Text type="secondary" className="subtitle-text">
            個人收集/整理的黑夜君臨數據、機制速查網頁，可快速檢索條目信息，後續會添加更多內容
          </Text>
        </Space>
      </div>
    </>
  );
});

export default Header; 
import React, { useState, useEffect } from 'react';
import { Typography, Timeline, Table, Alert, Steps, Progress, Statistic, Button, Space, Row, Col, Tag } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, FireTwoTone, HeartTwoTone, LockOutlined, MoneyCollectTwoTone, PauseCircleTwoTone, ThunderboltTwoTone, CloudOutlined, PlayCircleTwoTone, MessageOutlined, TrophyTwoTone, CaretRightOutlined, PauseOutlined, ReloadOutlined } from '@ant-design/icons';
import RecoveryCalculator from '../components/RecoveryCalculator';
import DataSourceTooltip from '../components/DataSourceTooltip';
import GiscusComments from '../components/GiscusComments';
import '../styles/gameMechanicsView.css';

const { Title, Text } = Typography;

interface GameMechanicsViewProps {
  functionName: string;
}

const CircleShrinkEffect: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  // 根據時間點計算圈的大小
  const getCircleSize = (step: number) => {
    switch (step) {
      case 0: return 100;
      case 1: return 60;
      case 2: return 60;  // 第一次縮圈結束
      case 3: return 20;  // 第二次縮圈開始
      case 4: return 20;  // 第二次縮圈結束
      case 5: return 20;
      default: return 100;
    }
  };

  const currentSize = getCircleSize(currentStep);

  const isShrinkingStart = (step: number) => {
    return step === 1 || step === 3;
  };

  const getShrinkPhase = (step: number) => {
    if (step === 1) return 'first';
    if (step === 3) return 'second';
    return 'none';
  };

  const isFirstShrinkPhase = (step: number) => {
    return step === 1 || step === 2;
  };

  const isFirstShrinkEnd = (step: number) => {
    return step === 2;
  };

  const isFirstShrinkCompleted = (step: number) => {
    return step >= 2;
  };

  const isSecondShrinkStart = (step: number) => {
    return step === 3;
  };

  const isSecondShrinkEnd = (step: number) => {
    return step === 4;
  };

  const getPreviousSize = (step: number) => {
    switch (step) {
      case 1: return 100;
      case 3: return 60;
      default: return currentSize;
    }
  };

  const shouldPulse = isShrinkingStart(currentStep);
  const previousSize = getPreviousSize(currentStep);
  const shrinkPhase = getShrinkPhase(currentStep);
  const isFirstShrink = isFirstShrinkPhase(currentStep);
  const isFirstShrinkEndPhase = isFirstShrinkEnd(currentStep);
  const isFirstShrinkCompletedPhase = isFirstShrinkCompleted(currentStep);
  const isSecondShrinkStartPhase = isSecondShrinkStart(currentStep);
  const isSecondShrinkEndPhase = isSecondShrinkEnd(currentStep);

  return (
    <div className="circle-shrink-container">
      <div className="circle-shrink-wrapper">
        {/* 外圈 - 固定大小 */}
        <div className={`circle-outer ${isFirstShrinkCompletedPhase ? 'circle-outer-faded' : ''} ${isSecondShrinkStartPhase ? 'circle-outer-second-shrink' : ''}`} />

        {/* 內圈 - 根據時間點動態變化 */}
        <div
          className={`circle-inner ${shouldPulse ? 'circle-pulse' : ''} ${shrinkPhase !== 'none' ? `shrink-${shrinkPhase}` : ''} ${isFirstShrink ? 'first-shrink-no-bg' : ''} ${isFirstShrinkEndPhase ? 'first-shrink-end-dark' : ''} ${isSecondShrinkStartPhase ? 'second-shrink-start-dark' : ''} ${isSecondShrinkEndPhase ? 'second-shrink-end-dark' : ''}`}
          style={{
            width: `${currentSize}%`,
            height: `${currentSize}%`,
            transition: 'all 0.8s ease-in-out'
          }}
        />

        {/* 脈衝效果圈 - 只在縮圈開始時顯示 */}
        {shouldPulse && (
          <div
            className={`circle-pulse-ring ${isSecondShrinkStartPhase ? 'second-shrink-pulse' : ''}`}
            style={{
              width: `${previousSize}%`,
              height: `${previousSize}%`,
            }}
          />
        )}

        {/* 中心點 */}
        <div className="circle-center" />

      </div>

    </div>
  );
};

const GameMechanicsView: React.FC<GameMechanicsViewProps> = ({ functionName }) => {
  // 計時器狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState(0); // 單位為秒

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const STAGES = [
    { step: 0, time: 0, label: 'Day 1/ Day 2 開始', location: '全地圖' },
    { step: 1, time: 270, label: '第一次縮圈開始', location: '遊戲內隨機指定' },
    { step: 2, time: 450, label: '第一次縮圈結束', location: '第一圈安全區' },
    { step: 3, time: 660, label: '第二次縮圈開始', location: '遊戲內隨機指定' },
    { step: 4, time: 840, label: '第二次縮圈結束', location: '最終安全區' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input element
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        setIsPlaying(false);
        setGameTime(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 計算當前進度與下一個階段
  const currentStage = [...STAGES].reverse().find(s => gameTime >= s.time) || STAGES[0];
  const nextStartStage = STAGES.find(s => s.label.includes('縮圈開始') && s.time > gameTime);
  const nextEndStage = STAGES.find(s => s.label.includes('縮圈結束') && s.time > gameTime);
  const day1TimelineStep = currentStage.step;

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleStop = () => {
    setIsPlaying(false);
    setGameTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeToNextStart = nextStartStage ? nextStartStage.time - gameTime : 0;
  const timeToNextEnd = nextEndStage ? nextEndStage.time - gameTime : 0;

  // 獲取當前時間點的時間和描述
  const getCurrentTimeInfo = (step: number) => {
    if (step >= 0 && step < STAGES.length) {
      const ms = STAGES[step].time;
      return {
        time: `${Math.floor(ms / 60)}:${(ms % 60).toString().padStart(2, '0')}`,
        description: STAGES[step].label
      };
    }
    return { time: '0:00', description: 'Day 1/ Day 2 開始' };
  };

  if (functionName === '遊戲機制') {
    return (
      <>
        <div className="game-mechanics-container" style={{ '--mechanics-container-width': '1400px' } as React.CSSProperties}>
          <div className="mechanics-layout">

            {/* 遊戲時間機制 - 自定義寬度比例 2:1 */}
            <div className="mechanics-grid custom-columns" style={{ '--mechanics-grid-columns': '1.2fr 2fr' } as React.CSSProperties}>
              <div className="mechanic-card" id="game-time-mechanism">
                <div className="card-content">
                  <div className="card-title-section">
                    <Title level={5} className="mechanic-card-title">
                      <ClockCircleTwoTone twoToneColor="blue" />
                      遊戲時間機制
                    </Title>
                  </div>
                  <div className="card-body">
                    {/* 新增計時器區塊 */}
                    <div style={{ padding: '16px', background: 'var(--card-bg-subtle, rgba(0, 0, 0, 0.02))', border: '1px solid var(--border-color, rgba(140, 140, 140, 0.2))', borderRadius: '8px', marginBottom: '16px' }}>
                      {/* 第一排：三個時間 */}
                      <Row gutter={[16, 16]} align="top">
                        <Col xs={24} sm={8}>
                          <Statistic title="目前遊戲時間" value={formatTime(gameTime)} valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }} />
                        </Col>
                        <Col xs={24} sm={8}>
                          <Statistic title={nextStartStage ? `距離${nextStartStage.label}` : '縮圈已全部開始'} value={nextStartStage ? formatTime(timeToNextStart) : '--:--'} valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 'bold' }} />
                        </Col>
                        <Col xs={24} sm={8}>
                          <Statistic title={nextEndStage ? `距離${nextEndStage.label}` : '縮圈已全部結束'} value={nextEndStage ? formatTime(timeToNextEnd) : '--:--'} valueStyle={{ color: '#eb2f96', fontSize: '28px', fontWeight: 'bold' }} />
                        </Col>
                      </Row>

                      {/* 第二排：按鈕 */}
                      <Row style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color, rgba(140, 140, 140, 0.2))' }}>
                        <Col span={24}>
                          <Space size="middle" wrap>
                            {!isPlaying ? (
                              <Button type="primary" icon={<CaretRightOutlined />} onClick={handlePlay}>
                                開始 <Tag style={{ marginLeft: 8, marginRight: 0, border: 'none', background: 'rgba(255,255,255,0.2)' }} color="transparent">Space</Tag>
                              </Button>
                            ) : (
                              <Button type="default" icon={<PauseOutlined />} onClick={handlePause}>
                                暫停 <Tag style={{ marginLeft: 8, marginRight: 0 }}>Space</Tag>
                              </Button>
                            )}
                            <Button danger icon={<ReloadOutlined />} onClick={handleStop}>
                              重置 <Tag style={{ marginLeft: 8, marginRight: 0 }} color="error">R</Tag>
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                    <div className="mechanic-timeline">
                      <Timeline
                        mode="left"
                        items={[
                          {
                            dot: <PauseCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '16px' }} />,
                            children: 'Day 1 / Day 2 開始',
                            color: 'green',
                            label: '0:00',
                          },
                          {
                            dot: <ThunderboltTwoTone />,
                            children: '4.5 min',
                          },
                          {
                            dot: <ClockCircleTwoTone />,
                            children: '第一次縮圈開始',
                            label: '4:30',
                          },
                          {
                            dot: <ThunderboltTwoTone />,
                            children: '3 min',
                          },
                          {
                            dot: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '16px' }} />,
                            children: '第一次縮圈結束',
                            label: '7:30',
                          },
                          {
                            dot: <ThunderboltTwoTone />,
                            children: '3.5 min',
                          },
                          {
                            dot: <ClockCircleTwoTone />,
                            children: '第二次縮圈開始',
                            label: '11:00',
                          },
                          {
                            dot: <ThunderboltTwoTone />,
                            children: '3 min',
                          },
                          {
                            dot: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '16px' }} />,
                            children: '第二次縮圈結束',
                            label: '14:00',
                          },
                          {
                            dot: <FireTwoTone twoToneColor="red" />,
                            children: '戰鬥!',
                          },
                          {
                            dot: <HeartTwoTone twoToneColor="#eb2f96" />,
                            children: 'Day 2 開始 / 最終Boss戰',
                            color: 'green',
                            label: '0:00',
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 右側小卡片 - 升級所需盧恩 */}
              <div className="mechanic-card" id="runes-required">
                <div className="card-content">
                  <div className="card-title-section">
                    <Title level={5} className="mechanic-card-title">
                      <MoneyCollectTwoTone twoToneColor="#faad14" />
                      升級所需盧恩
                    </Title>
                  </div>
                  <div className="card-body">
                    <div className="runes-table-container">
                      {/* 第一欄 - 1-8級 */}
                      <div className="runes-column">
                        <Table
                          dataSource={[
                            { key: '1', level: '1', runes: '0', totalCost: '-' },
                            { key: '2', level: '2', runes: '3,698', totalCost: '3,698' },
                            { key: '3', level: '3', runes: '7,922', totalCost: '11,620' },
                            { key: '4', level: '4', runes: '12,348', totalCost: '23,968' },
                            { key: '5', level: '5', runes: '16,978', totalCost: '40,946' },
                            { key: '6', level: '6', runes: '21,818', totalCost: '62,764' },
                            { key: '7', level: '7', runes: '26,869', totalCost: '89,633' },
                            { key: '8', level: '8', runes: '32,137', totalCost: '121,770' },
                          ]}
                          columns={[
                            {
                              title: '等級',
                              dataIndex: 'level',
                              key: 'level',
                              width: '33%',
                            },
                            {
                              title: '所需盧恩',
                              dataIndex: 'runes',
                              key: 'runes',
                              width: '33%',
                              render: (text) => (
                                <span style={{ color: '#1890ff' }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: '總成本',
                              dataIndex: 'totalCost',
                              key: 'totalCost',
                              width: '34%',
                            }
                          ]}
                          pagination={false}
                          size="small"
                          bordered
                          style={{ marginTop: '8px' }}
                        />
                      </div>

                      {/* 第二欄 - 9-15級 */}
                      <div className="runes-column">
                        <Table
                          dataSource={[
                            { key: '9', level: '9', runes: '37,624', totalCost: '159,394' },
                            { key: '10', level: '10', runes: '43,335', totalCost: '202,729' },
                            { key: '11', level: '11', runes: '49,271', totalCost: '252,000' },
                            { key: '12', level: '12', runes: '55,439', totalCost: '307,439' },
                            { key: '13', level: '13', runes: '61,840', totalCost: '369,279' },
                            { key: '14', level: '14', runes: '68,479', totalCost: '437,758' },
                            { key: '15', level: '15', runes: '75,358', totalCost: '513,116' },
                            { key: 'total', level: '總計', runes: '513,336', totalCost: '-' },
                          ]}
                          columns={[
                            {
                              title: '等級',
                              dataIndex: 'level',
                              key: 'level',
                              width: '33%',
                            },
                            {
                              title: '所需盧恩',
                              dataIndex: 'runes',
                              key: 'runes',
                              width: '33%',
                              render: (text) => (
                                <span style={{
                                  color: '#1890ff'
                                }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: '總成本',
                              dataIndex: 'totalCost',
                              key: 'totalCost',
                              width: '34%',

                            }
                          ]}
                          pagination={false}
                          size="small"
                          bordered
                          style={{ marginTop: '8px' }}
                        />
                      </div>
                    </div>

                    {/* 升級所需盧恩註釋信息 */}
                    <Alert
                      // 加一個title：小提示
                      description={
                        <div className="dodge-frames-tips">
                          <div className="tip-item">
                            1. 角色 3 級可使用<strong style={{ color: '#0360b8' }}>藍色武器</strong>，
                            7 級可使用<strong style={{ color: '#722ed1' }}>紫色武器</strong>，
                            10 級可使用<strong style={{ color: '#faad14' }}>金色武器</strong>。
                          </div>
                          <div className="tip-item">
                            2. 如果當前盧恩足夠升級，左上角顯示等級的數字左邊會出現一個白色箭頭(局內)。
                          </div>
                          <div className="tip-item">
                            3. 單人模式獲得1.5倍盧恩 | 雙人模式獲得1.3倍盧恩 | 三人模式獲得1倍盧恩
                          </div>
                        </div>
                      }
                      type="info"
                      showIcon={false}
                      style={{ marginTop: '15px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 可點擊時間軸 */}
            <div className="mechanics-grid one-columns">
              <div className="mechanic-card" id="prison-rain-mechanism">
                <div className="card-content">
                  <div className="card-title-section">
                    <Title level={5} className="mechanic-card-title">
                      <PlayCircleTwoTone twoToneColor="#722ed1" />
                      遊戲時間機制: 監牢/夜雨
                    </Title>
                  </div>
                  <div className="card-body">
                    <div className="timeline-layout-container">
                      <div className="timeline-content-wrapper">
                        {/* 時間軸內容 */}
                        <div className="timeline-content">
                          {/* 時間軸 + 兩欄佈局 */}
                          <div className="timeline-with-steps">
                            {/* 左側時間軸 */}
                            <div className="timeline-steps-container">
                              <Steps
                                size="small"
                                direction="vertical"
                                current={day1TimelineStep}
                                onChange={(step) => {
                                  setIsPlaying(false);
                                  const targetTime = STAGES.find(s => s.step === step)?.time || 0;
                                  setGameTime(targetTime);
                                }}
                                items={[
                                  { title: '0:00', description: 'Day 1/ Day 2 開始' },
                                  { title: '4:30', description: '第一次縮圈開始' },
                                  { title: '7:30', description: '第一次縮圈結束' },
                                  { title: '11:00', description: '第二次縮圈開始' },
                                  { title: '14:00', description: '第二次縮圈結束' },
                                ]}
                              />
                            </div>

                            {/* 右側內容區域 */}
                            {/* 兩欄佈局 */}
                            <div className="timeline-two-columns">
                              {/* 第一欄：縮圈效果圖 */}
                              <div className="timeline-column">
                                <div className="timeline-column-content">
                                  <CircleShrinkEffect currentStep={day1TimelineStep} />
                                  <div style={{
                                    textAlign: 'center',
                                    marginTop: '12px',
                                    fontSize: '12px',
                                    color: '#666',
                                    fontWeight: 'normal'
                                  }}>
                                    {getCurrentTimeInfo(day1TimelineStep).time} - {getCurrentTimeInfo(day1TimelineStep + 1).time} <br />
                                    {getCurrentTimeInfo(day1TimelineStep).description}
                                  </div>
                                </div>
                              </div>

                              {/* 第二欄：封印監牢Boss + 雨中冒險傷害 */}
                              <div className="timeline-column">
                                <div className="timeline-column-content">
                                  <div className="boss-info">
                                    <div className="boss-progress-container">
                                      <div className="boss-section-title">
                                        <LockOutlined />
                                        Day 1: 封印監牢Boss血量/攻擊力
                                      </div>
                                      <div className="boss-progress-item">
                                        <div className="progress-label">Boss血量：</div>
                                        <Progress
                                          percent={day1TimelineStep <= 4 ? 55 : 100}
                                          strokeColor="#cf1322"
                                          format={(percent) => `${percent}%`}
                                        />
                                      </div>
                                      <div className="boss-progress-item">
                                        <div className="progress-label">Boss攻擊力：</div>
                                        <Progress
                                          percent={day1TimelineStep <= 4 ? 53 : 0}
                                          strokeColor="#3f8600"
                                          format={(percent) => `${percent}%`}
                                        />
                                      </div>
                                    </div>

                                    <div className="boss-progress-container">
                                      <div className="boss-section-title">
                                        <LockOutlined />
                                        Day 2: 封印監牢Boss血量/攻擊力
                                      </div>
                                      <div className="boss-progress-item">
                                        <div className="progress-label">Boss血量：</div>
                                        <Progress
                                          percent={day1TimelineStep <= 1 ? 75 :
                                            day1TimelineStep <= 4 ? 100 : 0}
                                          strokeColor="#cf1322"
                                          format={(percent) => `${percent}%`}
                                        />
                                      </div>
                                      <div className="boss-progress-item">
                                        <div className="progress-label">Boss攻擊力：</div>
                                        <Progress
                                          percent={day1TimelineStep <= 1 ? 80 :
                                            day1TimelineStep <= 3 ? 100 : 100}
                                          strokeColor="#3f8600"
                                          format={(percent) => `${percent}%`}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="damage-info">
                                    <div className="boss-progress-container">
                                      <div className="boss-section-title">
                                        <CloudOutlined />
                                        夜雨傷害（當前數據為9.10更新前版本，更新後夜雨傷害增加，具體數據待更新）
                                      </div>
                                      <div className="damage-stat">
                                        <Statistic
                                          title="每秒受到的傷害"
                                          value={day1TimelineStep === 0 ? '夜雨尚未出現' :
                                            day1TimelineStep === 1 ? '當前角色血量 × 2% + 15' :
                                              day1TimelineStep === 2 ? '當前角色血量 × 2% + 15' :
                                                day1TimelineStep === 3 ? '當前角色血量 × 2% + 30' :
                                                  day1TimelineStep === 4 ? '當前角色血量 × 2% + 30' : '當前角色血量 × 2% + 30'}
                                          valueStyle={{
                                            color: day1TimelineStep === 0 ? '#666' : '#1890ff',
                                            fontSize: '20px',
                                          }}
                                        />
                                      </div>
                                      <div className="damage-stat" style={{ marginTop: '8px' }}>
                                        <Text type="secondary" style={{ fontSize: '14px', color: '#666' }}>
                                          超時秒殺機制：110秒後，傷害變為10%+30/0.5s，120秒後直接秒殺
                                        </Text>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 評分系統板塊 */}
            <div className="mechanics-grid">
              <div className="mechanic-card" id="deep-night-rating-rules">
                <div className="card-content">
                  <div className="card-title-section">
                    <Title level={5} className="mechanic-card-title">
                      <TrophyTwoTone twoToneColor="#faad14" />
                      深夜模式評分規則
                    </Title>
                  </div>
                  <div className="card-body">
                    <div className="rating-system-content">
                      <div className="rating-table-section">
                        <Title level={5} style={{ marginBottom: '16px', fontSize: '16px' }}>評分規則</Title>
                        <Table
                          dataSource={[
                            { key: '1', depthLevel: '深度一 (0-999)', firstDayLoss: '-0', secondDayLoss: '-0', finalDayLoss: '-0', victory: '+200' },
                            { key: '2', depthLevel: '深度二 (1000-1999)', firstDayLoss: '-200', secondDayLoss: '-100', finalDayLoss: '-0', victory: '+200' },
                            { key: '3', depthLevel: '深度三 (2000-3999)', firstDayLoss: '-400', secondDayLoss: '-300', finalDayLoss: '-200', victory: '+200' },
                            { key: '4', depthLevel: '深度四 (4000-5999)', firstDayLoss: '-600', secondDayLoss: '-500', finalDayLoss: '-400', victory: '+200' },
                            { key: '5', depthLevel: '深度五 (6000+)', firstDayLoss: '-800', secondDayLoss: '-700', finalDayLoss: '-600', victory: '+200' },
                          ]}
                          columns={[
                            {
                              title: '深度等級',
                              dataIndex: 'depthLevel',
                              key: 'depthLevel',
                              width: '20%',
                              align: 'left',
                            },
                            {
                              title: 'Day 1 失敗',
                              dataIndex: 'firstDayLoss',
                              key: 'firstDayLoss',
                              width: '20%',
                              align: 'center',
                              render: (text) => (
                                <span style={{ color: text.startsWith('+') ? '#52c41a' : '#1890ff' }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: 'Day 2 失敗',
                              dataIndex: 'secondDayLoss',
                              key: 'secondDayLoss',
                              width: '20%',
                              align: 'center',
                              render: (text) => (
                                <span style={{ color: text.startsWith('+') ? '#52c41a' : '#1890ff' }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: 'Day 3 失敗',
                              dataIndex: 'finalDayLoss',
                              key: 'finalDayLoss',
                              width: '20%',
                              align: 'center',
                              render: (text) => (
                                <span style={{ color: text.startsWith('+') ? '#52c41a' : '#1890ff' }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: '勝利',
                              dataIndex: 'victory',
                              key: 'victory',
                              width: '20%',
                              align: 'center',
                              render: (text) => (
                                <span style={{ color: text.startsWith('+') ? '#52c41a' : '#1890ff' }}>
                                  {text}
                                </span>
                              )
                            },
                          ]}
                          pagination={false}
                          size="small"
                          bordered
                        />
                      </div>

                      {/* 條件修正表 */}
                      <div className="rating-table-section" style={{ marginTop: '24px' }}>
                        <Title level={5} style={{ marginBottom: '16px', fontSize: '16px' }}>評分修正</Title>
                        <Table
                          dataSource={[
                            {
                              key: '1',
                              condition: '隱藏地圖',
                              lossModifier: '+200',
                              winModifier: '+100',
                              description: '隨機位置在地圖上不可見【僅限等級3+】'
                            },
                            {
                              key: '2',
                              condition: '隱藏夜王',
                              lossModifier: '+200',
                              winModifier: '+100',
                              description: '夜王身份在進Boss房前隱藏【僅限等級3+】'
                            },
                            {
                              key: '3',
                              condition: '其他玩家提前退出',
                              lossModifier: '50%',
                              winModifier: '無',
                              description: '其他玩家提前退出時，懲罰減半'
                            },
                            {
                              key: '4',
                              condition: '自己提前退出',
                              lossModifier: '無',
                              winModifier: '無',
                              description: '無論輸贏，都會在未來的遊戲中結算懲罰（按照退出時間點判負）'
                            },
                            {
                              key: '5',
                              condition: '高1級匹配',
                              lossModifier: '+50',
                              winModifier: '+50',
                              description: '對局深度比自己深度多1級時，結算時額外+50'
                            },
                            {
                              key: '6',
                              condition: '低1級匹配',
                              lossModifier: '-50',
                              winModifier: '-50',
                              description: '對局深度比自己深度少1級時，結算時額外-50'
                            },
                          ]}
                          columns={[
                            {
                              title: '條件',
                              dataIndex: 'condition',
                              key: 'condition',
                              width: '20%',
                              align: 'left',
                            },
                            {
                              title: '失敗時修正',
                              dataIndex: 'lossModifier',
                              key: 'lossModifier',
                              width: '15%',
                              align: 'center',
                              render: (text) => (
                                <span style={{
                                  color: text.startsWith('+') ? '#52c41a' : '#1890ff'
                                }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: '勝利時修正',
                              dataIndex: 'winModifier',
                              key: 'winModifier',
                              width: '15%',
                              align: 'center',
                              render: (text) => (
                                <span style={{
                                  color: text.startsWith('+') ? '#52c41a' : '#1890ff'
                                }}>
                                  {text}
                                </span>
                              )
                            },
                            {
                              title: '描述',
                              dataIndex: 'description',
                              key: 'description',
                              width: '50%',
                              align: 'left',
                            },
                          ]}
                          pagination={false}
                          size="small"
                          bordered
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mechanics-grid">
              <div className="mechanic-card" id="recovery-calculator">
                <div className="card-content">
                  <div className="card-title-section">
                    <Title level={5} className="mechanic-card-title">
                      <HeartTwoTone twoToneColor="#eb2f96" />
                      回血量計算器
                      <DataSourceTooltip
                        links={[{
                          text: "【黑夜君臨】聖盃瓶恢復、緩回、群回機制解析及常見誤區",
                          url: "https://www.bilibili.com/video/BV1M18jzQE9X"
                        }]}
                      />
                    </Title>
                  </div>
                  <div className="card-body">
                    <RecoveryCalculator />
                  </div>
                </div>
              </div>
            </div>

            {/* 評論與討論 */}
            <div className="mechanics-grid">
              <div className="mechanic-card" id="comments-discussion">
                <div className="card-content">
                  <div className="card-title-section">
                    <Title level={5} className="mechanic-card-title">
                      <MessageOutlined />
                      評論與討論(需登錄github帳號)
                    </Title>
                  </div>
                  <div className="card-body">
                    <GiscusComments />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }

  // 其他功能保持原有的簡單顯示
  return (
    <div className="mechanics-development-placeholder">
      <Title level={3} className="mechanics-development-title">{functionName}</Title>
      <Text className="mechanics-development-text">此功能正在開發中...</Text>
    </div>
  );
};

export default GameMechanicsView; 
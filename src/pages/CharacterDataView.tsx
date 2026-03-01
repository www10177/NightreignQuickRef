import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Table, Alert, Tabs, Divider } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Radar, Column } from '@ant-design/plots';
import { ThunderboltTwoTone } from '@ant-design/icons';
import { throttle } from 'lodash';
import { getCurrentTheme } from '../utils/themeUtils';
import '../styles/characterDataView.css';
import DataManager from '../utils/dataManager';
import DataSourceTooltip from '../components/DataSourceTooltip';

const { Title, Text } = Typography;

// 數據接口
interface DataState {
  characterStatesData: CharacterData[];
  loading: boolean;
}

// 導入 MagicMove 接口
import type { MagicMove } from '../utils/dataManager';

// 角色詳細數據行類型
interface CharacterDetailRow {
  character: string;
  [key: string]: string | number;
}

// JSON 標籤頁類型
interface JsonTab {
  name: string;
  columns: ColumnsType<CharacterDetailRow>;
  data: CharacterDetailRow[];
}

// 角色等級數據類型
interface CharacterLevelData {
  level: number; // 等級
  HP: number;
  FP: number;
  ST: number;
  [key: string]: string | number;
}

// 閃避無敵幀對比組件
const DodgeFramesComparison = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(getCurrentTheme());
  const [chartKey, setChartKey] = useState(0);
  const [frameData, setFrameData] = useState<Array<{ name: string; type: string; value: number }>>([]);

  useEffect(() => {
    const checkTheme = () => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        setChartKey(prev => prev + 1);
      }
    };

    // 初始檢查
    checkTheme();

    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      // 延遲一點時間確保 localStorage 已更新
      setTimeout(checkTheme, 50);
    };

    // 監聽系統主題變化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      checkTheme();
    };

    // 監聽自定義主題變化事件
    const handleThemeChange = () => {
      setTimeout(checkTheme, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [currentTheme]);

  // 處理窗口大小變化和拖拽導致的圖表刷新問題
  useEffect(() => {
    // 節流後的圖表刷新函數
    const throttledChartRefresh = throttle(() => {
      // 強制重新渲染圖表
      setChartKey(prev => prev + 1);
    }, 300); // 300ms節流延遲

    // 監聽窗口大小變化
    const handleResize = () => {
      throttledChartRefresh();
    };

    // 監聽拖拽相關事件
    const handleDragEnd = () => {
      // 拖拽結束後延遲刷新，確保容器尺寸已穩定
      setTimeout(throttledChartRefresh, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []); // 空依賴數組，只在組件掛載時設置監聽器

  // 確保組件掛載後圖表能正確渲染
  useEffect(() => {
    // 強制重新渲染圖表
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 加載無敵幀數據
  useEffect(() => {
    const loadFrameData = async () => {
      try {
        const dataManager = DataManager.getInstance();
        await dataManager.waitForData();
        setFrameData(dataManager.getInvincibleFrames());
      } catch (error) {
        console.error('Failed to load frame data:', error);
      }
    };

    loadFrameData();
  }, []);

  // 計算每個角色的總幀數用於頂部註釋
  const totalFrames: { [key: string]: number } = {};
  frameData.forEach((item: { name: string; type: string; value: number }) => {
    if (!totalFrames[item.name]) {
      totalFrames[item.name] = 0;
    }
    totalFrames[item.name] += item.value;
  });

  // 創建註釋數組
  const annotations = Object.entries(totalFrames).map(([name, total]) => ({
    type: 'text',
    data: [name, total],
    style: {
      text: `${total}`,
      textBaseline: 'bottom',
      position: 'top',
      textAlign: 'center',
      fontSize: 14,
      fill: currentTheme === 'dark' ? 'rgba(232, 232, 232, 0.85)' : 'rgb(0, 158, 231)',
    },
    tooltip: false,
  }));

  const config = {
    data: frameData,
    xField: 'name',
    yField: 'value',
    stack: true,
    colorField: 'type',
    theme: currentTheme,
    height: 400,
    autoFit: true,
    label: {
      text: 'value',
      textBaseline: 'bottom',
      position: 'inside',
    },
    tooltip: false,
    scale: {
      y: {
        domainMax: 60,
      },
    },
    axis: {
      x: {
        label: {
          autoRotate: false,
          autoHide: false,
          autoEllipsis: false,
          style: {
            fill: currentTheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 12,
          },
        },
        line: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        tickLine: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        labelFormatter: (value: string) => {
          // 將括號內容換行顯示
          return value.replace(/（([^）]+)）/g, '\n（$1）');
        },
      },
      y: {
        label: {
          style: {
            fill: currentTheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 12,
          },
        },
        line: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        tickLine: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        labelFormatter: (value: number) => `${value}幀`,
      },
    },
    style: {
      radius: 10,
      fillOpacity: 0.8,
    },
    annotations,
  };

  return (
    <div className="content-wrapper card-item">
      <div className="card-header">
        <Title level={5} className="character-card-title">
          翻滾/閃避 幀數對比
        </Title>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: '10px', color: 'var(--theme-text-secondary)', fontSize: '14px' }}>
          提示：圖中為60幀情況下的數據（1幀即1/60秒）
        </div>
        <div
          className="dodge-frames-chart-container"
          style={{
            height: 400,
            width: '100%',
            padding: '20px 0',
            minHeight: '400px',
            position: 'relative'
          }}
        >
          <Column key={`dodge-frames-${chartKey}`} {...config} />
        </div>

        {/* 提示信息 */}
        <Alert
          message="機制說明"
          description={
            <div className="dodge-frames-tips">
              <div className="tip-item">
                1. 黑夜君臨中沒有負重影響人物翻滾 / 閃避的機制，角色直接決定迴避性能，人物體型 / 身高與迴避性能無關。
              </div>

              <div className="tip-item">
                2. 藍色部分表示 "無敵幀"，綠色部分表示非無敵幀。從0幀開始，非無敵幀結束後即可自由移動。（無敵幀 + 非無敵幀 = 翻滾/閃避動畫總幀長）
              </div>

              <div className="tip-item">
                3. 如果角色在動作的無敵幀結束前執行了其他動作（如進行輕攻擊），那無敵幀會在執行其他動作的瞬間中斷，同時這也會減少整個閃避動作的位移距離。
              </div>

              <div className="tip-item">
                4. 各數值對應的秒數計算：幀數數值× (1/60秒); 舉例: 追蹤者翻滾總時長為40幀，在60幀情況下，對應的時長為 40×(1/60)s = 2/3s ≈ 0.67s
              </div>
            </div>
          }
          type="info"
          showIcon={false}
          style={{ marginTop: '20px' }}
        />
      </div>
    </div>
  );
};

// 角色屬性接口定義
interface CharacterState {
  [key: string]: string;
}

// 角色數據接口定義
interface CharacterData {
  [characterName: string]: CharacterState;
}

const CharacterDataView: React.FC = () => {
  // 數據狀態
  const [data, setData] = useState<DataState>({
    characterStatesData: [],
    loading: true
  });

  // 隱士出招表數據
  const [magicMoves, setMagicMoves] = useState<MagicMove[]>([]);

  // JSON（職業數據）標籤頁狀態
  const [jsonTabs, setJsonTabs] = useState<JsonTab[]>([]);
  const [hpData, setHpData] = useState<CharacterDetailRow[]>([]);
  const [fpData, setFpData] = useState<CharacterDetailRow[]>([]);
  const [stData, setStData] = useState<CharacterDetailRow[]>([]);

  // 頂部與底部表格頁腳
  const topTablesFooter = () => (
    <div className="footer-text">血量、專注、耐力具體數值/局內等級成長</div>
  );
  const bottomTablesFooter = () => (
    <div className="footer-text">局內等級/艾爾登法環本體等級</div>
  );
  const characterAttributesFooter = () => (
    <div className="footer-text" >
      提示：可勾選多個角色進行對比
    </div>
  );

  // 從DataManager獲取數據並加載JSON數據
  useEffect(() => {
    const loadData = async () => {
      try {
        const dataManager = DataManager.getInstance();
        await dataManager.waitForData();

        setData({
          characterStatesData: dataManager.getCharacterStates(),
          loading: false
        });

        // 加載隱士出招表數據
        setMagicMoves(dataManager.getMagicMoveList());

        // 使用預加載的角色詳細數據
        const characterDetailData = dataManager.getCharacterDetailData();
        const tabs: JsonTab[] = [];
        const hpRows: CharacterDetailRow[] = [];
        const fpRows: CharacterDetailRow[] = [];
        const stRows: CharacterDetailRow[] = [];

        // 統一獲取屬性列（排除 HP/FP/ST/等級）
        const firstCharacterWithData = Object.values(characterDetailData).find((arr): arr is CharacterLevelData[] => Array.isArray(arr) && arr.length > 0);
        const attributeKeys = firstCharacterWithData
          ? Object.keys(firstCharacterWithData[0]).filter(key => !['HP', 'FP', 'ST', '等級', 'level'].includes(key))
          : [];

        // 構建等級視圖：每個等級一個 Tab，行=角色，列=各屬性
        for (let lv = 1; lv <= 15; lv++) {
          const levelColumns: ColumnsType<CharacterDetailRow> = [
            {
              title: `角色（${lv}級）`,
              dataIndex: 'character',
              key: 'character',
              width: 100,
              fixed: 'left',
              align: 'center' as const,
              render: (text: string) => (
                <span style={{
                  fontWeight: 'bold',
                  color: 'var(--color-text-1)',
                  fontSize: '13px'
                }}>
                  {text}
                </span>
              )
            },
            ...attributeKeys.map(attrKey => ({
              title: attrKey === '增加點數'
                ? <span>{`Lv${lv - 1} → Lv${lv}`} 增加點數</span>
                : ['生命力', '集中力', '耐力', '力氣', '敏捷', '智力', '信仰', '感應'].includes(attrKey)
                  ? <span style={{ fontWeight: 'bold', color: 'var(--color-primary-500)' }}>{attrKey}</span>
                  : attrKey,
              dataIndex: attrKey,
              key: attrKey,
              width: attrKey === '增加點數' ? 140 : 60,
              align: 'center' as const,
              render: (value: string | number | undefined) => (
                <span style={{
                  fontWeight: '500',
                  color: value ? 'var(--color-text-1)' : 'var(--color-text-3)',
                  fontSize: '13px'
                }}>
                  {value || '-'}
                </span>
              )
            }))
          ];

          const rowsAtLevel: CharacterDetailRow[] = [];
          Object.entries(characterDetailData).forEach(([characterName, characterLevels]) => {
            if (Array.isArray(characterLevels) && characterLevels.length > 0) {
              const levelData = (characterLevels as CharacterLevelData[]).find((item: CharacterLevelData) => (item['等級'] ?? item.level) === lv);
              const row: CharacterDetailRow = { character: characterName };
              attributeKeys.forEach(attrKey => {
                row[attrKey] = levelData ? levelData[attrKey] : '';
              });
              rowsAtLevel.push(row);
            }
          });

          tabs.push({
            name: `🔸 Lv${lv}`,
            columns: levelColumns,
            data: rowsAtLevel
          });
        }

        // 提取 HP/FP/ST 數據：按等級聚合到 Lv1..Lv15
        Object.entries(characterDetailData).forEach(([characterName, characterData]) => {
          if (characterData && Array.isArray(characterData) && characterData.length > 0) {
            const buildRow = (statKey: string): CharacterDetailRow => {
              const row: CharacterDetailRow = { character: characterName };
              for (let lv = 1; lv <= 15; lv++) {
                const levelData = (characterData as CharacterLevelData[]).find((item: CharacterLevelData) => (item['等級'] ?? item.level) === lv);
                row[`Lv${lv}`] = levelData ? levelData[statKey] : '';
              }
              return row;
            };

            const hpRow = buildRow('HP');
            const fpRow = buildRow('FP');
            const stRow = buildRow('ST');

            hpRows.push(hpRow);
            fpRows.push(fpRow);
            stRows.push(stRow);
          }
        });

        setJsonTabs(tabs);
        setHpData(hpRows);
        setFpData(fpRows);
        setStData(stRows);
      } catch (error) {
        console.error('Failed to load character data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  const characterData: CharacterData = useMemo(() => data.characterStatesData[0] || {}, [data.characterStatesData]);
  const getAttributeNames = () => {
    const firstCharacter = Object.values(characterData)[0];
    return firstCharacter ? Object.keys(firstCharacter) : [];
  };
  const characterNames = Object.keys(characterData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(['追蹤者', '女爵', '送葬者']);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(getCurrentTheme());
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const checkTheme = () => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        setChartKey(prev => prev + 1);
      }
    };

    checkTheme();

    const handleStorageChange = () => {
      setTimeout(checkTheme, 50);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      checkTheme();
    };

    const handleThemeChange = () => {
      setTimeout(checkTheme, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [currentTheme]);

  // 處理窗口大小變化和拖拽導致的圖表刷新問題
  useEffect(() => {
    const throttledChartRefresh = throttle(() => {
      setChartKey(prev => prev + 1);
    }, 300); // 300ms節流延遲

    const handleResize = () => {
      throttledChartRefresh();
    };

    const handleDragEnd = () => {
      setTimeout(throttledChartRefresh, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  useEffect(() => {
    const adjustRadarHeight = () => {
      const tableContainer = document.querySelector('.character-attributes-table')?.closest('div');
      const radarContainer = document.getElementById('radar-chart-container');

      if (tableContainer && radarContainer) {
        const tableHeight = tableContainer.getBoundingClientRect().height;
        const targetHeight = Math.max(tableHeight, 350);
        radarContainer.style.height = `${targetHeight}px`;
      }
    };

    const throttledAdjustHeight = throttle(adjustRadarHeight, 200);
    adjustRadarHeight();

    const timer = setTimeout(throttledAdjustHeight, 100);

    window.addEventListener('resize', throttledAdjustHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', throttledAdjustHeight);
    };
  }, [selectedRowKeys]);

  // 表格列定義
  const columns: ColumnsType<{ key: string; character: string;[key: string]: string }> = [
    {
      title: '角色',
      dataIndex: 'character',
      key: 'character',
      width: 60,
      fixed: 'left',
      align: 'center' as const,
      render: (text: string) => (
        <Text style={{ color: 'var(--color-text-1)' }}>
          {text}
        </Text>
      ),
    },
    // 動態生成屬性列（排除"擅長武器"）
    ...getAttributeNames()
      .filter(attribute => attribute !== '擅長武器')
      .map(attribute => ({
        title: attribute,
        dataIndex: attribute,
        key: attribute,
        width: 46,
        align: 'center' as const,
        render: (value: string) => {
          // 根據等級獲取對應的樣式類
          const getValueClass = (value: string) => {
            switch (value) {
              case 'S': return 'character-attribute-value s-rank';
              case 'A': return 'character-attribute-value a-rank';
              case 'B': return 'character-attribute-value b-rank';
              case 'C': return 'character-attribute-value c-rank';
              case 'D': return 'character-attribute-value d-rank';
              default: return 'character-attribute-value default';
            }
          };

          return (
            <Text className={getValueClass(value)} strong>
              {value}
            </Text>
          );
        },
      })),
  ];

  // 生成表格數據
  const generateTableData = () => {
    const attributeNames = getAttributeNames();
    const tableAttributes = attributeNames.filter(attribute => attribute !== '擅長武器');

    return characterNames.map(characterName => {
      const rowData: { key: string; character: string;[key: string]: string } = {
        key: characterName,
        character: characterName,
      };

      tableAttributes.forEach(attribute => {
        rowData[attribute] = characterData[characterName]?.[attribute] || '-';
      });

      return rowData;
    });
  };

  // 將字母等級轉換為數值（用於雷達圖）
  const gradeToPosition = (grade: string) => {
    const levelMap: { [key: string]: number } = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    return levelMap[grade] || 0;
  };

  // 處理雷達圖數據（使用useMemo避免不必要的重計算）
  const radarData = useMemo(() => {
    const result: Array<{ item: string; type: string; score: number; level: string; value: string }> = [];
    const firstCharacter = Object.values(characterData)[0];
    const attributes = firstCharacter ? Object.keys(firstCharacter) : [];

    // 過濾掉"擅長武器"屬性，只保留需要在雷達圖上展示的屬性
    const radarAttributes = attributes.filter(attr =>
      attr !== '擅長武器' &&
      ['生命', '專注', '耐力', '力量', '靈巧', '智力', '信仰', '感應'].includes(attr)
    );

    // 只顯示選中的角色
    const charactersToShow = selectedRowKeys.map(key => key.toString());

    // 為每個角色的每個屬性創建雷達圖數據點
    charactersToShow.forEach(character => {
      if (characterData[character]) {
        radarAttributes.forEach(attr => {
          const level = characterData[character][attr];
          result.push({
            item: attr,
            type: character,
            score: gradeToPosition(level), // 使用數值繪製圖形
            level: level, // 保存等級標籤用於顯示
            value: level // 備用字段名
          });
        });
      }
    });

    return result;
  }, [characterData, selectedRowKeys]);

  // 獲取雷達圖屬性列表（用於空狀態顯示）
  const radarAttributes = useMemo(() => {
    const attributes = getAttributeNames();
    return attributes.filter(attr =>
      attr !== '擅長武器' &&
      ['生命', '專注', '耐力', '力量', '靈巧', '智力', '信仰', '感應'].includes(attr)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterData]);

  // 隱士出招表列定義
  const magicMoveColumns = [
    { title: '屬性痕', dataIndex: '屬性痕', key: 'attributeMark', width: '12%', align: 'center' as const },
    { title: '屬性圖標', dataIndex: '屬性圖標', key: 'attributeIcon', width: '12%', align: 'center' as const },
    { title: '混合魔法', dataIndex: '混合魔法', key: 'mixedMagic', width: '12%', align: 'center' as const },
    { title: '總傷害', dataIndex: '總傷害', key: 'totalDamage', width: '9%', align: 'center' as const },
    { title: '持續時間', dataIndex: '持續時間', key: 'duration', width: '9%', align: 'center' as const },
    {
      title: '混合魔法效果',
      dataIndex: '混合魔法效果',
      key: 'mixedMagicEffect',
      ellipsis: false,
      align: 'left' as const,
      render: (text: string) => (
        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', textAlign: 'left', lineHeight: '1.5', padding: '4px 0' }}>
          {text}
        </div>
      ),
    },
  ];

  // 行選擇配置
  const rowSelection: TableProps<{ key: string; character: string;[key: string]: string }>['rowSelection'] = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      // 限制最多選擇8個角色
      if (newSelectedRowKeys.length <= 8) {
        setSelectedRowKeys(newSelectedRowKeys);
      }
    },
    getCheckboxProps: (record: { key: string; character: string;[key: string]: string }) => ({
      name: record.character,
    }),
  };

  return (
    <div className="character-data-container">
      <div className="content-wrapper card-item" id="character-attributes">
        <div className="card-header">
          <Title level={5} className="character-card-title">
            基礎屬性
          </Title>
        </div>
        <div className="card-body">
          <div className="attributes-and-radar" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {/* 角色屬性表格 */}
            <div className="character-attributes-table-container">
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={generateTableData()}
                rowKey="key"
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 'max-content' }}
                className="character-attributes-table"
                // style={{ height: '350px' }}
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                footer={characterAttributesFooter}
              />
            </div>

            {/* 雷達圖容器 - 動態高度響應拖拽和窗口變化 */}
            <div
              className="radar-chart-container"
              id="radar-chart-container"
            >
              {selectedRowKeys.length > 0 ? (
                <Radar
                  key={`radar-main-${chartKey}`}
                  data={radarData}
                  xField="item"       // 用於X軸（雷達圖的各個頂點）的字段
                  yField="score"      // 用於Y軸（數值）的字段
                  colorField="type"   // 用於區分不同角色的字段
                  height={380}        // 雷達圖高度
                  autoFit={true}      // 自適應容器大小
                  theme={currentTheme}        // 根據當前主題動態設置

                  // 座標軸配置
                  axis={{
                    x: {
                      grid: true,
                      gridLineWidth: 1,
                      tick: false,
                      gridLineDash: [0, 0],
                    },
                    y: {
                      zIndex: 1,
                      title: false,
                      gridLineWidth: 1,
                      gridLineDash: [0, 0],
                      gridAreaFill: (_: unknown, index: number) => {
                        return index % 2 === 1 ? 'rgba(0, 0, 0, 0.04)' : '';
                      },
                      labelFormatter: (value: number) => {
                        const levelMap: Record<number, string> = { 1: 'D', 2: 'C', 3: 'B', 4: 'A', 5: 'S' };
                        return levelMap[value] || '';
                      },

                    },
                  }}

                  // 數據點配置
                  point={{
                    size: 4,
                  }}

                  // 刻度配置 - 恢復輔助線
                  scale={{
                    x: { padding: 50, align: 0 },
                    y: {
                      tickCount: 5,
                      domainMin: 0,
                      domainMax: 5
                    }
                  }}

                  // 線條樣式
                  style={{
                    lineWidth: 2,
                  }}

                  // 提示框配置
                  tooltip={{
                    items: [
                      {
                        channel: 'y',
                        valueFormatter: (value: number) => {
                          const levelMap: Record<number, string> = { 1: 'D', 2: 'C', 3: 'B', 4: 'A', 5: 'S' };
                          return levelMap[value] || value.toString();
                        }
                      }
                    ]
                  }}

                  // 填充區域樣式
                  area={{
                    style: {
                      fillOpacity: 0.1,      // 填充透明度
                    },
                  }}

                  // 線樣式
                  line={{
                    style: {
                      lineWidth: 2,
                    },
                  }}
                />
              ) : (
                // 空狀態顯示
                <div
                  className="radar-wrapper"
                  style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Radar
                    key={`radar-empty-${chartKey}`}
                    data={radarAttributes.map(attr => ({
                      item: attr,
                      type: '',
                      score: 0
                    }))}
                    xField="item"
                    yField="score"
                    colorField="type"
                    height={350}
                    theme={currentTheme}        // 根據當前主題動態設置
                    axis={{
                      x: {
                        grid: true,
                        gridLineWidth: 1,
                        tick: false,
                        gridLineDash: [0, 0],
                      },
                      y: {
                        zIndex: 1,
                        title: false,
                        gridLineWidth: 1,
                        gridLineDash: [0, 0],
                        tick: {
                          formatter: (value: number) => {
                            const levelMap: { [key: number]: string } = { 1: 'D', 2: 'C', 3: 'B', 4: 'A', 5: 'S' };
                            return levelMap[value] || '';
                          }
                        },
                      },
                    }}
                    scale={{
                      x: { padding: 0.5, align: 0 },
                      y: {
                        tickCount: 5,
                        domainMin: 0,
                        domainMax: 5
                      }
                    }}
                    // 隱藏圖例和數據點
                    legend={false}
                    point={{ size: 0 }}
                    line={{ style: { lineWidth: 0 } }}
                    area={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 角色詳細數據 */}
      <div className="content-wrapper card-item" id="character-detail-data">
        <div className="card-header">
          <Title level={5} className="character-card-title">
            角色詳細數據
          </Title>
        </div>
        <div className="card-body">
          <Title level={5} style={{ margin: '12px 0 8px', color: 'var(--color-text-1)' }}>
            同等級角色屬性對比
          </Title>
          {/* 角色詳細數據標籤頁 */}
          <Tabs
            type="card"
            items={jsonTabs.map((tab) => ({
              key: tab.name,
              label: tab.name,
              children: (
                <Table
                  dataSource={tab.data}
                  columns={tab.columns}
                  rowKey="character"
                  pagination={false}
                  size="small"
                  bordered
                  scroll={{ x: 'max-content' }}
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                  footer={bottomTablesFooter}
                />
              ),
            }))}
          />
          <Divider />
          {jsonTabs.length > 0 && (
            <>
              <Title level={5} style={{ marginBottom: 8, color: 'var(--color-text-1)' }}>
                血量、專注、耐力具體數值
              </Title>
              {/* HP/FP/ST 數據表格（通過 Tabs 切換） */}
              <Tabs
                type="card"
                items={[
                  {
                    key: 'hp',
                    label: '❤️ 血量值成長',
                    children: (
                      <Table
                        dataSource={hpData}
                        rowKey="character"
                        rowClassName={(_record, index) =>
                          index !== undefined && index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        }
                        columns={[
                          {
                            title: '等級',
                            dataIndex: 'character',
                            key: 'character',
                            width: 100,
                            fixed: 'left',
                            align: 'center' as const,
                            render: (text: string) => (
                              <span style={{
                                fontWeight: 'bold',
                                color: 'var(--color-text-1)',
                                fontSize: '13px'
                              }}>
                                {text}
                              </span>
                            )
                          },
                          ...Array.from({ length: 15 }, (_, i) => ({
                            title: <span style={{ fontWeight: 'bold', color: 'var(--color-primary-500)' }}>{`Lv${i + 1}`}</span>,
                            dataIndex: `Lv${i + 1}`,
                            key: `Lv${i + 1}`,
                            width: 60,
                            align: 'center' as const,
                            render: (value: string | number | undefined) => (
                              <span style={{
                                fontWeight: '500',
                                color: value ? 'var(--color-text-1)' : 'var(--color-text-3)',
                                fontSize: '13px'
                              }}>
                                {value || '-'}
                              </span>
                            )
                          }))
                        ]}
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{ x: 'max-content' }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                        footer={topTablesFooter}
                      />
                    )
                  },
                  {
                    key: 'fp',
                    label: '💙 專注值成長',
                    children: (
                      <Table
                        dataSource={fpData}
                        rowKey="character"
                        rowClassName={(_record, index) =>
                          index !== undefined && index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        }
                        columns={[
                          {
                            title: '等級',
                            dataIndex: 'character',
                            key: 'character',
                            width: 100,
                            fixed: 'left',
                            align: 'center' as const,
                            render: (text: string) => (
                              <span style={{
                                fontWeight: 'bold',
                                color: 'var(--color-text-1)',
                                fontSize: '13px'
                              }}>
                                {text}
                              </span>
                            )
                          },
                          ...Array.from({ length: 15 }, (_, i) => ({
                            title: <span style={{ fontWeight: 'bold', color: 'var(--color-primary-500)' }}>{`Lv${i + 1}`}</span>,
                            dataIndex: `Lv${i + 1}`,
                            key: `Lv${i + 1}`,
                            width: 60,
                            align: 'center' as const,
                            render: (value: string | number | undefined) => (
                              <span style={{
                                fontWeight: '500',
                                color: value ? 'var(--color-text-1)' : 'var(--color-text-3)',
                                fontSize: '13px'
                              }}>
                                {value || '-'}
                              </span>
                            )
                          }))
                        ]}
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{ x: 'max-content' }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                        footer={topTablesFooter}
                      />
                    )
                  },
                  {
                    key: 'st',
                    label: '💚 耐力值成長',
                    children: (
                      <Table
                        dataSource={stData}
                        rowKey="character"
                        rowClassName={(_record, index) =>
                          index !== undefined && index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        }
                        columns={[
                          {
                            title: '等級',
                            dataIndex: 'character',
                            key: 'character',
                            width: 100,
                            fixed: 'left',
                            align: 'center' as const,
                            render: (text: string) => (
                              <span style={{
                                fontWeight: 'bold',
                                color: 'var(--color-text-1)',
                                fontSize: '13px'
                              }}>
                                {text}
                              </span>
                            )
                          },
                          ...Array.from({ length: 15 }, (_, i) => ({
                            title: <span style={{ fontWeight: 'bold', color: 'var(--color-primary-500)' }}>{`Lv${i + 1}`}</span>,
                            dataIndex: `Lv${i + 1}`,
                            key: `Lv${i + 1}`,
                            width: 60,
                            align: 'center' as const,
                            render: (value: string | number | undefined) => (
                              <span style={{
                                fontWeight: '500',
                                color: value ? 'var(--color-text-1)' : 'var(--color-text-3)',
                                fontSize: '13px'
                              }}>
                                {value || '-'}
                              </span>
                            )
                          }))
                        ]}
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{ x: 'max-content' }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                        footer={topTablesFooter}
                      />
                    )
                  }
                ]}
                style={{ marginBottom: 30 }}
              />
            </>
          )}
        </div>
      </div>


      {/* 閃避無敵幀對比 */}
      <div id="dodge-frames">
        <DodgeFramesComparison />
      </div>

      {/* 隱士出招表 */}
      <div className="content-wrapper card-item" id="hermit-magic-list">
        <div className="card-header">
          <Title level={5} className="character-card-title">
            <ThunderboltTwoTone />
            隱士出招表
            <DataSourceTooltip
              links={[
                {
                  text: "1. 混合魔法太複雜？沒關係我來講清楚！",
                  url: "https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?link_id=758970790a0a"
                },
                {
                  text: "2. 黑夜君臨 v1.01數據彙總-技藝、絕招數據",
                  url: "https://tieba.baidu.com/p/9906444262?pid=152430482433&cid=#152430482433"
                }
              ]}
            />
          </Title>
        </div>
        <div className="card-body">
          <Table
            dataSource={magicMoves}
            columns={magicMoveColumns}
            pagination={false}
            size="small"
            bordered
            rowKey={(record) => (record as MagicMove).attributeMark || (record as MagicMove)['屬性痕'] || ''}
            scroll={{ x: '100%' }}
            style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            footer={() => (
              <div className="footer-text">備註：總傷害為角色 15 級時測試數據</div>
            )}
          />
        </div>
      </div>


      {/* ----------------- */}
    </div>
  );
};

export default CharacterDataView;

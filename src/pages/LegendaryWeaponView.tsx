import React, { useState, useEffect } from 'react';
import { Table, Steps } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import DataManager from '../utils/dataManager';

type OnChange = NonNullable<TableProps<TransformedWeaponEffect>['onChange']>;
type Filters = Parameters<OnChange>[1];

// 傳說武器數據結構
interface WeaponCharacter {
  [weaponName: string]: {
    [characterName: string]: number;
  };
}

// 武器特效數據結構
interface WeaponEffect {
  [weaponName: string]: {
    類型: string;
    特效: string;
    描述: string;
    削韌: string;
  };
}

// 數據接口
interface DataState {
  weaponCharacterData: TransformedWeaponCharacter[];
  weaponEffectData: TransformedWeaponEffect[];
  loading: boolean;
}

// 轉換後的數據結構
interface TransformedWeaponEffect {
  weapon_id: string;
  weapon_name: string;
  類型: string;
  特效: string;
  描述: string;
  削韌: string;
}

interface TransformedWeaponCharacter {
  weapon_id: string;
  weapon_name: string;
  [characterName: string]: string | number;
}

const characterNames = ['追蹤者', '守護者', '鐵之眼', '女爵', '無賴', '復仇者', '隱士', '執行者'];

const transformData = (rawData: WeaponCharacter[]) => {
  const weapons = rawData[0];
  return Object.entries(weapons).map(([weaponName, characterData], index) => ({
    weapon_id: `LW${String(index + 1).padStart(3, '0')}`,
    weapon_name: weaponName,
    ...characterData
  }));
};

const transformEffectData = (rawData: WeaponEffect[]) => {
  const weapons = rawData[0];
  return Object.entries(weapons).map(([weaponName, effectData], index) => ({
    weapon_id: `LW${String(index + 1).padStart(3, '0')}`,
    weapon_name: weaponName,
    ...effectData
  }));
};

// 根據行內數值範圍獲取對應的背景顏色
const getBackgroundColor = (value: number, rowValues: number[]): string => {
  const max = Math.max(...rowValues);
  const min = Math.min(...rowValues);
  const range = max - min;

  if (range === 0) return 'var(--color-primary-300)';

  const normalizedValue = (value - min) / range;
  const isDarkMode = document.body.getAttribute('tomato-theme') === 'dark';

  // 淺色模式（帶透明度）
  if (!isDarkMode) {
    if (normalizedValue < 0.25) return 'rgba(237, 242, 255, 0.3)';
    if (normalizedValue < 0.5) return 'rgba(224, 232, 255, 0.5)';
    if (normalizedValue < 0.8) return 'rgba(191, 207, 255, 0.7)';
    return 'rgba(147, 167, 255, 0.9)';
  }

  // 深色模式
  if (normalizedValue < 0.25) return 'rgba(47, 84, 235, 0.1)';
  if (normalizedValue < 0.5) return 'rgba(47, 84, 235, 0.2)';
  if (normalizedValue < 0.8) return 'rgba(47, 84, 235, 0.3)';
  return 'rgba(47, 84, 235, 0.4)';
};

const ColorLegend = () => {
  const isDarkMode = document.body.getAttribute('tomato-theme') === 'dark';
  const legendItems = [
    { range: '低', threshold: 0.25, valueRange: '0 ~ 25%' },
    { range: '較低', threshold: 0.5, valueRange: '25% ~ 50%' },
    { range: '較高', threshold: 0.8, valueRange: '50% ~ 80%' },
    { range: '高', threshold: 1.0, valueRange: '80% ~ 100%' }
  ];

  return (
    <div className="color-legend-container" style={{
      marginBottom: '12px',
      padding: '12px 16px',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      borderRadius: '6px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>顏色映射：</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {legendItems.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  backgroundColor: getBackgroundColor(
                    item.threshold,
                    [0, 1] // 用0和1模擬範圍以便獲取對應顏色
                  )
                }}
              />
              <span style={{ fontSize: '12px', display: 'flex', gap: '4px' }}>
                <span>{item.range}</span>
                <span style={{ color: 'var(--text-secondary)' }}>（{item.valueRange}）</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: '8px',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        映射原理：按行計算（當前值 - 最小值）/（最大值 - 最小值)，將結果歸一化為0-100%範圍，數值越高顏色越深。
      </div>
    </div>
  );
};

interface LegendaryWeaponViewProps {
  activeStep?: number;
}

const LegendaryWeaponView: React.FC<LegendaryWeaponViewProps> = ({ activeStep }) => {
  const [currentStep, setCurrentStep] = React.useState(activeStep || 0);
  const [filteredInfo, setFilteredInfo] = useState<Filters>({});
  const [dataState, setDataState] = useState<DataState>({
    weaponCharacterData: [],
    weaponEffectData: [],
    loading: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataManager = DataManager.getInstance();
        await dataManager.waitForData();

        setDataState({
          weaponCharacterData: transformData(dataManager.getWeaponCharacter()),
          weaponEffectData: transformEffectData(dataManager.getWeaponEffect()),
          loading: false,
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        setDataState({
          weaponCharacterData: [],
          weaponEffectData: [],
          loading: false,
        });
      }
    };

    loadData();
  }, []);

  // 監聽外部Step切換
  useEffect(() => {
    if (typeof activeStep === 'number') {
      setCurrentStep(activeStep);
    }
  }, [activeStep]);

  const { weaponCharacterData, weaponEffectData, loading } = dataState;

  // 表格變化處理函數
  const handleTableChange: OnChange = (_pagination, filters) => {
    setFilteredInfo(filters);
  };

  // 表格列定義
  const columns: TableColumnsType<TransformedWeaponCharacter> = [
    {
      title: '武器名稱',
      dataIndex: 'weapon_name',
      key: 'weapon_name',
      width: 110,
      fixed: 'left',
      render: (text) => <span className="legendary-weapon-text-center">{text}</span>,
    },
    ...characterNames.map(characterName => ({
      title: characterName,
      dataIndex: characterName,
      key: characterName,
      width: 70,
      align: 'center' as const,
      render: (value: number, record: TransformedWeaponCharacter) => {
        const rowValues = characterNames.map(name => record[name] as number);
        return (
          <div
            className="heatmap-cell legendary-weapon-heatmap-cell"
            style={{
              backgroundColor: getBackgroundColor(value, rowValues),
              width: '90%',
              height: '80%',
              margin: '0 auto',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px'
            }}
          >
            {value}
          </div>
        );
      },
    }))
  ];

  // 武器特效表格列定義
  const effectColumns: TableColumnsType<TransformedWeaponEffect> = [
    {
      title: '武器名稱',
      dataIndex: 'weapon_name',
      key: 'weapon_name',
      width: 120,
      align: 'center' as const,
      render: (text) => <span className="legendary-weapon-text-center">{text}</span>,
    },
    {
      title: '類型',
      dataIndex: '類型',
      key: '類型',
      width: 80,
      align: 'center' as const,
      filters: [
        { text: '直劍', value: '直劍' },
        { text: '大劍', value: '大劍' },
        { text: '特大劍', value: '特大劍' },
        { text: '重刺劍', value: '重刺劍' },
        { text: '大麴劍', value: '大麴劍' },
        { text: '刀', value: '刀' },
        { text: '大斧', value: '大斧' },
        { text: '槌', value: '槌' },
        { text: '大槌', value: '大槌' },
        { text: '連枷', value: '連枷' },
        { text: '矛', value: '矛' },
        { text: '大矛', value: '大矛' },
        { text: '鞭子', value: '鞭子' },
        { text: '拳頭', value: '拳頭' },
        { text: '特大武器', value: '特大武器' },
        { text: '法杖', value: '法杖' },
        { text: '大弓', value: '大弓' },
      ],
      filteredValue: filteredInfo.類型 || null,
      onFilter: (value, record) => record.類型 === value,
    },
    {
      title: '特效',
      dataIndex: '特效',
      key: '特效',
      width: 120,
      align: 'center' as const,
    },
    {
      title: '描述',
      dataIndex: '描述',
      key: '描述',
      width: 300,
    },
    {
      title: '削韌',
      dataIndex: '削韌',
      key: '削韌',
      width: 150,
      align: 'center' as const,
    }
  ];

  // 第一個表格內容（包含顏色圖例）
  const firstTable = (
    <div className="legendary-weapon-table-container">
      <ColorLegend />
      <Table
        className="heatmap-table"
        columns={columns}
        dataSource={weaponCharacterData}
        rowKey="weapon_id"
        pagination={false}
        size="small"
      />
    </div>
  );

  // 第二個表格內容
  const secondTable = (
    <div className="legendary-weapon-table-container">
      <Table
        columns={effectColumns}
        dataSource={weaponEffectData}
        rowKey="weapon_id"
        onChange={handleTableChange}
        pagination={false}
        size="small"
        bordered
        rowClassName={(_record, index) =>
          index !== undefined && index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
        }
      />
    </div>
  );

  // 自定義步驟條
  const customSteps = (
    <div className="custom-steps-container legendary-weapon-steps-container">
      <Steps
        size="small"
        current={currentStep}
        onChange={(current) => {
          if (typeof current === 'number') {
            setCurrentStep(current);
          }
        }}
        items={[
          { title: '全角色傳說武器面板' },
          { title: '傳說武器庇佑效果' }
        ]}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="legendary-weapon-container" style={{ padding: '16px', textAlign: 'center' }}>
        <div>加載中...</div>
      </div>
    );
  }

  return (
    <div className="steps-container">
      <div className="legendary-weapon-container" style={{ padding: '16px' }}>
        {customSteps}
        <div className="legendary-weapon-content">
          {currentStep === 0 && <div id="weapon-strength-panel">{firstTable}</div>}
          {currentStep === 1 && <div id="weapon-blessing-effects">{secondTable}</div>}
        </div>
      </div>
    </div>
  );
};

export default LegendaryWeaponView;

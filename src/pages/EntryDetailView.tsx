import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Select, message, Tabs, Tag, Spin, Button } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import type { EntryData } from '../types';
import { typeColorMap } from '../types';
import DataManager from '../utils/dataManager';
import type { EnhancementCategory, ItemEffect } from '../utils/dataManager';
import { debounce } from 'lodash';
import { SearchOutlined } from '@ant-design/icons';

// 自定義搜索組件接口
interface CustomSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  allowClear?: boolean;
}

// 自定義搜索組件
const CustomSearch: React.FC<CustomSearchProps> = ({
  placeholder,
  value,
  onChange,
  onSearch,
  className = '',
  allowClear = true
}) => {
  const [inputValue, setInputValue] = useState(value);

  // 防抖處理搜索
  const debouncedSearch = useMemo(
    () => debounce((searchValue: string) => {
      onChange(searchValue);
      onSearch?.(searchValue);
    }, 300),
    [onChange, onSearch]
  );

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  // 處理回車搜索
  const handlePressEnter = () => {
    onChange(inputValue);
    onSearch?.(inputValue);
  };

  // 處理清除
  const handleClear = () => {
    setInputValue('');
    onChange('');
    onSearch?.('');
  };

  // 同步外部value變化
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`custom-search-wrapper ${className}`}>
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={handlePressEnter}
        allowClear={allowClear}
        onClear={handleClear}
        style={{ width: 200 }}
      />
    </div>
  );
};

// 自定義分頁組件接口
interface CustomPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

// 自定義分頁組件
const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  loading = false
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading || totalItems === 0) {
    return null;
  }

  return (
    <div className="custom-pagination-row" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '15px',
      padding: '0 16px'
    }}>
      {/* 左側：每頁顯示選擇器 */}
      <div className="page-size-controls" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          color: 'var(--theme-text-secondary)',
          fontSize: '14px'
        }}>
          每頁顯示
        </span>
        <Select
          value={pageSize.toString()}
          onChange={(value) => {
            onPageSizeChange(Number(value));
            onPageChange(1);
          }}
          options={[
            { value: '15', label: '15 條' },
            { value: '20', label: '20 條' },
            { value: '30', label: '30 條' },
            { value: '50', label: '50 條' },
            { value: '80', label: '80 條' },
            { value: '100', label: '100 條' },
          ]}
          size="small"
          style={{ width: '100px' }}
        />
        <span style={{
          color: 'var(--theme-text-secondary)',
          fontSize: '14px'
        }}>
          共 {totalItems} 條記錄
        </span>
      </div>

      {/* 右側：分頁按鈕 */}
      <div className="page-nav-controls" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          size="middle"
        >
          上一頁
        </Button>

        <span style={{
          margin: '0 15px',
          color: 'var(--theme-text-secondary)',
          fontSize: '14px'
        }}>
          第 {currentPage} 頁，共 {totalPages} 頁
        </span>

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          size="middle"
        >
          下一頁
        </Button>
      </div>
    </div>
  );
};

// 擴展的強化類別接口，用於表格顯示
interface EnhancedEnhancementCategory extends EnhancementCategory {
  skillType?: string;
  skills?: string[];
}

type OnChange = NonNullable<TableProps<EntryData>['onChange']>;
type Filters = Parameters<OnChange>[1];
type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

// 數據接口
interface DataState {
  outsiderEntries: EntryData[];
  talismanEntries: EntryData[];
  inGameEntries: EntryData[];
  enhancementCategories: EnhancementCategory[];
  itemEffects: ItemEffect[];
  deepNightEntries: EntryData[];
  inGameDeepNightEntries: EntryData[];
  loading: boolean;
}

const outsiderTypeOptions = [
  { value: '能力', label: '能力' },
  { value: '攻擊力', label: '攻擊力' },
  { value: '技藝/絕招', label: '技藝/絕招' },
  { value: '魔法/禱告', label: '魔法/禱告' },
  { value: '減傷率', label: '減傷率' },
  { value: '對異常狀態的抵抗力', label: '對異常狀態的抵抗力' },
  { value: '恢復', label: '恢復' },
  { value: '行動', label: '行動' },
  { value: '隊伍成員', label: '隊伍成員' },
  { value: '僅限特定角色', label: '僅限特定角色' },
  { value: '僅限特定武器', label: '僅限特定武器' },
  { value: '出擊時的武器（戰技）', label: '出擊時的武器（戰技）' },
  { value: '出擊時的武器（魔法）', label: '出擊時的武器（魔法）' },
  { value: '出擊時的武器（禱告）', label: '出擊時的武器（禱告）' },
  { value: '出擊時的武器（附加）', label: '出擊時的武器（附加）' },
  { value: '出擊時的道具', label: '出擊時的道具' },
  { value: '場地環境', label: '場地環境' },
  { value: '專屬遺物', label: '專屬遺物' }
];

// 深夜模式局外詞條類型選項
const deepNightTypeOptions = [
  { value: '攻擊力', label: '攻擊力' },
  { value: '減傷率', label: '減傷率' },
  { value: '對異常狀態的抵抗力', label: '對異常狀態的抵抗力' },
  { value: '恢復', label: '恢復' },
  { value: '技藝/絕招', label: '技藝/絕招' },
  { value: '能力值', label: '能力值' },
  { value: '行動', label: '行動' },
  { value: '僅限特定角色', label: '僅限特定角色' },
  { value: '出擊時的道具(結晶露滴)', label: '出擊時的道具(結晶露滴)' },
  { value: '出擊時的道具', label: '出擊時的道具' },
  { value: '僅限特定武器', label: '僅限特定武器' },
  { value: '減益(減傷率)', label: '減益(減傷率)' },
  { value: '減益(能力值)', label: '減益(能力值)' },
  { value: '減益(行動)', label: '減益(行動)' },
];

const characterOptions = [
  { value: '追蹤者', label: '追蹤者' },
  { value: '守護者', label: '守護者' },
  { value: '女爵', label: '女爵' },
  { value: '執行者', label: '執行者' },
  { value: '鐵之眼', label: '鐵之眼' },
  { value: '復仇者', label: '復仇者' },
  { value: '隱士', label: '隱士' },
  { value: '無賴', label: '無賴' },
  { value: '學者', label: '學者' },
  { value: '送葬者', label: '送葬者' }
];

// 道具效果分類選項
const itemEffectTypeOptions = [
  { text: '聖盃瓶', value: '聖盃瓶' },
  { text: '採集', value: '採集' },
  { text: '道具', value: '道具' },
  { text: '苔藥', value: '苔藥' },
  { text: '露滴', value: '露滴' },
  { text: '壺', value: '壺' },
  { text: '飛刀', value: '飛刀' },
  { text: '石', value: '石' },
  { text: '香', value: '香' },
  { text: '油脂', value: '油脂' },
];



// 添加局內詞條類型選項
const inGameTypeOptions = [
  { value: '能力', label: '能力' },
  { value: '攻擊力', label: '攻擊力' },
  { value: '強化', label: '強化' },
  { value: '恢復', label: '恢復' },
  { value: '減傷率', label: '減傷率' },
  { value: '技藝/絕招', label: '技藝/絕招' },
  { value: '額外效果', label: '額外效果' },
  { value: '武器屬性', label: '武器屬性' },
  { value: '附加異常狀態', label: '附加異常狀態' },
  { value: '對異常狀態的抵抗力', label: '對異常狀態的抵抗力' },
  { value: '庇佑', label: '庇佑' },
  { value: '不甘', label: '不甘' },
];

// 深夜模式局內詞條類型選項
const inGameDeepNightTypeOptions = [
  { value: '能力值', label: '能力值' },
  { value: '攻擊力', label: '攻擊力' },
  { value: '減傷率', label: '減傷率' },
  { value: '恢復', label: '恢復' },
  { value: '減益(能力值)', label: '減益(能力值)' },
  { value: '減益(減傷率)', label: '減益(減傷率)' },
  { value: '減益(恢復)', label: '減益(恢復)' },
  { value: '減益(行動)', label: '減益(行動)' },
  { value: '特殊效果', label: '特殊效果' },
];

const tagRender = (props: { label: React.ReactNode; value: string; closable?: boolean; onClose?: () => void }) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const color = typeColorMap[value] || 'default';

  return (
    <Tag
      color={color}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};

const getTypeColor = (type: string | null | undefined): string => {
  if (!type) return 'default';
  return typeColorMap[type] || 'default';
};

const getSuperposabilityColor = (superposability: string | null | undefined): string => {
  if (!superposability) return 'default';

  switch (superposability) {
    case '可疊加':
      return 'green';
    case '不可疊加':
      return 'red';
    case '未知':
      return 'orange';
    case '不同級別可疊加':
      return 'purple';
    case '同種不甘不可疊加':
      return 'magenta';
    default:
      return 'blue';
  }
};

interface EntryDetailViewProps {
  activeSubTab?: string;
}

const EntryDetailView: React.FC<EntryDetailViewProps> = ({ activeSubTab }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedInGameTypes, setSelectedInGameTypes] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedItemEffectTypes, setSelectedItemEffectTypes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeEntryTab, setActiveEntryTab] = useState(activeSubTab || '局外詞條');
  const [filteredInfo, setFilteredInfo] = useState<Filters>({});
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});
  const [data, setData] = useState<DataState>({
    outsiderEntries: [],
    talismanEntries: [],
    inGameEntries: [],
    enhancementCategories: [],
    itemEffects: [],
    deepNightEntries: [],
    inGameDeepNightEntries: [],
    loading: true
  });



  // 監聽外部Tab切換
  useEffect(() => {
    if (activeSubTab && activeSubTab !== activeEntryTab) {
      setActiveEntryTab(activeSubTab);
    }
  }, [activeSubTab, activeEntryTab]);

  // 從DataManager獲取數據
  useEffect(() => {
    const loadData = async () => {
      try {
        const dataManager = DataManager.getInstance();
        await dataManager.waitForData();

        setData({
          outsiderEntries: dataManager.getOutsiderEntries(),
          talismanEntries: dataManager.getTalismanEntries(),
          inGameEntries: dataManager.getInGameEntries(),
          enhancementCategories: dataManager.getEnhancementCategories(),
          itemEffects: dataManager.getItemEffects(),
          deepNightEntries: dataManager.getDeepNightEntries(),
          inGameDeepNightEntries: dataManager.getInGameDeepNightEntries(),
          loading: false
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        message.error('數據加載失敗');
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  // 監聽篩選狀態變化，用於調試
  useEffect(() => {
    // console.log('FilteredInfo changed:', filteredInfo);
  }, [filteredInfo]);

  // 清除所有篩選和排序
  const clearAll = () => {
    setSearchKeyword('');
    setSelectedTypes([]);
    setSelectedInGameTypes([]);
    setSelectedCharacter('');
    setSelectedItemEffectTypes([]);
    setFilteredInfo({});
    setSortedInfo({});
    setCurrentPage(1);
    setPageSize(20);
    message.success('已清除所有篩選和排序');
  };

  // 表格變化處理函數
  const handleTableChange: OnChange = (_pagination, filters, sorter) => {
    // console.log('Table change - filters:', filters, 'sorter:', sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as Sorts);
  };

  // 強化類別表格變化處理函數
  const handleEnhancementTableChange: TableProps<EnhancementCategory>['onChange'] = (_pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as Sorts);
  };

  // 道具效果表格變化處理函數
  const handleItemEffectTableChange: TableProps<ItemEffect>['onChange'] = (_pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as Sorts);
  };

  // 搜索過濾函數
  const filterData = (data: EntryData[], searchValue: string, types?: string[], character?: string, inGameTypes?: string[], superposabilityFilters?: string[]) => {
    let filtered = data;

    // 類型篩選
    if (types && types.length > 0) {
      filtered = filtered.filter(item => types.includes(item.entry_type || ''));
    }

    // 局內詞條類型篩選
    if (inGameTypes && inGameTypes.length > 0) {
      filtered = filtered.filter(item => inGameTypes.includes(item.entry_type || ''));
    }

    // 角色篩選
    if (character && character.trim()) {
      filtered = filtered.filter(item =>
        item.entry_name?.includes(character) ||
        item.explanation?.includes(character)
      );
    }

    // 疊加性篩選
    if (superposabilityFilters && superposabilityFilters.length > 0) {
      // console.log('Applying superposability filter:', superposabilityFilters);
      // const beforeCount = filtered.length;
      filtered = filtered.filter(item => {
        const itemSuperposability = item.superposability || '';
        const isIncluded = superposabilityFilters.includes(itemSuperposability);
        if (!isIncluded) {
          // console.log(`Filtered out item "${item.entry_name}" with superposability "${itemSuperposability}"`);
        }
        return isIncluded;
      });
      // console.log(`Superposability filter: ${beforeCount} -> ${filtered.length} items`);
    }

    // 關鍵詞搜索
    if (!searchValue.trim()) return filtered;

    const searchTerms = searchValue.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    return filtered.filter(item => {
      // 搜索字段
      const searchableFields = [
        item.entry_name || '',
        item.explanation || '',
        item.entry_type || '',
        item.superposability || '',
        item.talisman || '',
        item.entry_id || ''
      ].map(field => String(field).toLowerCase());

      // 檢查所有搜索詞是否都在至少一個字段中出現
      return searchTerms.every(term =>
        searchableFields.some(field => field.includes(term))
      );
    });
  };

  // 道具效果搜索過濾函數
  const filterItemEffectData = (data: ItemEffect[], searchValue: string, types?: string[]) => {
    let filtered = data;

    // 分類篩選
    if (types && types.length > 0) {
      filtered = filtered.filter(item => types.includes(item.type));
    }

    // 關鍵詞搜索
    if (!searchValue.trim()) return filtered;

    const searchTerms = searchValue.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    return filtered.filter(item => {
      const searchableFields = [
        item.name || '',
        item.effect || '',
        item.type || '',
        item.singleGridQty?.toString() || ''
      ].map(field => String(field).toLowerCase());

      return searchTerms.every(term =>
        searchableFields.some(field => field.includes(term))
      );
    });
  };

  // 將強化類別數據轉換為支持rowSpan的格式
  const transformEnhancementData = (data: EnhancementCategory[]): EnhancedEnhancementCategory[] => {
    const transformedData: EnhancedEnhancementCategory[] = [];

    data.forEach(item => {
      Object.entries(item.applicable_scope).forEach(([skillType, skills]) => {
        transformedData.push({
          ...item,
          skillType,
          skills,
        });
      });
    });

    return transformedData;
  };

  // 局外詞條表格列定義
  const outsiderColumns: TableColumnsType<EntryData> = [
    {
      title: 'ID',
      dataIndex: 'entry_id',
      key: 'entry_id',
      width: '8%',
      align: 'center',
      onCell: () => ({
        style: { fontSize: '11px', color: 'var(--theme-text-secondary)' }
      }),
      sorter: (a, b) => {
        const idA = a.entry_id || '';
        const idB = b.entry_id || '';
        return idA.localeCompare(idB);
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_id' ? sortedInfo.order : null,
    },
    {
      title: '詞條名稱',
      dataIndex: 'entry_name',
      key: 'entry_name',
      width: '30%',
      sorter: (a, b) => {
        const nameA = a.entry_name || '';
        const nameB = b.entry_name || '';
        return nameA.localeCompare(nameB, 'zh-TW');
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_name' ? sortedInfo.order : null,
    },
    {
      title: '解釋',
      dataIndex: 'explanation',
      key: 'explanation',
      width: '40%',
      render: (text) => {
        if (!text) return '-';

        return (
          <div style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.6',
            fontSize: '13px'
          }}>
            {text}
          </div>
        );
      },
    },
    {
      title: '詞條類型',
      dataIndex: 'entry_type',
      key: 'entry_type',
      align: 'center',
      width: '12%',
      render: (text) => text ? (
        <Tag color={getTypeColor(text)}>{text}</Tag>
      ) : '-',
    },
    {
      title: '疊加性',
      dataIndex: 'superposability',
      key: 'superposability',
      width: '12%',
      align: 'center',
      render: (text) => text ? (
        <Tag color={getSuperposabilityColor(text)}>{text}</Tag>
      ) : '-',
      filters: [
        { text: '可疊加', value: '可疊加' },
        { text: '不可疊加', value: '不可疊加' },
        { text: '未知', value: '未知' },
      ],
      filteredValue: filteredInfo.superposability || null,
    },
  ];

  // 護符詞條表格列定義
  const talismanColumns: TableColumnsType<EntryData> = [
    {
      title: 'ID',
      dataIndex: 'entry_id',
      key: 'entry_id',
      width: '8%',
      align: 'center',
      onCell: () => ({
        style: { fontSize: '11px', color: 'var(--theme-text-secondary)' }
      }),
      sorter: (a, b) => {
        const idA = a.entry_id || '';
        const idB = b.entry_id || '';
        return idA.localeCompare(idB);
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_id' ? sortedInfo.order : null,
    },
    {
      title: '護符',
      dataIndex: 'talisman',
      key: 'talisman',
      width: '15%',
      render: (text) => text || '-',
    },
    {
      title: '詞條名稱',
      dataIndex: 'entry_name',
      key: 'entry_name',
      width: '30%',
      sorter: (a, b) => {
        const nameA = a.entry_name || '';
        const nameB = b.entry_name || '';
        return nameA.localeCompare(nameB, 'zh-TW');
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_name' ? sortedInfo.order : null,
    },
    {
      title: '解釋',
      dataIndex: 'explanation',
      key: 'explanation',
      width: '45%',
      render: (text) => {
        if (!text) return '-';

        return (
          <div style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.6',
            fontSize: '13px'
          }}>
            {text}
          </div>
        );
      },
    },
  ];

  // 局內詞條表格列定義
  const inGameColumns: TableColumnsType<EntryData> = [
    {
      title: 'ID',
      dataIndex: 'entry_id',
      key: 'entry_id',
      width: '8%',
      align: 'center',
      onCell: () => ({
        style: { fontSize: '11px', color: 'var(--theme-text-secondary)' }
      }),
      sorter: (a, b) => {
        const idA = a.entry_id || '';
        const idB = b.entry_id || '';
        return idA.localeCompare(idB);
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_id' ? sortedInfo.order : null,
    },
    {
      title: '詞條名稱',
      dataIndex: 'entry_name',
      key: 'entry_name',
      width: '20%',
      sorter: (a, b) => {
        const nameA = a.entry_name || '';
        const nameB = b.entry_name || '';
        return nameA.localeCompare(nameB, 'zh-TW');
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_name' ? sortedInfo.order : null,
    },
    {
      title: '解釋',
      dataIndex: 'explanation',
      key: 'explanation',
      width: '45%',
      render: (text) => {
        if (!text) return '-';

        return (
          <div style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.6',
            fontSize: '13px'
          }}>
            {text}
          </div>
        );
      },
      onCell: () => ({
        style: {
          padding: '12px 8px'
        }
      }),
    },
    {
      title: '詞條類型',
      dataIndex: 'entry_type',
      key: 'entry_type',
      align: 'center',
      width: '12%',
      render: (text) => text ? (
        <Tag color={getTypeColor(text)}>{text}</Tag>
      ) : '-',
    },
    {
      title: '疊加性',
      dataIndex: 'superposability',
      key: 'superposability',
      width: '12%',
      align: 'center',
      render: (text) => text ? (
        <Tag color={getSuperposabilityColor(text)}>{text}</Tag>
      ) : '-',
      filters: [
        { text: '可疊加', value: '可疊加' },
        { text: '不可疊加', value: '不可疊加' },
        { text: '未知', value: '未知' },
        { text: '不同級別可疊加', value: '不同級別可疊加' },
        { text: '同種不甘不可疊加', value: '同種不甘不可疊加' },
      ],
      filteredValue: filteredInfo.superposability || null,
    },
  ];

  // 深夜模式局外詞條表格列定義（複用局外詞條的列定義）
  const deepNightColumns: TableColumnsType<EntryData> = [
    {
      title: 'ID',
      dataIndex: 'entry_id',
      key: 'entry_id',
      width: '8%',
      align: 'center',
      onCell: () => ({
        style: { fontSize: '11px', color: 'var(--theme-text-secondary)' }
      }),
      sorter: (a, b) => {
        const idA = a.entry_id || '';
        const idB = b.entry_id || '';
        return idA.localeCompare(idB);
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_id' ? sortedInfo.order : null,
    },
    {
      title: '詞條名稱',
      dataIndex: 'entry_name',
      key: 'entry_name',
      width: '35%',
      sorter: (a, b) => {
        const nameA = a.entry_name || '';
        const nameB = b.entry_name || '';
        return nameA.localeCompare(nameB, 'zh-TW');
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'entry_name' ? sortedInfo.order : null,
    },
    {
      title: '解釋',
      dataIndex: 'explanation',
      key: 'explanation',
      width: '35%',
      render: (text) => {
        if (!text) return '-';

        return (
          <div style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.6',
            fontSize: '13px'
          }}>
            {text}
          </div>
        );
      },
      onCell: () => ({
        style: {
          padding: '12px 8px'
        }
      }),
    },
    {
      title: '詞條類型',
      dataIndex: 'entry_type',
      key: 'entry_type',
      align: 'center',
      width: '12%',
      render: (text) => text ? (
        <Tag color={getTypeColor(text)}>{text}</Tag>
      ) : '-',
    },
    {
      title: '疊加性',
      dataIndex: 'superposability',
      key: 'superposability',
      width: '12%',
      align: 'center',
      render: (text) => text ? (
        <Tag color={getSuperposabilityColor(text)}>{text}</Tag>
      ) : '-',
      filters: [
        { text: '可疊加', value: '可疊加' },
        { text: '不可疊加', value: '不可疊加' },
        { text: '未知', value: '未知' },
      ],
      filteredValue: filteredInfo.superposability || null,
    },
  ];


  // 道具效果表格列定義
  const itemEffectColumns: TableColumnsType<ItemEffect> = [
    {
      title: '名稱',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      align: 'center',
      sorter: (a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'zh-TW');
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
    },
    {
      title: '分類',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      align: 'center',
      render: (text) => text ? (
        <Tag color={getTypeColor(text)}>{text}</Tag>
      ) : '-',
      sorter: (a, b) => {
        const typeA = a.type || '';
        const typeB = b.type || '';
        return typeA.localeCompare(typeB, 'zh-TW');
      },
      sortDirections: ['ascend', 'descend'],
      sortOrder: sortedInfo.columnKey === 'type' ? sortedInfo.order : null,
    },
    {
      title: '單格數量',
      dataIndex: 'singleGridQty',
      key: 'singleGridQty',
      width: '8%',
      align: 'center',
      render: (text) => text || '-',
    },
    {
      title: '效果',
      dataIndex: 'effect',
      key: 'effect',
      width: '70%',
      render: (text) => text || '-',
    },
  ];



  // 創建強化類別表格列定義
  const createEnhancementColumns = (paginatedData: EnhancedEnhancementCategory[]): TableColumnsType<EnhancedEnhancementCategory> => {
    // 計算rowSpan信息
    const rowSpanInfo = new Map<string, { firstIndex: number; count: number }>();

    paginatedData.forEach((item, index) => {
      if (!rowSpanInfo.has(item.category)) {
        const categoryRows = paginatedData.filter(row => row.category === item.category);
        rowSpanInfo.set(item.category, {
          firstIndex: index,
          count: categoryRows.length
        });
      }
    });

    return [
      {
        title: '強化類別',
        dataIndex: 'category',
        key: 'category',
        width: '15%',
        align: 'center',
        onCell: (record: EnhancedEnhancementCategory, index?: number) => {
          const info = rowSpanInfo.get(record.category);
          if (info && index === info.firstIndex) {
            return { rowSpan: info.count };
          }
          return { rowSpan: 0 };
        },
      },
      {
        title: '技能類型',
        dataIndex: 'skillType',
        key: 'skillType',
        width: '10%',
        align: 'center',
        render: (_: unknown, record: EnhancedEnhancementCategory) => {
          if (!record.skillType) return '';

          const getSkillTypeColor = (skillType: string): string => {
            switch (skillType) {
              case '禱告':
                return 'cyan';
              case '戰灰':
                return 'green';
              case '武器':
                return 'red';
              case '魔法':
                return 'purple';
              case '技藝':
                return 'blue';
              case '道具':
                return 'orange';
              case '絕招':
                return 'magenta';
              default:
                return 'default';
            }
          };

          return (
            <Tag color={getSkillTypeColor(record.skillType)}>
              {record.skillType}
            </Tag>
          );
        },
      },
      {
        title: '技能列表',
        dataIndex: 'skills',
        key: 'skills',
        width: '45%',
        render: (_: unknown, record: EnhancedEnhancementCategory) => {
          return record.skills ? record.skills.join('、') : '';
        },
      },
      {
        title: '備註',
        dataIndex: 'notes',
        key: 'notes',
        width: '25%',
        render: (notes: string[]) => {
          return notes && notes.length > 0 ? notes.join('; ') : '-';
        },
        onCell: (record: EnhancedEnhancementCategory, index?: number) => {
          const info = rowSpanInfo.get(record.category);
          if (info && index === info.firstIndex) {
            return { rowSpan: info.count };
          }
          return { rowSpan: 0 };
        },
      },
    ];
  };

  // 渲染表格內容
  const renderTableContent = (tabKey: string) => {
    if (tabKey === '強化類別詞條適用範圍') {
      return renderEnhancementTable();
    }

    if (tabKey === '道具效果') {
      return renderItemEffectTable();
    }

    let tableData: EntryData[] = [];
    let columns: TableColumnsType<EntryData>;

    switch (tabKey) {
      case '局外詞條':
        tableData = data.outsiderEntries;
        columns = outsiderColumns;
        tableData = filterData(tableData, searchKeyword, selectedTypes, selectedCharacter, undefined, filteredInfo.superposability as string[]);
        break;
      case '深夜模式局外詞條':
        tableData = data.deepNightEntries;
        columns = deepNightColumns;
        tableData = filterData(tableData, searchKeyword, selectedTypes, selectedCharacter, undefined, filteredInfo.superposability as string[]);
        break;
      case '深夜模式局內詞條':
        tableData = data.inGameDeepNightEntries;
        columns = inGameColumns; // 複用局內詞條的列定義
        tableData = filterData(tableData, searchKeyword, selectedInGameTypes, undefined, undefined, filteredInfo.superposability as string[]);
        break;
      case '護符詞條':
        tableData = data.talismanEntries;
        columns = talismanColumns;
        tableData = filterData(tableData, searchKeyword);
        break;
      case '局內詞條':
        tableData = data.inGameEntries;
        columns = inGameColumns;
        tableData = filterData(tableData, searchKeyword, selectedInGameTypes, undefined, undefined, filteredInfo.superposability as string[]);
        break;
      default:
        tableData = data.outsiderEntries;
        columns = outsiderColumns;
        tableData = filterData(tableData, searchKeyword, selectedTypes, selectedCharacter, undefined, filteredInfo.superposability as string[]);
    }

    // 分頁處理
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = tableData.slice(startIndex, endIndex);

    // 表格樣式
    return (
      <div>
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="entry_id"
          onChange={handleTableChange}
          pagination={false}
          size="small"
          bordered
          loading={data.loading}
        />

        {/* 自定義分頁導航 */}
        {!data.loading && tableData.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={tableData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            loading={data.loading}
          />
        )}

      </div>
    );
  };

  // 渲染強化類別表格
  const renderEnhancementTable = () => {
    const transformedData = transformEnhancementData(data.enhancementCategories);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = transformedData.slice(startIndex, endIndex);

    return (
      <div>
        <Table<EnhancedEnhancementCategory>
          columns={createEnhancementColumns(paginatedData)}
          dataSource={paginatedData}
          rowKey={(record) => `${record.category}-${record.skillType}`}
          onChange={handleEnhancementTableChange}
          pagination={false}
          size="small"
          bordered
          loading={data.loading}
        />

        {/* 自定義分頁導航 */}
        {!data.loading && transformedData.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={transformedData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            loading={data.loading}
          />
        )}
      </div>
    );
  };

  // 渲染道具效果表格
  const renderItemEffectTable = () => {
    let tableData = data.itemEffects;

    // 為道具效果添加搜索過濾
    if (searchKeyword.trim()) {
      tableData = filterItemEffectData(tableData, searchKeyword, selectedItemEffectTypes);
    }

    // 為道具效果添加分類篩選
    if (selectedItemEffectTypes.length > 0) {
      tableData = filterItemEffectData(tableData, '', selectedItemEffectTypes); // 使用空字符串作為搜索關鍵詞，只進行分類篩選
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = tableData.slice(startIndex, endIndex);

    // 道具效果表格 footer
    const itemEffectFooter = () => (
      <div className="footer-text">
        表內所有攻擊力、異常值全部為固定值，不隨等級成長，不吃任何補正。
      </div>
    );

    return (
      <div>
        <Table<ItemEffect>
          columns={itemEffectColumns}
          dataSource={paginatedData}
          rowKey="name"
          onChange={handleItemEffectTableChange}
          pagination={false}
          size="small"
          bordered
          loading={data.loading}
          footer={itemEffectFooter}
        />

        {/* 自定義分頁導航 */}
        {!data.loading && tableData.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={tableData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            loading={data.loading}
          />
        )}
      </div>
    );
  };

  // 渲染搜索和篩選器的函數
  const renderSearchAndFilter = (tabKey: string) => {
    if (data.loading) {
      return (
        <div className="loading-container">
          <Spin spinning={true} />
        </div>
      );
    }

    if (tabKey === '強化類別詞條適用範圍') {
      return null;
    }

    if (tabKey === '道具效果') {
      return (
        <div className="filter-search-row">
          <div className="filter-search-content">
            {/* 左側：搜索、多選、清除 */}
            <div className="filter-controls">
              <CustomSearch
                placeholder={`搜索 ${tabKey} 關鍵字`}
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={(value) => {
                  setSearchKeyword(value);
                  setCurrentPage(1);
                }}
                className="custom-search-input"
                allowClear
              />
              <Select
                className="item-effect-type-select"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                placeholder="按分類篩選"
                value={selectedItemEffectTypes}
                onChange={(values) => {
                  setSelectedItemEffectTypes(values);
                  setCurrentPage(1);
                }}
                options={itemEffectTypeOptions}
                maxTagPlaceholder={omittedValues => `+${omittedValues.length}...`}
              />
              <Button onClick={clearAll} type="default" size="middle">
                清除所有
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (tabKey === '局外詞條') {
      return (
        <div className="filter-search-row">
          <div className="filter-search-content">
            {/* 左側：搜索、多選、單選、清除 */}
            <div className="filter-controls">
              <CustomSearch
                placeholder={`搜索 ${tabKey} 關鍵字`}
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={(value) => {
                  setSearchKeyword(value);
                  setCurrentPage(1);
                }}
                className="custom-search-input"
                allowClear
              />
              <Select
                className="outsider-type-select"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                placeholder="按詞條類型篩選"
                value={selectedTypes}
                onChange={(values) => {
                  setSelectedTypes(values);
                  setCurrentPage(1);
                }}
                options={outsiderTypeOptions}
                maxTagPlaceholder={omittedValues => `+${omittedValues.length}...`}
              />
              <Select
                className="character-select"
                allowClear
                placeholder="按角色篩選"
                value={selectedCharacter || undefined}
                onChange={(value) => {
                  setSelectedCharacter(value);
                  setCurrentPage(1);
                }}
                options={characterOptions}
                notFoundContent="暫無角色"
                showSearch={false}
              />
              <Button onClick={clearAll} type="default" size="middle">
                清除所有
              </Button>
            </div>


          </div>
        </div>
      );
    } else if (tabKey === '深夜模式局外詞條') {
      return (
        <div className="filter-search-row">
          <div className="filter-search-content">
            {/* 左側：搜索、多選、單選、清除 */}
            <div className="filter-controls">
              <CustomSearch
                placeholder={`搜索 ${tabKey} 關鍵字`}
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={(value) => {
                  setSearchKeyword(value);
                  setCurrentPage(1);
                }}
                className="custom-search-input"
                allowClear
              />
              <Select
                className="deep-night-type-select"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                placeholder="按詞條類型篩選"
                value={selectedTypes}
                onChange={(values) => {
                  setSelectedTypes(values);
                  setCurrentPage(1);
                }}
                options={deepNightTypeOptions}
                maxTagPlaceholder={omittedValues => `+${omittedValues.length}...`}
              />
              <Select
                className="character-select"
                allowClear
                placeholder="按角色篩選"
                value={selectedCharacter || undefined}
                onChange={(value) => {
                  setSelectedCharacter(value);
                  setCurrentPage(1);
                }}
                options={characterOptions}
                notFoundContent="暫無角色"
                showSearch={false}
              />
              <Button onClick={clearAll} type="default" size="middle">
                清除所有
              </Button>
            </div>
          </div>
        </div>
      );
    } else if (tabKey === '深夜模式局內詞條') {
      return (
        <div className="filter-search-row">
          <div className="filter-search-content">
            {/* 左側：搜索、多選、清除 */}
            <div className="filter-controls">
              <CustomSearch
                placeholder={`搜索 ${tabKey} 關鍵字`}
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={(value) => {
                  setSearchKeyword(value);
                  setCurrentPage(1);
                }}
                className="custom-search-input"
                allowClear
              />
              <Select
                className="deep-night-in-game-type-select"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                placeholder="按詞條類型篩選"
                value={selectedInGameTypes}
                onChange={(values) => {
                  setSelectedInGameTypes(values);
                  setCurrentPage(1);
                }}
                options={inGameDeepNightTypeOptions}
                maxTagPlaceholder={omittedValues => `+${omittedValues.length}...`}
              />
              <Button onClick={clearAll} type="default" size="middle">
                清除所有
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="search-container">
          <div className="filter-search-content">
            {/* 左側：搜索、清除 */}
            <div className="filter-controls">
              <CustomSearch
                placeholder={`搜索 ${tabKey} 關鍵字`}
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={(value) => {
                  setSearchKeyword(value);
                  setCurrentPage(1);
                }}
                className="custom-search-input"
                allowClear
              />
              {tabKey === '局內詞條' && (
                <Select
                  className="in-game-type-select"
                  mode="multiple"
                  allowClear
                  tagRender={tagRender}
                  placeholder="按詞條類型篩選"
                  value={selectedInGameTypes}
                  onChange={(values) => {
                    setSelectedInGameTypes(values);
                    setCurrentPage(1);
                  }}
                  options={inGameTypeOptions}
                  maxTagPlaceholder={omittedValues => `+${omittedValues.length}...`}
                />
              )}
              <Button onClick={clearAll} type="default" size="middle">
                清除所有
              </Button>
            </div>


          </div>
        </div>
      );
    }
  };

  return (
    <div className="content-wrapper">
      <Tabs
        type="card"
        style={{
          marginTop: '20px',
        }}
        activeKey={activeEntryTab}
        onChange={(key) => {
          setActiveEntryTab(key);
          setCurrentPage(1);
          // 清空搜索相關狀態
          setSearchKeyword('');
          setSelectedTypes([]);
          setSelectedInGameTypes([]);
          setSelectedCharacter('');
          setSelectedItemEffectTypes([]);
          setFilteredInfo({});
          setSortedInfo({});
        }}
        items={[
          {
            key: '局外詞條',
            label: '🌕 局外詞條',
            children: (
              <div id="outsider-entries">
                {renderSearchAndFilter('局外詞條')}
                {renderTableContent('局外詞條')}
              </div>
            ),
          },
          {
            key: '局內詞條',
            label: '🌖 局內詞條',
            children: (
              <div id="in-game-entries">
                {renderSearchAndFilter('局內詞條')}
                {renderTableContent('局內詞條')}
              </div>
            ),
          },
          {
            key: '護符詞條',
            label: '🌗 護符詞條',
            children: (
              <div id="talisman-entries">
                {renderSearchAndFilter('護符詞條')}
                {renderTableContent('護符詞條')}
              </div>
            ),
          },
          {
            key: '強化類別詞條適用範圍',
            label: '🌘 強化類別詞條適用範圍',
            children: (
              <div id="enhancement-categories">
                {renderSearchAndFilter('強化類別詞條適用範圍')}
                {renderTableContent('強化類別詞條適用範圍')}
              </div>
            ),
          },
          {
            key: '道具效果',
            label: '🌒 道具/採集效果',
            children: (
              <div id="item-effects">
                {renderSearchAndFilter('道具效果')}
                {renderTableContent('道具效果')}
              </div>
            ),
          },
          {
            key: '深夜模式局外詞條',
            label: '🌌 深夜模式-局外詞條',
            children: (
              <div id="deep-night-entries">
                {renderSearchAndFilter('深夜模式局外詞條')}
                {renderTableContent('深夜模式局外詞條')}
              </div>
            ),
          },
          {
            key: '深夜模式局內詞條',
            label: '🌌 深夜模式-局內詞條',
            children: (
              <div id="deep-night-in-game-entries">
                {renderSearchAndFilter('深夜模式局內詞條')}
                {renderTableContent('深夜模式局內詞條')}
              </div>
            ),
          },
        ]}
        className="custom-tabs"
      />
    </div>
  );
};

export default EntryDetailView; 
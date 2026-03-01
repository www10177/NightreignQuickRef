// 統一的導航配置
export interface NavigationItem {
  key: string;
  label: string;
  children?: NavigationItem[];
}

// 默認頁面設置
export const DEFAULT_PAGE = '遊戲機制'; // 修改這裡來改變默認頁面

// 主導航項配置（用於頂部導航欄）
export const mainNavigationItems: NavigationItem[] = [
  {
    key: '遊戲機制',
    label: '遊戲機制'
  },
  {
    key: '角色數據',
    label: '角色數據'
  },
  {
    key: '詞條詳細數據',
    label: '詞條詳細數據'
  },
  {
    key: '夜王Boss數據',
    label: '夜王Boss數據'
  },
  {
    key: '傳說武器詳情',
    label: '傳說武器詳情'
  },
];

// 獲取主導航項的順序
export const getMainNavigationOrder = (): string[] => {
  return mainNavigationItems.map(item => item.key);
};

// 獲取默認頁面
export const getDefaultPage = (): string => {
  return DEFAULT_PAGE;
};

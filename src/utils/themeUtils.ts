// 主題相關的工具函數
export const toggleTheme = (isDarkMode: boolean, setIsDarkMode: (value: boolean) => void) => {
  const newTheme = !isDarkMode;
  setIsDarkMode(newTheme);
  
  // 更新body屬性
  if (newTheme) {
    document.body.setAttribute('tomato-theme', 'dark');
  } else {
    document.body.removeAttribute('tomato-theme');
  }
  
  // 保存到localStorage
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  
  // 觸發自定義主題變化事件
  window.dispatchEvent(new Event('themeChange'));
};

export const initializeTheme = (setIsDarkMode: (value: boolean) => void) => {
  // 從localStorage讀取主題設置
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let shouldUseDark = false;
  if (savedTheme) {
    shouldUseDark = savedTheme === 'dark';
  } else {
    shouldUseDark = prefersDark;
  }
  
  setIsDarkMode(shouldUseDark);
  
  if (shouldUseDark) {
    document.body.setAttribute('tomato-theme', 'dark');
  } else {
    document.body.removeAttribute('tomato-theme');
  }
};

export const setupThemeListener = (setIsDarkMode: (value: boolean) => void) => {
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) { // 只有用戶沒有手動設置主題時才跟隨系統
      const newTheme = e.matches;
      setIsDarkMode(newTheme);
      
      if (newTheme) {
        document.body.setAttribute('tomato-theme', 'dark');
      } else {
        document.body.removeAttribute('tomato-theme');
      }
    }
  };

  darkThemeMq.addEventListener('change', handleThemeChange);
  
  return () => {
    darkThemeMq.removeEventListener('change', handleThemeChange);
  };
};

// 檢測當前主題狀態
export const getCurrentTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme as 'light' | 'dark';
  }
  
  // 如果沒有保存的主題設置，檢查系統偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

// 檢測是否為深色模式
export const isDarkMode = (): boolean => {
  return getCurrentTheme() === 'dark';
}; 
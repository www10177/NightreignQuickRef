import { useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { geekblue } from '@ant-design/colors';
// import zhCN from 'antd/locale/zh_CN';
// import enUS from 'antd/locale/en_US';
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import FunctionMenu from './components/FunctionMenu';
import LoadingSpinner from './components/LoadingSpinner';
import EntryDetailView from './pages/EntryDetailView';
import GameMechanicsView from './pages/GameMechanicsView';
import LegendaryWeaponView from './pages/LegendaryWeaponView';
import CharacterDataView from './pages/CharacterDataView';
import BossDataView from './pages/BossDataView';
import { initializeTheme, setupThemeListener } from './utils/themeUtils';
import DataManager from './utils/dataManager';
import { getDefaultPage } from './config/navigationConfig';

function App() {
  const [activeTab, setActiveTab] = useState(getDefaultPage());
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const [isEnglish, setIsEnglish] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 子Tab和Step狀態管理
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  // 主題切換函數
  const handleToggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // 更新body屬性
    if (newTheme) {
      document.body.setAttribute('tomato-theme', 'dark');
    } else {
      document.body.removeAttribute('tomato-theme');
    }
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // 觸發自定義主題變化事件
    window.dispatchEvent(new Event('themeChange'));
  };

  // 語言切換
  // const handleToggleLanguage = () => {
  //   setIsEnglish(!isEnglish);
  // };

  // 子Tab切換處理
  const handleSubTabChange = (tabKey: string) => {
    setActiveSubTab(tabKey);
  };

  // Step切換處理
  const handleStepChange = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  // 預加載所有數據
  useEffect(() => {
    const dataManager = DataManager.getInstance();
    dataManager.preloadAllData().then(() => {
      setIsDataLoaded(true);
    }).catch((error) => {
      console.error('數據預加載失敗:', error);
    });
  }, []);

  // 初始化主題
  useEffect(() => {
    initializeTheme(setIsDarkMode);
  }, []);

  // 監聽系統主題變化
  useEffect(() => {
    const cleanup = setupThemeListener(setIsDarkMode);
    return cleanup;
  }, []);

  // 主Tab切換時重置子Tab和Step狀態
  useEffect(() => {
    setActiveSubTab('');
    setActiveStep(0);
  }, [activeTab]);

  // 子Tab為一次性指令：生效後立即清空，避免持續控制子組件，阻止手動切換
  useEffect(() => {
    if (activeSubTab) {
      const timer = setTimeout(() => setActiveSubTab(''), 0);
      return () => clearTimeout(timer);
    }
  }, [activeSubTab]);

  // 渲染內容
  const renderContent = () => {
    switch (activeTab) {
      case '詞條詳細數據':
        return <EntryDetailView activeSubTab={activeSubTab} />;
      case '傳說武器詳情':
        return <LegendaryWeaponView activeStep={activeStep} />;
      case '角色數據':
        return <CharacterDataView />;
      case '遊戲機制':
        return <GameMechanicsView functionName="遊戲機制" />;
      case '夜王Boss數據':
        return <BossDataView activeSubTab={activeSubTab} />;
      default:
        return <EntryDetailView activeSubTab={activeSubTab} />;
    }
  };

  // 統一的主題配置
  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? geekblue[4] : geekblue[6],
      colorPrimaryHover: isDarkMode ? geekblue[3] : geekblue[5],
      colorPrimaryActive: isDarkMode ? geekblue[5] : geekblue[7],
    },
  };

  return (
    <ConfigProvider 
      theme={themeConfig}
      // locale={isEnglish ? enUS : zhCN}
    >
      {!isDataLoaded ? (
        <LoadingSpinner message="正在加載數據，請稍候..." />
      ) : (
        <div className="app-container">
          <FunctionMenu 
            onTabChange={setActiveTab} 
            onSubTabChange={handleSubTabChange}
            onStepChange={handleStepChange}
          />
          
          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            // onToggleLanguage={handleToggleLanguage}
          />

          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {renderContent()}

          <Footer />
        </div>
      )}
    </ConfigProvider>
  );
}

export default App;

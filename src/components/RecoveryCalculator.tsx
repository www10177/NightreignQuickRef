import { Typography, Card, Select, Button, Divider, Tag, Empty } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { useState } from 'react';
import recoverCalculateData from '../data/zh-TW/recover_calculate.json';
import '../styles/recoveryCalculator.css';

const { Text } = Typography;
const { Option } = Select;

const RecoveryCalculator: React.FC = () => {
  // 獲取category對應的顏色
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case '基礎值':
        return 'red';
      case '局內詞條(可疊加)':
        return 'green';
      case '局外詞條(不可疊加)':
        return 'pink';
      case '局內buff':
        return 'purple';
      default:
        return 'orange';
    }
  };

  // 回血量計算器狀態 - 初始選中追蹤者，隊友選擇女爵
  const [selectedCharacter, setSelectedCharacter] = useState<string>('1120'); 
  const [selectedAllyCharacter, setSelectedAllyCharacter] = useState<string>('860');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [calculationResult, setCalculationResult] = useState<{
    selfHealth: number;
    selfFocus: number;
    allyHealth: number;
    allyFocus: number;
    selfHealthPercent: string;
    selfFocusPercent: string;
    allyHealthPercent: string;
    allyFocusPercent: string;
    steps?: string[];
  } | null>(null);

  // 回血效果數據
  const recoverEffects = recoverCalculateData.items;

  // 角色選項 以及 15級時對應的血量和藍量
  const characterOptions = [
    { value: 1120, label: '追蹤者', focus: 140 },
    { value: 1280, label: '守護者', focus: 115 },
    { value: 820, label: '鐵眼', focus: 115 },
    { value: 860, label: '女爵', focus: 180 },
    { value: 1200, label: '無賴', focus: 95 },
    { value: 1000, label: '執行者', focus: 100 },
    { value: 780, label: '復仇者', focus: 200 },
    { value: 740, label: '隱士', focus: 195 },
  ];

  // 計算回血量
  const calculateRecovery = () => {
    if (!selectedCharacter || !selectedAllyCharacter) {
      return;
    }

    // 獲取角色基礎血量和藍量
    const characterHealth = parseInt(selectedCharacter);
    const allyCharacterHealth = parseInt(selectedAllyCharacter);

    const selectedCharacterData = characterOptions.find(option => option.value.toString() === selectedCharacter);
    const selectedAllyCharacterData = characterOptions.find(option => option.value.toString() === selectedAllyCharacter);

    const characterFocus = selectedCharacterData?.focus || 0;
    const allyCharacterFocus = selectedAllyCharacterData?.focus || 0;
    
    // 基礎回血量（紅露滴聖盃瓶）
    let baseHealthRecovery = 0.6; // 60%生命值
    let baseFocusRecovery = 0; // 基礎專注值恢復
    let baseHealthRecoveryAlly = 0; // 隊友回血量
    let baseFocusRecoveryAlly = 0; // 隊友回藍量

    // 定義計算優先級
    const priorityOrder = [1, 2,3,4,5,6];
    const allEffects = [...selectedEffects];
    const hasSlowRecovery = allEffects.includes('6');
    let boostCountForImmediate = 0; // 緩慢恢復時，僅對“立即10%”應用的20%提升次數
    const sortedEffects = allEffects.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(parseInt(a));
      const bPriority = priorityOrder.indexOf(parseInt(b));
      return aPriority - bPriority;
    });

    // 記錄計算步驟
    const calculationSteps = [];
    calculationSteps.push(`-------------基礎信息-------------`);
    calculationSteps.push(`【${selectedCharacterData?.label}-自己】基礎血量: ${characterHealth} 點 | 基礎藍量: ${characterFocus} 點`);

    calculationSteps.push(`【${selectedAllyCharacterData?.label}-隊友】基礎血量: ${allyCharacterHealth} 點 | 基礎藍量: ${allyCharacterFocus} 點`);

    if (hasSlowRecovery) {
      calculationSteps.push(`【基礎回血量】包含「緩慢恢復」：基礎60%不再生效，改為 立即10% + 持續(1%×81)`);
    } else {
      calculationSteps.push(`【基礎回血量】紅露滴聖盃瓶: ${(baseHealthRecovery * 100).toFixed(0)}%`);
    }
    calculationSteps.push(`------------應用不同效果------------`);

    // 應用選中的效果（按優先級順序）
    sortedEffects.forEach(effectId => {
      const item = recoverEffects.find(data => data.id.toString() === effectId);
      if (!item) return;

      switch (item.id) {
        case 1: // 徵兆buff
          baseFocusRecovery = 0.3; // 恢復30%專注值
          calculationSteps.push(`【應用】${item.name}: 專注值恢復 ${(baseFocusRecovery * 100).toFixed(0)}%`);
          break;

        case 2: // 使用聖盃瓶時，連同恢復周圍我方人物
          if (hasSlowRecovery) {
            // 緩慢恢復模式：不修改自身基礎（由case 6單獨處理），僅設置隊友恢復
            baseHealthRecoveryAlly = 0.3;
            if (baseFocusRecovery != 0) {
              baseFocusRecoveryAlly = 0.15;
            }
            calculationSteps.push(`【應用】${item.name}`);
          } else {
            baseHealthRecovery = 0.5;
            baseHealthRecoveryAlly = 0.3;
            if (baseFocusRecovery != 0) {
              baseFocusRecoveryAlly = 0.15;
            }
            calculationSteps.push(`【應用】${item.name}:【基礎回血量】變為${(baseHealthRecovery * 100).toFixed(0)}%，可以恢復隊友血量${(baseHealthRecoveryAlly * 100).toFixed(0)}%`);
          }
          break;

        case 3: // 提升聖盃瓶恢復量20%
          if (hasSlowRecovery) {
            boostCountForImmediate += 1;
            calculationSteps.push(`【標記】${item.name}: 僅對「立即10%」生效`);
          } else {
            baseHealthRecovery *= 1.2;
            if (baseHealthRecovery > 1.0) {
              calculationSteps.push(`【應用】${item.name}:【基礎回血量】× 1.2 = ${(baseHealthRecovery * 100).toFixed(0)}% (已達到最大值100%)`);
              baseHealthRecovery = 1.0;
            } else {
              calculationSteps.push(`【應用】${item.name}:【基礎回血量】× 1.2 = ${(baseHealthRecovery * 100).toFixed(0)}%`);
            }
          }
          break;

        case 4: // 提升聖盃瓶恢復量20%
          if (hasSlowRecovery) {
            boostCountForImmediate += 1;
            calculationSteps.push(`【應用】${item.name}: 僅對「立即10%」生效`);
          } else {
            baseHealthRecovery *= 1.2;
            if (baseHealthRecovery > 1.0) {
              calculationSteps.push(`【應用】${item.name}:【基礎回血量】× 1.2 = ${(baseHealthRecovery * 100).toFixed(0)}% (已達到最大值100%)`);
              baseHealthRecovery = 1.0;
            } else {
              calculationSteps.push(`【應用】${item.name}:【基礎回血量】× 1.2 = ${(baseHealthRecovery * 100).toFixed(0)}%`);
            }
          }
          break;

        case 5: // 提升聖盃瓶恢復量20%
          if (hasSlowRecovery) {
            boostCountForImmediate += 1;
            calculationSteps.push(`【應用】${item.name}: 僅對「立即10%」生效`);
          } else {
            baseHealthRecovery *= 1.2;
            if (baseHealthRecovery > 1.0) {
              calculationSteps.push(`【應用】${item.name}:【基礎回血量】× 1.2 = ${(baseHealthRecovery * 100).toFixed(0)}% (已達到最大值100%)`);
              baseHealthRecovery = 1.0;
            } else {
              calculationSteps.push(`【應用】${item.name}:【基礎回血量】× 1.2 = ${(baseHealthRecovery * 100).toFixed(0)}%`);
            }
          }
          break;

        case 6: // 使用聖盃瓶時，改為緩慢恢復（單獨邏輯）
          {
            const immediateBase = 0.1; // 10%
            const periodic = 0.01 * 81; // 81%
            const immediateMultiplier = Math.pow(1.2, boostCountForImmediate);
            let immediateAdjusted = immediateBase * immediateMultiplier;
            let cappedImmediate = false;
            if (immediateAdjusted > 1.0) {
              immediateAdjusted = 1.0;
              cappedImmediate = true;
            }
            const total = immediateAdjusted + periodic;
            baseHealthRecovery = total > 1.0 ? 1.0 : total;
            calculationSteps.push(
              `【應用】緩慢恢復: 立即10% × 1.2^${boostCountForImmediate} = ${(immediateAdjusted * 100).toFixed(0)}%${cappedImmediate ? ' (已達上限100%)' : ''}`
            );
            calculationSteps.push(`【應用】緩慢恢復: 持續回血 1%×81 = ${(periodic * 100).toFixed(0)}%`);
            calculationSteps.push(`【合計】自身恢復 = 立即部分 + 持續部分 = ${(baseHealthRecovery * 100).toFixed(0)}%${total > 1.0 ? ' (已達上限100%)' : ''}`);
            if(baseHealthRecoveryAlly!==0){
              baseHealthRecoveryAlly = 0.05 + (0.01 * 41);
              calculationSteps.push(`【應用】緩慢恢復(隊友): 5%+(1%×41) =  ${(baseHealthRecoveryAlly * 100).toFixed(0)}%`);
            }
          }
          break;
      }
    });

    // 計算最終結果 向下取整
    const result = {
      selfHealth: Math.floor(characterHealth * baseHealthRecovery), // 自己回血量（具體數值）
      selfFocus: Math.floor(characterFocus * baseFocusRecovery), // 自己回藍量（基於角色實際藍量）
      allyHealth: Math.floor(allyCharacterHealth * baseHealthRecoveryAlly), // 隊友回血量
      allyFocus: Math.floor(allyCharacterFocus * baseFocusRecoveryAlly), // 隊友回藍量（基於角色實際藍量）
      // 添加百分比數據
      selfHealthPercent: (baseHealthRecovery * 100).toFixed(0),
      selfFocusPercent: (baseFocusRecovery * 100).toFixed(0),
      allyHealthPercent: (baseHealthRecoveryAlly * 100).toFixed(0),
      allyFocusPercent: (baseFocusRecoveryAlly * 100).toFixed(0)
    };

    calculationSteps.push(`--------自己喝一口聖盃瓶的總效果--------`);
    calculationSteps.push(`【${selectedCharacterData?.label}-自己】回血量: ${characterHealth} × ${result.selfHealthPercent}% = ${result.selfHealth} 點`);
    if (baseFocusRecovery > 0) {
      calculationSteps.push(`【${selectedCharacterData?.label}-自己】回藍量: ${characterFocus} × ${result.selfFocusPercent}% = ${result.selfFocus} 點`);
    }
    if (baseHealthRecoveryAlly > 0) {
      calculationSteps.push(`【${selectedAllyCharacterData?.label}-隊友】回血量: ${allyCharacterHealth} × ${result.allyHealthPercent}% = ${result.allyHealth} 點`);
    }
    if (baseFocusRecoveryAlly > 0) {
      calculationSteps.push(`【${selectedAllyCharacterData?.label}-隊友】回藍量: ${allyCharacterFocus} × ${result.allyFocusPercent}% = ${result.allyFocus} 點`);
    }

    setCalculationResult({ ...result, steps: calculationSteps });
  };

  return (
    <div className="recovery-calculator">
      {/* 左側：選擇區域 */}
      <div className="selection-area">
        {/* 角色選擇 */}
        <div className="character-selection">
          <div className="character-row">
            <Text strong>選擇我的角色:</Text>
            <Select
              placeholder="請選擇你的角色"
              className="character-select"
              value={selectedCharacter}
              onChange={setSelectedCharacter}
            >
              {characterOptions.map(option => (
                <Option key={option.value} value={option.value.toString()}>
                  {option.label} ( 血量: {option.value}, 藍量: {option.focus} )
                </Option>
              ))}
            </Select>
          </div>

          <div className="character-row">
            <Text strong>選擇隊友的角色:</Text>
            <Select
              placeholder="請選擇隊友的角色"
              className="character-select"
              value={selectedAllyCharacter}
              onChange={setSelectedAllyCharacter}
            >
              {characterOptions.map(option => (
                <Option key={option.value} value={option.value.toString()}>
                  {option.label} ( 血量: {option.value}, 藍量: {option.focus} )
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* 回血效果選擇 - 網格佈局，每行兩個 */}
        <div className="effects-selection">
          <div className="effects-grid">
            {recoverEffects.map(item => (
              <div
                key={item.id}
                className={`effect-card ${selectedEffects.includes(item.id.toString()) ? 'selected' : ''}`}
                onClick={() => {
                  const newSelected = selectedEffects.includes(item.id.toString())
                    ? selectedEffects.filter(id => id !== item.id.toString())
                    : [...selectedEffects, item.id.toString()];
                  setSelectedEffects(newSelected);
                }}
              >
                <div className={`effect-card-title ${selectedEffects.includes(item.id.toString()) ? 'selected' : ''}`}>
                  {item.name}
                </div>
                <div className="effect-card-description">
                  {item.description}
                </div>
                <div className="effect-card-footer">
                  <Tag 
                    color={getCategoryColor(item.category || '')}
                    style={{ 
                      fontSize: '10px',
                      margin: 0,
                      fontWeight: 'bold'
                    }}
                  >
                    {item.category}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 備註信息 */}
        <div className="notes-section">
          <div className="notes-container">
            <ol className="notes-list">
              <li> 角色血量和藍量均為「15 級」時的數據；初始「紅露滴聖盃瓶」回血量為60%。</li>
              <li>「緩慢恢復」情況下「隊友」恢復量的計算說明：立即回血(5%) + 持續回血(每0.1s恢復1%)；持續恢復4s，共計恢復41次。</li>
              <li>「緩慢恢復」情況下，如果連著使用聖盃瓶，恢復持續時間會刷新為8s。</li>
              <li>「提升聖盃瓶恢復量 20%」詞條對「徵兆buff」以及隊友回血量無效。</li>
              <li>「提升聖盃瓶恢復量 20%」詞條可疊加，此處僅展示3個。選擇局外詞條的情況下，若疊加4個，恢復量達到最大值(86% × 1.2 = 103.2%)。</li>
            </ol>
          </div>
        </div>

        {/* 計算按鈕 */}
        <div>
          <Button 
            type="primary" 
            onClick={calculateRecovery}
            icon={<HeartOutlined />}
            className="calculate-button"
          >
            計算回血量（喝一口）
          </Button>
        </div>
      </div>

      {/* 右側：數據展示區域 */}
      <div className="results-area">
        {/* 計算步驟 */}
        <Card size="small" title="計算步驟" className="steps-card">
          <div className="steps-content">
            {calculationResult?.steps ? (
              calculationResult.steps.map((step, index) => (
                <div key={index} className="step-item">
                  {step}
                </div>
              ))
            ) : (
              <div className="placeholder">
                <Empty description="請點擊計算按鈕" />
              </div>
            )}
          </div>
        </Card>

        {/* 計算結果 */}
        <Card size="small" title="計算結果" className="results-card">
          <div className="results-content">
            {/* 自身恢復 */}
            <div className="recovery-section">
              <Text strong className="recovery-title self">自身恢復</Text>
              <div>
                {calculationResult ? (
                  <>
                    <div className="recovery-item">
                      <Text>回血量: {calculationResult.selfHealth} 點</Text>
                      <Text className="recovery-percentage"> ({calculationResult.selfHealthPercent}%)</Text>
                    </div>
                    {calculationResult.selfFocus > 0 && (
                      <div className="recovery-item">
                        <Text>回藍量: {calculationResult.selfFocus} 點</Text>
                        <Text className="recovery-percentage"> ({calculationResult.selfFocusPercent}%)</Text>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="recovery-placeholder">
                    待計算
                  </div>
                )}
              </div>
            </div>

            {/* 分隔線 */}
            <Divider type="vertical" className="divider" />

            {/* 隊友恢復 */}
            <div className="recovery-section">
              <Text strong className="recovery-title ally">隊友恢復</Text>
              <div>
                {calculationResult ? (
                  <>
                    <div className="recovery-item">
                      <Text>回血量: {calculationResult.allyHealth} 點</Text>
                      <Text className="recovery-percentage"> ({calculationResult.allyHealthPercent}%)</Text>
                    </div>
                    {calculationResult.allyFocus > 0 && (
                      <div className="recovery-item">
                        <Text>回藍量: {calculationResult.allyFocus} 點</Text>
                        <Text className="recovery-percentage"> ({calculationResult.allyFocusPercent}%)</Text>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="recovery-placeholder">
                    待計算
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecoveryCalculator; 
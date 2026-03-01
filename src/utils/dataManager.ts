// 數據管理器 - 用於預加載所有JSON文件
import { message } from 'antd';

// 數據接口定義
export interface EntryData {
  entry_id: string;
  entry_name: string;
  entry_type?: string | null;
  explanation: string | null;
  superposability?: string | null;
  talisman?: string;
  notes?: string | null;
}

export interface EnhancementCategory {
  category: string;
  applicable_scope: {
    [key: string]: string[];
  };
  notes: string[];
}

export interface WeaponCharacter {
  [weaponName: string]: {
    [characterName: string]: number;
  };
}

export interface WeaponEffect {
  [weaponName: string]: {
    類型: string;
    特效: string;
    描述: string;
    削韌: string;
  };
}

export interface CharacterState {
  [key: string]: string;
}

export interface CharacterData {
  [characterName: string]: CharacterState;
}

export interface MagicMove {
  attributeMark: string; // 屬性痕
  attributeIcon: string; // 屬性圖標
  mixedMagic: string; // 混合魔法
  totalDamage: string; // 總傷害
  duration: string; // 持續時間
  mixedMagicEffect: string; // 混合魔法效果
  // 兼容中文鍵名
  [key: string]: string;
}

export interface InvincibleFrame {
  name: string;
  type: string;
  value: number;
}

// 道具效果數據接口
export interface ItemEffect {
  name: string;
  effect: string;
  singleGridQty: string;
  type: string;
}

// 角色等級數據接口
export interface CharacterLevelData {
  level: number; // 等級
  HP: number;
  FP: number;
  ST: number;
  [key: string]: string | number;
}

// 角色詳細數據接口
export interface CharacterDetailData {
  [characterName: string]: CharacterLevelData[];
}

// 緩存數據類型
type CacheData = 
  | EntryData[]
  | WeaponCharacter
  | WeaponEffect
  | CharacterData
  | MagicMove[]
  | InvincibleFrame[]
  | EnhancementCategory[]
  | ItemEffect[]
  | CharacterDetailData
  | unknown;

// 全局數據存儲
class DataManager {
  private static instance: DataManager;
  private dataCache: Map<string, CacheData> = new Map();
  private loadingPromise: Promise<void> | null = null;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // 預加載所有數據
  public async preloadAllData(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadData();
    return this.loadingPromise;
  }

  private async loadData(): Promise<void> {
    try {
      // 角色詳細數據文件列表（英文文件名）
      const characterDetailFiles = [
        'tracker.json',
        'duchess.json',
        'hermit.json',
        'iron-eye.json',
        'rogue.json',
        'executor.json', 
        'guardian.json',
        'avenger.json',
      ];

      // 文件名到中文名稱的映射
      const fileNameToChineseName: { [key: string]: string } = {
        'tracker.json': '追蹤者',
        'duchess.json': '女爵',
        'hermit.json': '隱士',
        'iron-eye.json': '鐵之眼',
        'rogue.json': '無賴',
        'executor.json': '執行者',
        'guardian.json': '守護者',
        'avenger.json': '復仇者',
      };

      const [
        outsiderEntries,
        talismanEntries,
        inGameEntries,
        weaponCharacter,
        weaponEffect,
        characterStates,
        magicMoveList,
        invincibleFrames,
        enhancementCategories,
        inGameSpecialBuff,
        characterData,
        itemEffects,
        deepNightEntries,
        inGameDeepNightEntries
      ] = await Promise.all([
        import('../data/zh-TW/outsider_entries_zh-TW.json'),
        import('../data/zh-TW/talisman_entries_zh-TW.json'),
        import('../data/zh-TW/in-game_entries_zh-TW.json'),
        import('../data/zh-TW/weapon_character.json'),
        import('../data/zh-TW/weapon_effect.json'),
        import('../data/zh-TW/character_states.json'),
        import('../data/zh-TW/magic_move_list.json'),
        import('../data/zh-TW/invincible_frames.json'),
        import('../data/zh-TW/enhancement_categories.json'),
        import('../data/zh-TW/in-game_special_buff.json'),
        import('../data/character-info/character_data.json'),
        import('../data/zh-TW/item_effect.json'),
        import('../data/zh-TW/deep_night_entries.json'),
        import('../data/zh-TW/in-game_deep_night_entries.json')
      ]);

      // 加載角色詳細數據
      const characterDetailData: CharacterDetailData = {};
      for (const fileName of characterDetailFiles) {
        try {
          // 使用具體的文件路徑來避免動態導入警告
          const chineseName = fileNameToChineseName[fileName];
          let characterModule;
          
          switch (fileName) {
            case 'tracker.json':
              characterModule = await import('../data/character-info/tracker.json');
              break;
            case 'duchess.json':
              characterModule = await import('../data/character-info/duchess.json');
              break;
            case 'hermit.json':
              characterModule = await import('../data/character-info/hermit.json');
              break;
            case 'iron-eye.json':
              characterModule = await import('../data/character-info/iron-eye.json');
              break;
            case 'rogue.json':
              characterModule = await import('../data/character-info/rogue.json');
              break;
            case 'executor.json':
              characterModule = await import('../data/character-info/executor.json');
              break;
            case 'guardian.json':
              characterModule = await import('../data/character-info/guardian.json');
              break;
            case 'avenger.json':
              characterModule = await import('../data/character-info/avenger.json');
              break;
            default:
              console.warn(`未知的角色文件: ${fileName}`);
              continue;
          }
          
          const moduleData = characterModule.default as { [key: string]: unknown };
          if (moduleData[chineseName]) {
            characterDetailData[chineseName] = moduleData[chineseName] as CharacterLevelData[];
          }
        } catch (error) {
          console.warn(`無法加載角色詳細數據文件 ${fileName}:`, error);
        }
      }

      // 存儲數據到緩存
      this.dataCache.set('outsiderEntries', outsiderEntries.default);
      this.dataCache.set('talismanEntries', talismanEntries.default);
      this.dataCache.set('inGameEntries', inGameEntries.default);
      this.dataCache.set('weaponCharacter', weaponCharacter.default);
      this.dataCache.set('weaponEffect', weaponEffect.default);
      this.dataCache.set('characterStates', characterStates.default);
      this.dataCache.set('magicMoveList', magicMoveList.default);
      this.dataCache.set('invincibleFrames', invincibleFrames.default);
      this.dataCache.set('enhancementCategories', enhancementCategories.default);
      this.dataCache.set('inGameSpecialBuff', inGameSpecialBuff.default);
      this.dataCache.set('characterData', characterData.default);
      this.dataCache.set('characterDetailData', characterDetailData);
      this.dataCache.set('itemEffects', itemEffects.default);
      this.dataCache.set('deepNightEntries', deepNightEntries.default);
      this.dataCache.set('inGameDeepNightEntries', inGameDeepNightEntries.default);

      this.isLoaded = true;
      // console.log('所有數據預加載完成');
    } catch (error) {
      console.error('數據預加載失敗:', error);
      message.error('數據加載失敗，請刷新頁面重試');
      throw error;
    }
  }

  // 獲取數據的方法
  public getOutsiderEntries(): EntryData[] {
    return (this.dataCache.get('outsiderEntries') as EntryData[]) || [];
  }

  public getTalismanEntries(): EntryData[] {
    return (this.dataCache.get('talismanEntries') as EntryData[]) || [];
  }

  public getInGameEntries(): EntryData[] {
    return (this.dataCache.get('inGameEntries') as EntryData[]) || [];
  }

  public getWeaponCharacter(): WeaponCharacter[] {
    return (this.dataCache.get('weaponCharacter') as WeaponCharacter[]) || [{}];
  }

  public getWeaponEffect(): WeaponEffect[] {
    return (this.dataCache.get('weaponEffect') as WeaponEffect[]) || [{}];
  }

  public getCharacterStates(): CharacterData[] {
    return (this.dataCache.get('characterStates') as CharacterData[]) || [];
  }

  public getMagicMoveList(): MagicMove[] {
    return (this.dataCache.get('magicMoveList') as MagicMove[]) || [];
  }

  public getInvincibleFrames(): InvincibleFrame[] {
    return (this.dataCache.get('invincibleFrames') as InvincibleFrame[]) || [];
  }

  public getEnhancementCategories(): EnhancementCategory[] {
    return (this.dataCache.get('enhancementCategories') as EnhancementCategory[]) || [];
  }

  public getInGameSpecialBuff(): EntryData[] {
    return (this.dataCache.get('inGameSpecialBuff') as EntryData[]) || [];
  }

  public getCharacterData(): CharacterData {
    return (this.dataCache.get('characterData') as CharacterData) || {};
  }

  public getCharacterDetailData(): CharacterDetailData {
    return (this.dataCache.get('characterDetailData') as CharacterDetailData) || {};
  }

  public getItemEffects(): ItemEffect[] {
    return (this.dataCache.get('itemEffects') as ItemEffect[]) || [];
  }

  public getDeepNightEntries(): EntryData[] {
    const rawData = this.dataCache.get('deepNightEntries') || [];
    // 處理深夜模式局外詞條的數據格式
    const processedData: EntryData[] = [];
    
    if (Array.isArray(rawData)) {
      rawData.forEach(group => {
        if (typeof group === 'object' && group !== null) {
          Object.values(group).forEach((entry: unknown) => {
            if (entry && typeof entry === 'object' && entry !== null) {
              const entryObj = entry as Record<string, unknown>;
              processedData.push({
                entry_id: (entryObj.entry_id as string) || (entryObj.entry_entry_id as string) || '',
                entry_name: (entryObj.entry_name as string) || '',
                entry_type: (entryObj.entry_type as string) || null,
                explanation: (entryObj.explanation as string) || null,
                superposability: (entryObj.superposability as string) || null,
                notes: (entryObj.notes as string) || null
              });
            }
          });
        }
      });
    }
    
    return processedData;
  }

  public getInGameDeepNightEntries(): EntryData[] {
    const rawData = this.dataCache.get('inGameDeepNightEntries') || [];
    // 處理深夜模式局內詞條的數據格式
    const processedData: EntryData[] = [];
    
    if (Array.isArray(rawData)) {
      rawData.forEach(group => {
        if (typeof group === 'object' && group !== null) {
          Object.values(group).forEach((entry: unknown) => {
            if (entry && typeof entry === 'object' && entry !== null) {
              const entryObj = entry as Record<string, unknown>;
              processedData.push({
                entry_id: (entryObj.entry_id as string) || (entryObj.entry_entry_id as string) || '',
                entry_name: (entryObj.entry_name as string) || '',
                entry_type: (entryObj.entry_type as string) || null,
                explanation: (entryObj.explanation as string) || null,
                superposability: (entryObj.superposability as string) || null,
                notes: (entryObj.notes as string) || null
              });
            }
          });
        }
      });
    }
    
    return processedData;
  }

  // 檢查是否已加載
  public isDataLoaded(): boolean {
    return this.isLoaded;
  }

  // 等待數據加載完成
  public async waitForData(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }
    return this.loadingPromise || this.preloadAllData();
  }
}

export default DataManager; 
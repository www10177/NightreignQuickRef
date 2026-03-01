// 定義數據接口
export interface EntryData {
  entry_id: string;
  entry_name: string;
  entry_type?: string | null;
  explanation: string | null;
  superposability?: string | null;
  talisman?: string;
}

// Boss數據接口
export interface BossData {
  id: number;
  name: string;
  baseHealth: number | string;
  nightreignHealth: number | string;
  normalAbsorption: number;
  slashAbsorption: number;
  strikeAbsorption: number;
  pierceAbsorption: number;
  magicAbsorption: number;
  fireAbsorption: number;
  lightningAbsorption: number;
  holyAbsorption: number;
  poisonResistance: number | string;
  scarletRotResistance: number | string;
  bleedResistance: number | string;
  deathBlightResistance: number | string;
  frostResistance: number | string;
  sleepResistance: number | string;
  madnessResistance: number | string;
  basePoise: number;
  nightreignPoise: number | string;
  nightreignHealthMultiplier: number | string;
}

// 野生Boss數據接口
export interface WildBossData {
  name: string;
  normal: number;
  strike: number;
  slash: number;
  pierce: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
  basePoise: number | string;
  bleed: number | string;
  poison: number | string;
  scarletRot: number | string;
  frost: number | string;
  location: string;
}

// 圓桌廳堂人物數據接口
export interface CharacterData {
  name: string;
  normal: number;
  strike: number;
  slash: number;
  pierce: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
  basePoise: number | string;
  bleed: number | string;
  poison: number | string;
  scarletRot: number | string;
  frost: number | string;
  location: string;
}

// 詞條類型顏色映射
export const typeColorMap: Record<string, string> = {
  // 局外詞條
  '能力值': 'blue',
  '攻擊力': 'red',
  '技藝/絕招': 'orange',
  '魔法/禱告': 'purple',
  '減傷率': 'default',
  '對異常狀態的抵抗力': 'cyan',
  '恢復': 'lime',
  '行動': 'geekblue',
  '隊伍成員': 'magenta',
  '僅限特定角色': 'gold',
  '僅限特定武器': 'volcano',
  '出擊時的武器（戰技）': 'geekblue',
  '出擊時的武器（魔法）': 'purple',
  '出擊時的武器（禱告）': 'yellow',
  '出擊時的武器（附加）': 'blue',
  '出擊時的道具': 'orange',
  '場地環境': 'green',
  '專屬遺物': 'magenta',
  // 局內詞條
  '庇佑': 'purple',
  '不甘': 'volcano',
  '額外效果': 'cyan',
  '武器屬性': 'geekblue',
  '附加異常狀態': 'yellow',
  '強化': 'magenta',
  // 特殊事件及地形效果
  '特殊事件': 'green',
  '特殊地形：隱城': 'purple',
  '特殊地形：腐敗森林': 'red',
  '特殊地形：山頂': 'cyan',
  '特殊地形：火山口': 'volcano',
  // 道具效果分類
  '聖盃瓶': 'red',
  '採集': 'green',
  '道具': 'cyan',
  '苔藥': 'orange',
  '露滴': 'purple',
  '壺': 'blue',
  '飛刀': 'volcano',
  '石': 'geekblue',
  '香': 'magenta',
  '油脂': 'gold',
  // 深夜模式詞條
  '出擊時的道具(結晶露滴)': 'green',
  '減益(減傷率)': 'magenta',
  '減益(能力值)': 'red',
  '減益(行動)': 'geekblue',
  // 深夜模式局內詞條
  '減益(恢復)': 'volcano',
  '特殊效果': 'cyan',
  '法術觸媒專屬': 'purple',
  '盾牌專屬': 'magenta',
  '弓弩專屬': 'volcano',
}; 
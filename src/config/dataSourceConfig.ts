/**
 * 數據來源配置
 * 集中管理數據來源鏈接，方便統一更新和維護
 */

export type DataSourceIcon = 'baidu' | 'bilibili' | 'link';

export interface DataSourceItem {
  /** 鏈接標題 */
  title: string;
  /** 鏈接地址 */
  url: string;
  /** 圖標類型 */
  icon: DataSourceIcon;
}

export interface DataSourceGroup {
  /** 分組名稱（可選，用於註釋） */
  name?: string;
  /** 該分組下的鏈接列表 */
  items: DataSourceItem[];
  /** 是否在該分組前添加分隔線 */
  showDivider?: boolean;
}

/**
 * 數據來源鏈接配置
 * 按分組組織，支持自動添加分隔線
 */
export const DATA_SOURCE_CONFIG: DataSourceGroup[] = [
  {
    name: '百度貼吧',
    items: [
      {
        title: '黑夜君臨 v1.01數據彙總',
        url: 'https://tieba.baidu.com/p/9906444262?pid=152430482433&cid=#152430482433',
        icon: 'baidu'
      },
      {
        title: '黑夜君臨 新詞條數據一覽',
        url: 'https://tieba.baidu.com/p/9935090782?pid=152476350171&cid=#152476350171',
        icon: 'baidu'
      },
      {
        title: '全傳說武器庇佑效果',
        url: 'https://tieba.baidu.com/p/9889921465?pid=152403477340&cid=#152403477340',
        icon: 'baidu'
      },
      {
        title: '黑夜君臨1.02.2部分詳細更新內容（包含深夜模式改動）',
        url: 'https://tieba.baidu.com/p/10026641416?pid=152611338073&cid=#152611338073',
        icon: 'baidu'
      },
      {
        title: '劍骸馬雷1.02.2具體成長曲線',
        url: 'https://tieba.baidu.com/p/10027082782?share=9105&fr=sharewise&see_lz=0',
        icon: 'baidu'
      }
    ]
  },
  {
    name: 'Bilibili',
    showDivider: true,
    items: [
      {
        title: '【艾爾登法環：黑夜君臨】全詞條彙總！遺物+護符+武器固有效果+武器隨機buff',
        url: 'https://www.bilibili.com/video/BV1GfMSzvE3V',
        icon: 'bilibili'
      },
      {
        title: '【艾爾登法環：黑夜君臨】全角色迴避翻滾動作，無敵幀分析對比！',
        url: 'https://www.bilibili.com/video/BV1LvuVzuEqo',
        icon: 'bilibili'
      },
      {
        title: '【黑夜君臨】聖盃瓶恢復、緩回、群回機制解析及常見誤區',
        url: 'https://www.bilibili.com/video/BV1M18jzQE9X',
        icon: 'bilibili'
      },
      {
        title: '黑夜君臨 永夜山羊罪人NPC預設一覽+部分buff/debuff數值',
        url: 'https://www.bilibili.com/video/BV1wzvNzREYQ/?spm_id_from=333.1387.upload.video_card.click&vd_source=37640654dbdd4ab80b471a16ac6da3c0',
        icon: 'bilibili'
      },
      {
        title: '【黑夜君臨】局內減傷詞條疊加測試',
        url: 'https://www.bilibili.com/opus/1100871642065666054',
        icon: 'bilibili'
      },
      {
        title: '黑夜君臨：渡夜者各等級屬性點數一覽',
        url: 'https://www.bilibili.com/video/BV1p5ThzfEy7',
        icon: 'bilibili'
      },
      {
        title: '黑夜君臨：復活機制解析',
        url: 'https://www.bilibili.com/video/BV1TnNLzXESx',
        icon: 'bilibili'
      },
      {
        title: '【艾爾登法環：黑夜君臨】深夜模式，全詞條！（遺物+武器+負面詞條機制）',
        url: 'https://www.bilibili.com/video/BV1JLpxzmEdv',
        icon: 'bilibili'
      },
      {
        title: '【艾爾登法環：黑夜君臨】DLC全詞條！（遺物+改動詞條+可疊加性）見棄空洞者',
        url: 'https://www.bilibili.com/video/BV1sQmTBmEGP',
        icon: 'bilibili'
      },
      {
        title: '黑夜君臨 1.03.4更新內容(Reg版本)',
        url: 'https://www.bilibili.com/opus/1158092104127217697',
        icon: 'bilibili'
      }
    ]
  },
  {
    name: '其他資源',
    showDivider: true,
    items: [
      {
        title: '每日縮圈時間',
        url: 'https://mobalytics.gg/elden-ring-nightreign/guides/day-length',
        icon: 'link'
      },
      {
        title: '角色升級所需盧恩',
        url: 'https://game8.co/games/Elden-Ring-Nightreign/archives/522643',
        icon: 'link'
      },
      {
        title: '官方 Wiki',
        url: 'https://eldenringnightreign.wiki.fextralife.com/Elden+Ring+Nightreign+Wiki',
        icon: 'link'
      }
    ]
  }
];


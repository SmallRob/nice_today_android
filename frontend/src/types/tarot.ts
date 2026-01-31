export type TarotArcana = 'major' | 'minor';

export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

export type TarotSuitCN = '权杖' | '圣杯' | '宝剑' | '星币';

export type TarotRank =
  | 'ace'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';

export type TarotOrientation = 'upright' | 'reversed';

export interface TarotCardMeaning {
  core: string;
  keywords: string[];
  advice: string;
}

export interface TarotCard {
  id: string;
  arcana: TarotArcana;
  name: string;
  nameEn: string;
  number: number;
  suit?: TarotSuit;
  suitCN?: TarotSuitCN;
  rank?: TarotRank;
  rankLabel?: string;
  element?: '火' | '水' | '风' | '土' | '以太';
  theme?: string;
  upright: TarotCardMeaning;
  reversed: TarotCardMeaning;
  symbols: string[];
  history: string;
  myth: string;
}

export interface DrawnTarotCard {
  card: TarotCard;
  orientation: TarotOrientation;
  positionId: string;
  positionName: string;
  positionDesc: string;
}

export interface TarotSpreadDefinition {
  id: string;
  name: string;
  description: string;
  positions: Array<{
    id: string;
    name: string;
    desc: string;
  }>;
}


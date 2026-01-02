// types.ts
export interface Card {
  id: string;
  suit: '文' | '索' | '万' | '十';
  rank: number;
  value: number;
  isPlayable: boolean;
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  score: number;
  isHuman: boolean;
}

export type GamePhase = 'idle' | 'drawing' | 'playing' | 'ended';

export interface GameState {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayer: number;
  gamePhase: GamePhase;
  gameLog: string[];
  round: number;
}

export enum ActionType {
  INIT_GAME = 'INIT_GAME',
  DRAW_CARD = 'DRAW_CARD',
  PLAY_CARD = 'PLAY_CARD',
  BOT_TURN = 'BOT_TURN',
  NEXT_PLAYER = 'NEXT_PLAYER',
  ADD_LOG = 'ADD_LOG',
  RESET_GAME = 'RESET_GAME',
  LOAD_GAME = 'LOAD_GAME'
}
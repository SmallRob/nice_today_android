// gameReducer.ts
import { Card, GameState, ActionType } from './cardtype';

export const initialState: GameState = {
  players: [],
  deck: [],
  discardPile: [],
  currentPlayer: 0,
  gamePhase: 'idle',
  gameLog: [],
  round: 1
};

function createDeck(): Card[] {
  const suits: Card['suit'][] = ['文', '索', '万', '十'];
  const deck: Card[] = [];
  let id = 0;
  
  suits.forEach(suit => {
    for (let rank = 1; rank <= 9; rank++) {
      for (let i = 0; i < 4; i++) { // 每种牌4张
        deck.push({
          id: `${suit}-${rank}-${i}`,
          suit,
          rank,
          value: rank,
          isPlayable: true
        });
        id++;
      }
    }
  });
  
  return shuffleArray(deck);
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function gameReducer(state: GameState, action: any): GameState {
  switch (action.type) {
    case ActionType.INIT_GAME: {
      const deck = createDeck();
      const players = [
        { id: 0, name: '玩家', hand: [], score: 0, isHuman: true },
        { id: 1, name: '东家', hand: [], score: 0, isHuman: false },
        { id: 2, name: '南家', hand: [], score: 0, isHuman: false },
        { id: 3, name: '西家', hand: [], score: 0, isHuman: false }
      ];
      
      // 发牌
      for (let i = 0; i < 13; i++) {
        players.forEach(player => {
          if (deck.length > 0) {
            player.hand.push(deck.pop()!);
          }
        });
      }
      
      return {
        ...state,
        players,
        deck: deck,
        discardPile: [],
        currentPlayer: 0,
        gamePhase: 'drawing',
        gameLog: ['游戏开始！', '玩家先手'],
        round: 1
      };
    }

    case ActionType.DRAW_CARD: {
      if (state.deck.length === 0 || state.gamePhase !== 'drawing') {
        return state;
      }
      
      const newDeck = [...state.deck];
      const drawnCard = newDeck.pop()!;
      const players = [...state.players];
      players[state.currentPlayer].hand.push(drawnCard);
      
      return {
        ...state,
        deck: newDeck,
        players,
        gamePhase: 'playing',
        gameLog: [...state.gameLog, `${players[state.currentPlayer].name} 摸了一张牌`]
      };
    }

    case ActionType.PLAY_CARD: {
      const { cardId } = action.payload;
      const players = [...state.players];
      const player = players[state.currentPlayer];
      
      const cardIndex = player.hand.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return state;
      
      const playedCard = player.hand[cardIndex];
      player.hand.splice(cardIndex, 1);
      
      return {
        ...state,
        players,
        discardPile: [...state.discardPile, playedCard],
        gamePhase: 'drawing',
        currentPlayer: (state.currentPlayer + 1) % 4,
        gameLog: [...state.gameLog, `${player.name} 打出了 ${playedCard.suit}${playedCard.rank}`]
      };
    }

    case ActionType.BOT_TURN: {
      if (state.players[state.currentPlayer].isHuman) {
        return state;
      }
      
      const botPlayer = state.players[state.currentPlayer];
      const botName = botPlayer.name;
      const logs = [...state.gameLog];
      
      // 简单AI逻辑：摸牌然后出最小的牌
      let newState = { ...state };
      
      // 摸牌阶段
      if (newState.deck.length > 0) {
        const newDeck = [...newState.deck];
        const drawnCard = newDeck.pop()!;
        const players = [...newState.players];
        players[newState.currentPlayer].hand.push(drawnCard);
        
        newState = {
          ...newState,
          deck: newDeck,
          players,
          gameLog: [...logs, `${botName} 摸了一张牌`]
        };
      }
      
      // 出牌阶段
      if (botPlayer.hand.length > 0) {
        const players = [...newState.players];
        const hand = [...players[newState.currentPlayer].hand];
        
        // 找最小的牌打出
        hand.sort((a, b) => a.value - b.value);
        const cardToPlay = hand[0];
        const cardIndex = players[newState.currentPlayer].hand.findIndex(c => c.id === cardToPlay.id);
        
        if (cardIndex > -1) {
          players[newState.currentPlayer].hand.splice(cardIndex, 1);
          
          newState = {
            ...newState,
            players,
            discardPile: [...newState.discardPile, cardToPlay],
            currentPlayer: (newState.currentPlayer + 1) % 4,
            gamePhase: 'drawing',
            gameLog: [...newState.gameLog, `${botName} 打出了 ${cardToPlay.suit}${cardToPlay.rank}`]
          };
        }
      }
      
      return newState;
    }

    case ActionType.RESET_GAME:
      return initialState;

    case ActionType.LOAD_GAME:
      return action.payload;

    default:
      return state;
  }
}
// Game Engine - Pure functions for game state management
// Follows immutability pattern: never mutate state, always return new state

/**
 * Create initial game state from game configuration
 */
export function initializeGame(gameConfig) {
  const { player, ai, shop } = gameConfig;

  // Shuffle decks
  const playerDeck = shuffleDeck([...player.deck.cards]);
  const aiDeck = shuffleDeck([...ai.deck.cards]);

  // Determine first player (random for now)
  const firstPlayer = Math.random() < 0.5 ? 'player' : 'ai';

  // First player gets 1 mana and 4 cards
  // Second player gets 2 mana and 5 cards
  const playerStartMana = firstPlayer === 'player' ? 1 : 2;
  const aiStartMana = firstPlayer === 'ai' ? 1 : 2;
  const playerStartCards = firstPlayer === 'player' ? 4 : 5;
  const aiStartCards = firstPlayer === 'ai' ? 4 : 5;

  const state = {
    // Match level
    matchId: Date.now(),
    currentPlayer: firstPlayer,
    roundNumber: 1,
    turnNumber: 1,
    phase: 'main', // upkeep/main/end
    winner: null,
    gameOver: false,

    // Players
    player: createPlayerState('player', false, player.hero, playerDeck, playerStartMana, playerStartCards),
    ai: createPlayerState('ai', true, ai.hero, aiDeck, aiStartMana, aiStartCards),

    // Shop (shared)
    shop: initializeShop(shop.deck.cards),

    // Combat (temporary)
    combat: {
      active: false,
      attackers: [],
      blockers: {},
      damageOrder: {}
    },

    // Action log
    actionLog: [
      { timestamp: Date.now(), message: `Game started! ${firstPlayer === 'player' ? 'You go' : 'AI goes'} first.` }
    ]
  };

  return state;
}

/**
 * Create a player state object
 */
function createPlayerState(playerId, isAI, heroName, deck, startMana, startCards) {
  // Draw initial hand
  const hand = [];
  const remainingDeck = [...deck];

  for (let i = 0; i < startCards; i++) {
    if (remainingDeck.length > 0) {
      hand.push(createCardInstance(remainingDeck.shift()));
    }
  }

  return {
    playerId,
    isAI,
    hero: createHeroState(heroName, startMana),
    zones: {
      deck: remainingDeck.map(card => createCardInstance(card)),
      hand,
      battlefield: [],
      discard: [],
      graveyard: [],
      echoZone: [] // For Mage
    }
  };
}

/**
 * Create hero state based on hero type
 */
function createHeroState(heroName, startMana) {
  const baseHero = {
    name: heroName,
    currentHealth: 30,
    maxHealth: 30,
    currentArmor: 0,
    currentMana: startMana,
    maxMana: startMana,
    gold: 0,
    leveled: false,
    levelProgress: 0,
    equipment: {
      weapon: null,
      chest: null,
      jewelry: null,
      relic: null
    },
    abilities: {
      heroPower: getHeroPowerForHero(heroName),
      attack: getHeroAttackForHero(heroName)
    },
    abilitiesUsedThisTurn: {
      heroPower: false,
      attack: false,
      shopPurchase: false
    }
  };

  // Add hero-specific resources
  switch (heroName.toLowerCase()) {
    case 'necromancer':
      return {
        ...baseHero,
        classResource: {
          type: 'none', // Necromancer uses Raise/Sacrifice which are action-based
          value: 0
        },
        levelCondition: 'Raise 5+ minions',
        levelBonus: 'Raised minions enter untapped'
      };

    case 'barbarian':
      return {
        ...baseHero,
        classResource: {
          type: 'fury',
          value: 0,
          max: 12
        },
        levelCondition: 'Deal 15+ weapon damage',
        levelBonus: 'Weapon attacks deal +Armor damage'
      };

    case 'mage':
      return {
        ...baseHero,
        classResource: {
          type: 'arcana',
          value: 0
        },
        levelCondition: 'Cast 15+ spells',
        levelBonus: 'Spells cost -1'
      };

    case 'rogue':
      return {
        ...baseHero,
        classResource: {
          type: 'stealth',
          value: false
        },
        levelCondition: 'Spend 15 gold',
        levelBonus: 'Weapon deals 2x to hero while Stealthed'
      };

    default:
      return baseHero;
  }
}

/**
 * Get hero power for a hero
 */
function getHeroPowerForHero(heroName) {
  const heroPowers = {
    necromancer: {
      name: 'Dark Pact',
      cost: 2,
      description: 'Sacrifice 2 HP: Draw a card'
    },
    barbarian: {
      name: 'Battle Fury',
      cost: 1,
      description: 'Gain 2 Fury'
    },
    mage: {
      name: 'Arcane Surge',
      cost: 1,
      description: 'Gain 1 Arcana. Draw a card if Arcana >= 5'
    },
    rogue: {
      name: 'Shadow Step',
      cost: 2,
      description: 'Enter Stealth'
    }
  };

  return heroPowers[heroName.toLowerCase()] || {
    name: 'Hero Power',
    cost: 2,
    description: 'Default hero power'
  };
}

/**
 * Get hero attack for a hero
 */
function getHeroAttackForHero(heroName) {
  const heroAttacks = {
    necromancer: {
      name: 'Life Drain',
      damage: 1,
      description: 'Deal 1 damage to target'
    },
    barbarian: {
      name: 'Fury Strike',
      damage: 0,
      description: 'Deal damage equal to Fury, then reset Fury to 0'
    },
    mage: {
      name: 'Arcane Bolt',
      damage: 1,
      description: 'Deal 1 damage to target'
    },
    rogue: {
      name: 'Quick Strike',
      damage: 1,
      description: 'Deal 1 damage. Deals 2x while Stealthed'
    }
  };

  return heroAttacks[heroName.toLowerCase()] || {
    name: 'Attack',
    damage: 1,
    description: 'Deal 1 damage'
  };
}

/**
 * Initialize shop with 5 face-up cards from equipment deck
 */
function initializeShop(equipmentCards) {
  const shuffled = shuffleDeck([...equipmentCards]);

  // Separate by tier if tier info exists, otherwise use all as early tier
  const earlyDeck = [];
  const midDeck = [];
  const lateDeck = [];

  shuffled.forEach(card => {
    const tier = card.Tier || card.tier || 1;
    if (tier === 1) earlyDeck.push(card);
    else if (tier === 2) midDeck.push(card);
    else lateDeck.push(card);
  });

  // If no tier info, distribute evenly
  if (earlyDeck.length === 0 && midDeck.length === 0 && lateDeck.length === 0) {
    shuffled.forEach((card, i) => {
      if (i % 3 === 0) earlyDeck.push(card);
      else if (i % 3 === 1) midDeck.push(card);
      else lateDeck.push(card);
    });
  }

  // Draw 5 cards from early deck for initial market
  const market = [];
  const earlyDeckCopy = [...earlyDeck];
  for (let i = 0; i < 5 && earlyDeckCopy.length > 0; i++) {
    market.push(createEquipmentInstance(earlyDeckCopy.shift()));
  }

  return {
    market,
    earlyDeck: earlyDeckCopy.map(card => createEquipmentInstance(card)),
    midDeck: midDeck.map(card => createEquipmentInstance(card)),
    lateDeck: lateDeck.map(card => createEquipmentInstance(card)),
    currentTier: 'early'
  };
}

/**
 * Create a unique card instance from card data
 */
function createCardInstance(cardData) {
  return {
    instanceId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: cardData['Card Name'] || cardData.name || 'Unknown Card',
    cardType: (cardData['Card Type'] || cardData.cardType || 'Minion').toLowerCase(),
    manaCost: parseInt(cardData['Mana Cost'] || cardData.manaCost || 0),
    attack: cardData.Attack || cardData.attack || null,
    health: cardData.Health || cardData.health || null,
    currentHealth: cardData.Health || cardData.health || null,
    bounty: cardData.Bounty || cardData.bounty || null,
    effect: cardData.Effect || cardData.effect || '',
    copies: cardData.Copies || cardData.copies || 1,
    // Minion-specific fields
    tapped: false,
    summoningSickness: true,
    buffs: []
  };
}

/**
 * Create equipment instance
 */
function createEquipmentInstance(equipmentData) {
  return {
    instanceId: `equip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: equipmentData['Item Name'] || equipmentData.name || 'Unknown Item',
    tier: equipmentData.Tier || equipmentData.tier || 1,
    cost: parseInt(equipmentData.Cost || equipmentData.cost || 0),
    slot: equipmentData.Slot || equipmentData.slot || 'Unknown',
    effect: equipmentData.Effect || equipmentData.effect || ''
  };
}

/**
 * Shuffle an array (Fisher-Yates)
 */
function shuffleDeck(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Expand deck cards based on Copies field
 */
export function expandDeck(cards) {
  const expanded = [];
  cards.forEach(card => {
    const copies = parseInt(card.Copies || card.copies || 1);
    for (let i = 0; i < copies; i++) {
      expanded.push({ ...card });
    }
  });
  return expanded;
}

/**
 * Log an action to the game state
 */
export function logAction(state, message) {
  return {
    ...state,
    actionLog: [
      ...state.actionLog,
      { timestamp: Date.now(), message }
    ]
  };
}

/**
 * Get the current player's state
 */
export function getCurrentPlayerState(state) {
  return state[state.currentPlayer];
}

/**
 * Get the opponent's state
 */
export function getOpponentState(state) {
  return state[state.currentPlayer === 'player' ? 'ai' : 'player'];
}

/**
 * Check if a card can be played
 */
export function canPlayCard(state, playerId, card) {
  const playerState = state[playerId];

  // Check if it's player's turn
  if (state.currentPlayer !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }

  // Check if in main phase
  if (state.phase !== 'main') {
    return { valid: false, reason: 'Can only play cards during main phase' };
  }

  // Check mana
  if (playerState.hero.currentMana < card.manaCost) {
    return { valid: false, reason: 'Not enough mana' };
  }

  // Check if card is in hand
  const inHand = playerState.zones.hand.some(c => c.instanceId === card.instanceId);
  if (!inHand) {
    return { valid: false, reason: 'Card not in hand' };
  }

  return { valid: true };
}

/**
 * End turn and switch to opponent
 */
export function endTurn(state) {
  const currentPlayerId = state.currentPlayer;
  const nextPlayerId = currentPlayerId === 'player' ? 'ai' : 'player';

  let newState = { ...state };

  // End phase: heal all minions, gain gold, reset counters
  const currentPlayer = state[currentPlayerId];
  const healed = currentPlayer.zones.battlefield.map(minion => ({
    ...minion,
    currentHealth: minion.health // Full heal
  }));

  newState[currentPlayerId] = {
    ...currentPlayer,
    hero: {
      ...currentPlayer.hero,
      gold: currentPlayer.hero.gold + 1,
      abilitiesUsedThisTurn: {
        heroPower: false,
        attack: false,
        shopPurchase: false
      }
    },
    zones: {
      ...currentPlayer.zones,
      battlefield: healed
    }
  };

  // Switch player
  newState.currentPlayer = nextPlayerId;

  // Increment turn/round
  if (nextPlayerId === 'player') {
    newState.roundNumber += 1;
  }
  newState.turnNumber += 1;

  // Upkeep phase for new player
  newState = performUpkeep(newState);

  // Log
  newState = logAction(newState, `Turn ${newState.turnNumber}: ${nextPlayerId === 'player' ? 'Your' : "AI's"} turn`);

  return newState;
}

/**
 * Perform upkeep phase (untap, gain mana, draw card)
 */
function performUpkeep(state) {
  const playerId = state.currentPlayer;
  const playerState = state[playerId];

  // Untap all minions
  const untapped = playerState.zones.battlefield.map(minion => ({
    ...minion,
    tapped: false,
    summoningSickness: false // Remove summoning sickness
  }));

  // Gain mana (cap at 10)
  const newMaxMana = Math.min(playerState.hero.maxMana + 1, 10);

  // Draw a card
  const deck = [...playerState.zones.deck];
  const hand = [...playerState.zones.hand];

  if (deck.length > 0) {
    hand.push(deck.shift());
  }

  return {
    ...state,
    phase: 'main',
    [playerId]: {
      ...playerState,
      hero: {
        ...playerState.hero,
        currentMana: newMaxMana,
        maxMana: newMaxMana
      },
      zones: {
        ...playerState.zones,
        deck,
        hand,
        battlefield: untapped
      }
    }
  };
}

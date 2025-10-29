// Game Engine - Pure functions for game state management
// Follows immutability pattern: never mutate state, always return new state

// Game Constants
export const GAME_CONSTANTS = {
  STARTING_HEALTH: 25,
  MAX_MANA: 10,
  FIRST_PLAYER_STARTING_MANA: 1,
  SECOND_PLAYER_STARTING_MANA: 2,
  FIRST_PLAYER_STARTING_CARDS: 4,
  SECOND_PLAYER_STARTING_CARDS: 5,
  MAX_FURY: 12,
  BARBARIAN_LEVEL_THRESHOLD: 15,
  NECROMANCER_LEVEL_THRESHOLD: 5,
  MAGE_LEVEL_THRESHOLD: 15,
  ROGUE_LEVEL_THRESHOLD: 15,
  MAGE_ECHO_ZONE_MAX: 3,
  SHOP_SIZE: 5,
  SHOP_REFRESH_ROUNDS: [5, 8],
  DARK_PACT_HP_COST: 2,
  MILL_DAMAGE: 1
};

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

  // First player gets 1 mana and 4 cards, Second player gets 2 mana and 5 cards
  const playerStartMana = firstPlayer === 'player' ? GAME_CONSTANTS.FIRST_PLAYER_STARTING_MANA : GAME_CONSTANTS.SECOND_PLAYER_STARTING_MANA;
  const aiStartMana = firstPlayer === 'ai' ? GAME_CONSTANTS.FIRST_PLAYER_STARTING_MANA : GAME_CONSTANTS.SECOND_PLAYER_STARTING_MANA;
  const playerStartCards = firstPlayer === 'player' ? GAME_CONSTANTS.FIRST_PLAYER_STARTING_CARDS : GAME_CONSTANTS.SECOND_PLAYER_STARTING_CARDS;
  const aiStartCards = firstPlayer === 'ai' ? GAME_CONSTANTS.FIRST_PLAYER_STARTING_CARDS : GAME_CONSTANTS.SECOND_PLAYER_STARTING_CARDS;

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
    shop: initializeShop(shop.cards),

    // Combat (temporary)
    combat: {
      active: false,
      phase: null, // 'attacking' or 'blocking'
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
    currentHealth: GAME_CONSTANTS.STARTING_HEALTH,
    maxHealth: GAME_CONSTANTS.STARTING_HEALTH,
    currentArmor: 0,
    currentMana: startMana,
    maxMana: startMana,
    gold: 0,
    weaponDamage: 2, // Base weapon damage (all heroes start with 2)
    leveled: false,
    levelProgress: 0,
    equipment: {
      weapon: null,
      chest: null,
      jewelry: null,
      relic: null
    },
    abilities: {
      heroPower: getHeroPowerForHero(heroName, false),
      attack: getHeroAttackForHero(heroName, false)
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
          max: GAME_CONSTANTS.MAX_FURY
        },
        levelCondition: `Deal ${GAME_CONSTANTS.BARBARIAN_LEVEL_THRESHOLD}+ weapon damage`,
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
function getHeroPowerForHero(heroName, isUpgraded = false) {
  const heroPowers = {
    barbarian: {
      base: {
        name: 'War Cry',
        cost: 1,
        description: 'Gain 2 Armor'
      },
      upgraded: {
        name: 'Berserker\'s Roar',
        cost: 1,
        description: 'Gain 2 Armor and 1 Fury'
      }
    },
    mage: {
      base: {
        name: 'Arcane Focus',
        cost: 1,
        description: 'Gain 1 Arcana'
      },
      upgraded: {
        name: 'Arcane Mastery',
        cost: 1,
        description: 'Gain 1 Arcana and draw a card'
      }
    },
    necromancer: {
      base: {
        name: 'Soul Harvest',
        cost: 1,
        description: 'Sacrifice 2: Draw a card'
      },
      upgraded: {
        name: 'Unholy Empowerment',
        cost: 1,
        description: 'Sacrifice 2: Draw a card. If you sacrificed a minion, gain 1 Health'
      }
    },
    rogue: {
      base: {
        name: 'Shadowstep',
        cost: 1,
        description: 'Enter Stealth'
      },
      upgraded: {
        name: 'Calculated Strike',
        cost: 1,
        description: 'Enter Stealth and deal 1 damage to target enemy minion'
      }
    }
  };

  const heroKey = heroName.toLowerCase();
  const heroPowerSet = heroPowers[heroKey];

  if (!heroPowerSet) {
    return {
      name: 'Hero Power',
      cost: 1,
      description: 'Default hero power'
    };
  }

  return isUpgraded ? heroPowerSet.upgraded : heroPowerSet.base;
}

/**
 * Get hero attack for a hero
 * All heroes have the same base attack: Cost 2 mana, deal weapon damage, take damage back
 */
function getHeroAttackForHero(heroName, isUpgraded = false) {
  const heroAttacks = {
    barbarian: {
      base: {
        name: 'Weapon Strike',
        cost: 2,
        description: 'Deal weapon damage to target. Take damage back. When you use this, spend ALL Fury for bonus damage'
      },
      upgraded: {
        name: 'Devastating Blow',
        cost: 2,
        description: 'Deal (weapon + Fury) to target. Take damage back. 5+ Fury: This costs 0 instead'
      }
    },
    mage: {
      base: {
        name: 'Arcane Blast',
        cost: 2,
        description: 'Deal weapon damage to target. Take damage back.'
      },
      upgraded: {
        name: 'Empowered Blast',
        cost: 2,
        description: 'Deal weapon damage +1 to target. Take damage back. 5+ Arcana: This costs 0 instead'
      }
    },
    necromancer: {
      base: {
        name: 'Deathtouch',
        cost: 2,
        description: 'Deal weapon damage to target. Take damage back. If target dies, Raise 1 minion (2-cost or less)'
      },
      upgraded: {
        name: 'Reaper\'s Touch',
        cost: 2,
        description: 'Deal weapon damage +1 to target. Take damage back. If target dies, Raise 1 minion (3-cost or less)'
      }
    },
    rogue: {
      base: {
        name: 'Blade Strike',
        cost: 2,
        description: 'Deal weapon damage to target. Take damage back. (Taking damage from enemy hero attacks breaks your Stealth)'
      },
      upgraded: {
        name: 'Assassin\'s Strike',
        cost: 2,
        description: 'Deal weapon damage +1 to target. If you kill target, don\'t take damage back. Stealth: Cost 0 instead'
      }
    }
  };

  const heroKey = heroName.toLowerCase();
  const heroAttackSet = heroAttacks[heroKey];

  if (!heroAttackSet) {
    return {
      name: 'Attack',
      cost: 2,
      description: 'Deal weapon damage to target. Take damage back.'
    };
  }

  return isUpgraded ? heroAttackSet.upgraded : heroAttackSet.base;
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

    // Check for shop refresh at rounds 5 and 9
    if (newState.roundNumber === 5 || newState.roundNumber === 9) {
      newState = refreshShop(newState);
    }
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

  // Gain mana (cap at MAX_MANA)
  const newMaxMana = Math.min(playerState.hero.maxMana + 1, GAME_CONSTANTS.MAX_MANA);

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

/**
 * Play a card from hand
 */
export function playCard(state, playerId, card, target = null) {
  // Validate
  const validation = canPlayCard(state, playerId, card);
  if (!validation.valid) {
    return { error: validation.reason, state };
  }

  const playerState = state[playerId];

  // Remove card from hand
  const newHand = playerState.zones.hand.filter(c => c.instanceId !== card.instanceId);

  // Spend mana
  const newMana = playerState.hero.currentMana - card.manaCost;

  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      hero: {
        ...playerState.hero,
        currentMana: newMana
      },
      zones: {
        ...playerState.zones,
        hand: newHand
      }
    }
  };

  // Handle based on card type
  if (card.cardType === 'minion') {
    // Play minion to battlefield
    const minion = {
      ...card,
      summoningSickness: true, // Can't attack this turn (unless Prepared)
      tapped: false,
      currentHealth: card.health
    };

    // Check for Prepared keyword
    if (card.effect && card.effect.toLowerCase().includes('prepared')) {
      minion.summoningSickness = false;
    }

    newState[playerId].zones.battlefield = [
      ...newState[playerId].zones.battlefield,
      minion
    ];

    newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} played ${card.name}`);

    // Trigger "when played" effects (like Necromancer's Gain 1 Fury)
    // For now, we'll handle these manually based on effect text
    newState = handleCardPlayEffects(newState, playerId, card);

  } else if (card.cardType === 'spell') {
    // Cast spell - goes to discard
    newState[playerId].zones.discard = [
      ...newState[playerId].zones.discard,
      card
    ];

    newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} cast ${card.name}`);

    // Apply spell effects
    newState = applySpellEffects(newState, playerId, card, target);

    // Mage: Gain Arcana (1 per 3 mana spent on spells, round down)
    if (newState[playerId].hero.name.toLowerCase() === 'mage') {
      const arcanaGained = Math.floor(card.manaCost / 3);
      newState[playerId].hero.classResource.value += arcanaGained;

      // Level progress tracks spell count, not Arcana value
      if (!newState[playerId].hero.leveled) {
        newState[playerId].hero.levelProgress += 1;

        // Check level-up condition (Cast 15 spells)
        if (newState[playerId].hero.levelProgress >= GAME_CONSTANTS.MAGE_LEVEL_THRESHOLD) {
          newState[playerId].hero.leveled = true;
          // Upgrade abilities
          const heroName = newState[playerId].hero.name;
          newState[playerId].hero.abilities.heroPower = getHeroPowerForHero(heroName, true);
          newState[playerId].hero.abilities.attack = getHeroAttackForHero(heroName, true);
          newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} leveled up! ${newState[playerId].hero.levelBonus}`);
        }
      }

      if (arcanaGained > 0) {
        newState = logAction(newState, `Gained ${arcanaGained} Arcana (Total: ${newState[playerId].hero.classResource.value})`);
      }
    }
  }

  return { state: newState, error: null };
}

/**
 * Handle card play effects (minion enters battlefield)
 */
function handleCardPlayEffects(state, playerId, card) {
  let newState = { ...state };
  const effect = (card.effect || '').toLowerCase();

  // Barbarian: Gain Fury effects
  if (newState[playerId].hero.name.toLowerCase() === 'barbarian' && effect.includes('gain') && effect.includes('fury')) {
    const match = effect.match(/gain (\d+) fury/);
    if (match) {
      const furyGain = parseInt(match[1]);
      const currentFury = newState[playerId].hero.classResource.value;
      const maxFury = newState[playerId].hero.classResource.max;
      newState[playerId].hero.classResource.value = Math.min(currentFury + furyGain, maxFury);
      newState = logAction(newState, `Gained ${furyGain} Fury (now ${newState[playerId].hero.classResource.value})`);
    }
  }

  return newState;
}

/**
 * Apply spell effects (basic implementation)
 */
function applySpellEffects(state, playerId, spell, target) {
  let newState = { ...state };
  const effect = (spell.effect || '').toLowerCase();

  // Deal damage effects
  if (effect.includes('deal') && effect.includes('damage')) {
    const damageMatch = effect.match(/deal (\d+) damage/);
    if (damageMatch) {
      const damage = parseInt(damageMatch[1]);

      // For now, default to opponent hero as target
      // TODO: Implement proper targeting system for minions
      const opponentId = playerId === 'player' ? 'ai' : 'player';
      newState[opponentId].hero.currentHealth -= damage;

      // Check win condition
      if (newState[opponentId].hero.currentHealth <= 0) {
        newState.gameOver = true;
        newState.winner = playerId;
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} wins!`);
      } else {
        newState = logAction(newState, `${spell.name} dealt ${damage} damage to opponent`);
      }
    }
  }

  // Draw card effects
  if (effect.includes('draw')) {
    const drawMatch = effect.match(/draw (\d+)/);
    if (drawMatch) {
      const drawCount = parseInt(drawMatch[1]);
      for (let i = 0; i < drawCount; i++) {
        newState = drawCard(newState, playerId);
      }
    }
  }

  return newState;
}

/**
 * Draw a card for a player
 */
function drawCard(state, playerId) {
  const playerState = state[playerId];
  const deck = [...playerState.zones.deck];
  const hand = [...playerState.zones.hand];

  if (deck.length > 0) {
    const drawnCard = deck.shift();
    hand.push(drawnCard);

    const newState = {
      ...state,
      [playerId]: {
        ...playerState,
        zones: {
          ...playerState.zones,
          deck,
          hand
        }
      }
    };

    return logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} drew a card (${hand.length} in hand)`);
  } else {
    // Deck is empty - take mill damage
    let newState = {
      ...state,
      [playerId]: {
        ...playerState,
        hero: {
          ...playerState.hero,
          currentHealth: playerState.hero.currentHealth - GAME_CONSTANTS.MILL_DAMAGE
        }
      }
    };

    newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} took ${GAME_CONSTANTS.MILL_DAMAGE} mill damage (deck empty)!`);

    // Check win condition
    if (newState[playerId].hero.currentHealth <= 0) {
      newState.gameOver = true;
      newState.winner = playerId === 'player' ? 'ai' : 'player';
      newState = logAction(newState, `${playerId === 'player' ? 'AI' : 'You'} wins! Opponent decked out.`);
    }

    return newState;
  }
}

/**
 * Use Hero Power
 */
export function useHeroPower(state, playerId, target = null) {
  const playerState = state[playerId];

  // Validate
  if (state.currentPlayer !== playerId) {
    return { error: 'Not your turn', state };
  }

  if (state.phase !== 'main') {
    return { error: 'Can only use hero power during main phase', state };
  }

  if (playerState.hero.abilitiesUsedThisTurn.heroPower) {
    return { error: 'Hero power already used this turn', state };
  }

  const powerCost = playerState.hero.abilities.heroPower.cost;
  if (playerState.hero.currentMana < powerCost) {
    return { error: 'Not enough mana', state };
  }

  // Apply hero power effect based on hero
  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      hero: {
        ...playerState.hero,
        currentMana: playerState.hero.currentMana - powerCost,
        abilitiesUsedThisTurn: {
          ...playerState.hero.abilitiesUsedThisTurn,
          heroPower: true
        }
      }
    }
  };

  const heroName = playerState.hero.name.toLowerCase();
  const isUpgraded = playerState.hero.leveled;

  switch (heroName) {
    case 'barbarian':
      // Base: War Cry - Gain 2 Armor
      // Upgraded: Berserker's Roar - Gain 2 Armor and 1 Fury
      const newArmor = Math.min(
        newState[playerId].hero.currentArmor + 2,
        10 // Max armor is 10
      );
      newState[playerId].hero.currentArmor = newArmor;

      if (isUpgraded) {
        // Also gain 1 Fury
        newState[playerId].hero.classResource.value = Math.min(
          newState[playerId].hero.classResource.value + 1,
          newState[playerId].hero.classResource.max
        );
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Berserker's Roar (Armor: ${newArmor}, Fury: ${newState[playerId].hero.classResource.value})`);
      } else {
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used War Cry (Armor: ${newArmor})`);
      }
      break;

    case 'mage':
      // Base: Arcane Focus - Gain 1 Arcana
      // Upgraded: Arcane Mastery - Gain 1 Arcana and draw a card
      newState[playerId].hero.classResource.value += 1;
      const arcana = newState[playerId].hero.classResource.value;

      if (isUpgraded) {
        newState = drawCard(newState, playerId);
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Arcane Mastery (Arcana: ${arcana}, drew a card)`);
      } else {
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Arcane Focus (Arcana: ${arcana})`);
      }
      break;

    case 'necromancer':
      // Base: Soul Harvest - Sacrifice 2: Draw a card
      // Upgraded: Unholy Empowerment - Sacrifice 2: Draw a card. If you sacrificed a minion, gain 1 Health
      // Sacrifice means: Pay 2 HP OR kill a minion with health >= 2
      // For now, just pay 2 HP (minion sacrifice would need UI)
      if (newState[playerId].hero.currentHealth <= 2) {
        return { error: 'Not enough health to sacrifice', state };
      }

      newState[playerId].hero.currentHealth -= 2;
      newState = drawCard(newState, playerId);

      if (isUpgraded) {
        // TODO: If sacrificed a minion, gain 1 Health (need UI for minion selection)
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Unholy Empowerment (sacrificed 2 HP, drew a card)`);
      } else {
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Soul Harvest (sacrificed 2 HP, drew a card)`);
      }
      break;

    case 'rogue':
      // Base: Shadowstep - Enter Stealth
      // Upgraded: Calculated Strike - Enter Stealth and deal 1 damage to target enemy minion
      newState[playerId].hero.classResource.value = true;

      if (isUpgraded && target) {
        // Deal 1 damage to target enemy minion
        const opponentId = playerId === 'player' ? 'ai' : 'player';
        const targetMinion = newState[opponentId].zones.battlefield.find(m => m.instanceId === target);

        if (targetMinion) {
          const newBattlefield = newState[opponentId].zones.battlefield.map(m => {
            if (m.instanceId === target) {
              const newHealth = m.currentHealth - 1;
              return { ...m, currentHealth: newHealth };
            }
            return m;
          }).filter(m => m.currentHealth > 0); // Remove dead minions

          newState[opponentId].zones.battlefield = newBattlefield;

          // If minion died, move to discard and give bounty
          if (!newBattlefield.find(m => m.instanceId === target)) {
            newState[opponentId].zones.discard.push(targetMinion);
            newState[playerId].hero.gold += targetMinion.bounty || 0;
          }
        }

        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Calculated Strike (Stealthed, dealt 1 damage)`);
      } else {
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Shadowstep (Stealthed)`);
      }
      break;

    default:
      newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used Hero Power`);
  }

  return { state: newState, error: null };
}

/**
 * Use Hero Attack - Universal attack ability for all heroes
 * Cost: 2 mana (or 0 under certain conditions)
 * Target: enemy minion OR enemy hero
 * Deal weapon damage (base 2 + equipment + bonuses)
 * Take damage back equal to target's attack (minion) or weapon (hero)
 */
export function useHeroAttack(state, playerId, target) {
  const playerState = state[playerId];
  const opponentId = playerId === 'player' ? 'ai' : 'player';

  // Validate
  if (state.currentPlayer !== playerId) {
    return { error: 'Not your turn', state };
  }

  if (state.phase !== 'main') {
    return { error: 'Can only attack during main phase', state };
  }

  if (playerState.hero.abilitiesUsedThisTurn.attack) {
    return { error: 'Hero attack already used this turn', state };
  }

  // Default to targeting enemy hero if no target specified (for backward compatibility)
  if (!target) {
    target = 'hero';
  }

  const heroName = playerState.hero.name.toLowerCase();
  const isUpgraded = playerState.hero.leveled;

  // Determine target type and get target data
  let targetType = 'hero'; // 'hero' or 'minion'
  let targetMinion = null;

  if (target !== 'hero') {
    // Try to find minion target
    targetMinion = state[opponentId].zones.battlefield.find(m => m.instanceId === target);
    if (!targetMinion) {
      return { error: 'Invalid target', state };
    }
    targetType = 'minion';
  }

  // Calculate attack cost (base 2, but some heroes get 0 cost)
  let attackCost = 2;

  if (isUpgraded) {
    if (heroName === 'barbarian' && playerState.hero.classResource.value >= 5) {
      attackCost = 0; // Devastating Blow at 5+ Fury
    } else if (heroName === 'mage' && playerState.hero.classResource.value >= 5) {
      attackCost = 0; // Empowered Blast at 5+ Arcana
    } else if (heroName === 'rogue' && playerState.hero.classResource.value === true) {
      attackCost = 0; // Assassin's Strike while Stealthed
    }
  }

  // Check mana
  if (playerState.hero.currentMana < attackCost) {
    return { error: 'Not enough mana', state };
  }

  // Calculate weapon damage
  let weaponDamage = playerState.hero.weaponDamage; // Base 2 + equipment bonuses
  let furyBonus = 0;

  // Add hero-specific bonuses
  if (heroName === 'barbarian') {
    furyBonus = playerState.hero.classResource.value; // Add ALL Fury
    weaponDamage += furyBonus;

    // If leveled, add Armor to damage
    if (isUpgraded && playerState.hero.leveled) {
      const armorBonus = playerState.hero.currentArmor;
      weaponDamage += armorBonus;
    }
  } else if (isUpgraded) {
    // Mage and Necromancer get +1 when upgraded
    if (heroName === 'mage' || heroName === 'necromancer') {
      weaponDamage += 1;
    } else if (heroName === 'rogue') {
      weaponDamage += 1;
    }
  }

  // Apply damage to target
  let targetDied = false;
  let damageBack = 0;

  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      hero: {
        ...playerState.hero,
        currentMana: playerState.hero.currentMana - attackCost,
        abilitiesUsedThisTurn: {
          ...playerState.hero.abilitiesUsedThisTurn,
          attack: true
        }
      }
    }
  };

  if (targetType === 'hero') {
    // Attack opponent hero
    newState[opponentId].hero.currentHealth -= weaponDamage;
    damageBack = state[opponentId].hero.weaponDamage; // Take damage from opponent's weapon
  } else {
    // Attack minion
    targetMinion.currentHealth -= weaponDamage;
    damageBack = targetMinion.attack;

    if (targetMinion.currentHealth <= 0) {
      targetDied = true;
    }

    // Update battlefield
    const newBattlefield = newState[opponentId].zones.battlefield.map(m => {
      if (m.instanceId === target) {
        return { ...m, currentHealth: m.currentHealth - weaponDamage };
      }
      return m;
    }).filter(m => m.currentHealth > 0);

    newState[opponentId].zones.battlefield = newBattlefield;

    // If minion died, move to discard
    if (targetDied) {
      newState[opponentId].zones.discard.push(targetMinion);

      // Gain bounty
      const bounty = targetMinion.bounty || 0;
      newState[playerId].hero.gold += bounty;
    }
  }

  // Apply damage back (unless Rogue upgraded killed target)
  const skipDamageBack = (heroName === 'rogue' && isUpgraded && targetDied);
  if (!skipDamageBack) {
    // Apply armor reduction
    const effectiveDamage = Math.max(0, damageBack - newState[playerId].hero.currentArmor);
    newState[playerId].hero.currentHealth -= effectiveDamage;
  }

  // Hero-specific effects
  if (heroName === 'barbarian') {
    // Spend ALL Fury
    newState[playerId].hero.classResource.value = 0;

    // Track weapon damage for level-up (Deal 15+ damage with Weapon Attacks)
    if (!newState[playerId].hero.leveled) {
      newState[playerId].hero.levelProgress += weaponDamage;

      if (newState[playerId].hero.levelProgress >= GAME_CONSTANTS.BARBARIAN_LEVEL_THRESHOLD) {
        newState[playerId].hero.leveled = true;
        // Upgrade abilities
        newState[playerId].hero.abilities.heroPower = getHeroPowerForHero(heroName, true);
        newState[playerId].hero.abilities.attack = getHeroAttackForHero(heroName, true);
        newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} leveled up! ${newState[playerId].hero.levelBonus}`);
      }
    }
  } else if (heroName === 'rogue') {
    // Break Stealth when taking damage from enemy hero attack
    if (targetType === 'hero' && damageBack > 0 && !skipDamageBack) {
      newState[playerId].hero.classResource.value = false;
    }
  } else if (heroName === 'necromancer' && targetDied) {
    // Raise minion if target died
    const raiseLimit = isUpgraded ? 3 : 2;
    // TODO: Implement Raise mechanic (need to show graveyard, let player pick minion)
    newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} can Raise a ${raiseLimit}-cost or less minion`);
  }

  // Log action
  const abilityName = newState[playerId].hero.abilities.attack.name;
  newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} used ${abilityName} for ${weaponDamage} damage${targetDied ? ' (killed)' : ''}${furyBonus > 0 ? ` (spent ${furyBonus} Fury)` : ''}`);

  // Check for win condition
  if (newState[opponentId].hero.currentHealth <= 0) {
    newState.gameOver = true;
    newState.winner = playerId;
    newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} wins!`);
  }

  if (newState[playerId].hero.currentHealth <= 0) {
    newState.gameOver = true;
    newState.winner = opponentId;
    newState = logAction(newState, `${opponentId === 'player' ? 'You' : 'AI'} wins!`);
  }

  return { state: newState, error: null };
}

/**
 * Declare attackers for combat
 * Minions must be untapped and not have summoning sickness
 */
export function declareAttackers(state, playerId, attackerIds) {
  // Validate
  if (state.currentPlayer !== playerId) {
    return { error: 'Not your turn', state };
  }

  if (state.phase !== 'main') {
    return { error: 'Can only declare attackers during main phase', state };
  }

  if (state.combat.active) {
    return { error: 'Combat already in progress', state };
  }

  const playerState = state[playerId];

  // Validate all attackers
  const attackers = [];
  for (const attackerId of attackerIds) {
    const minion = playerState.zones.battlefield.find(m => m.instanceId === attackerId);

    if (!minion) {
      return { error: `Minion ${attackerId} not found on battlefield`, state };
    }

    if (minion.tapped) {
      return { error: `${minion.name} is already tapped`, state };
    }

    if (minion.summoningSickness) {
      return { error: `${minion.name} has summoning sickness`, state };
    }

    attackers.push(minion);
  }

  // If no attackers, do nothing
  if (attackers.length === 0) {
    return { state, error: null };
  }

  // Tap all attackers
  const newBattlefield = playerState.zones.battlefield.map(minion => {
    if (attackerIds.includes(minion.instanceId)) {
      return { ...minion, tapped: true };
    }
    return minion;
  });

  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      zones: {
        ...playerState.zones,
        battlefield: newBattlefield
      }
    },
    combat: {
      active: true,
      phase: 'blocking', // Move to blocking phase
      attackers: attackers.map(a => ({ ...a, tapped: true })),
      blockers: {},
      damageOrder: {}
    }
  };

  newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} declared ${attackers.length} attacker(s)`);

  return { state: newState, error: null };
}

/**
 * Declare a blocker for an attacker
 * Blocker must be untapped
 */
export function declareBlocker(state, defenderId, blockerId, attackerId) {
  // Validate
  if (state.currentPlayer === defenderId) {
    return { error: 'Cannot block on your own turn', state };
  }

  if (!state.combat.active) {
    return { error: 'No combat in progress', state };
  }

  const defenderState = state[defenderId];

  // Find blocker
  const blocker = defenderState.zones.battlefield.find(m => m.instanceId === blockerId);
  if (!blocker) {
    return { error: 'Blocker not found', state };
  }

  if (blocker.tapped) {
    return { error: `${blocker.name} is tapped and cannot block`, state };
  }

  // Find attacker
  const attacker = state.combat.attackers.find(a => a.instanceId === attackerId);
  if (!attacker) {
    return { error: 'Attacker not found', state };
  }

  // Assign blocker to attacker (blockers do NOT tap when blocking)
  let newState = {
    ...state,
    combat: {
      ...state.combat,
      blockers: {
        ...state.combat.blockers,
        [attackerId]: blocker
      }
    }
  };

  newState = logAction(newState, `${blocker.name} blocks ${attacker.name}`);

  return { state: newState, error: null };
}

/**
 * Resolve combat damage
 * Blocked attackers deal damage to blockers
 * Unblocked attackers deal damage to defending hero
 */
export function resolveCombat(state) {
  if (!state.combat.active) {
    return { error: 'No combat in progress', state };
  }

  const attackerId = state.currentPlayer;
  const defenderId = attackerId === 'player' ? 'ai' : 'player';

  let newState = { ...state };

  // Process each attacker
  for (const attacker of state.combat.attackers) {
    const blocker = state.combat.blockers[attacker.instanceId];

    if (blocker) {
      // Blocked: Deal damage to each other
      const attackerDamage = attacker.attack || 0;
      const blockerDamage = blocker.attack || 0;

      // Damage blocker
      const updatedBlocker = {
        ...blocker,
        currentHealth: blocker.currentHealth - attackerDamage
      };

      // Damage attacker
      const updatedAttacker = {
        ...attacker,
        currentHealth: attacker.currentHealth - blockerDamage
      };

      // Update blocker on battlefield
      newState[defenderId].zones.battlefield = newState[defenderId].zones.battlefield.map(m => {
        if (m.instanceId === blocker.instanceId) {
          return updatedBlocker;
        }
        return m;
      });

      // Update attacker on battlefield
      newState[attackerId].zones.battlefield = newState[attackerId].zones.battlefield.map(m => {
        if (m.instanceId === attacker.instanceId) {
          return updatedAttacker;
        }
        return m;
      });

      newState = logAction(newState, `${attacker.name} dealt ${attackerDamage} to ${blocker.name}, ${blocker.name} dealt ${blockerDamage} back`);
    } else {
      // Unblocked: Deal damage to defending hero
      const damage = attacker.attack || 0;
      newState[defenderId].hero.currentHealth -= damage;
      newState = logAction(newState, `${attacker.name} dealt ${damage} damage to ${defenderId === 'player' ? 'You' : 'AI'}`);
    }
  }

  // Process deaths
  newState = processDeaths(newState, attackerId);
  newState = processDeaths(newState, defenderId);

  // Check win condition AFTER all damage (handles simultaneous death)
  const playerDead = newState.player.hero.currentHealth <= 0;
  const aiDead = newState.ai.hero.currentHealth <= 0;

  if (playerDead && aiDead) {
    newState.gameOver = true;
    newState.winner = 'draw';
    newState = logAction(newState, 'Both heroes died - DRAW!');
  } else if (playerDead) {
    newState.gameOver = true;
    newState.winner = 'ai';
    newState = logAction(newState, 'AI wins!');
  } else if (aiDead) {
    newState.gameOver = true;
    newState.winner = 'player';
    newState = logAction(newState, 'You win!');
  }

  // End combat
  newState.combat = {
    active: false,
    phase: null,
    attackers: [],
    blockers: {},
    damageOrder: {}
  };

  return { state: newState, error: null };
}

/**
 * Skip blocking phase and go straight to damage
 */
export function skipBlocking(state) {
  if (!state.combat.active) {
    return { error: 'No combat in progress', state };
  }

  if (state.combat.phase !== 'blocking') {
    return { error: 'Not in blocking phase', state };
  }

  // Just resolve combat immediately
  return resolveCombat(state);
}

/**
 * Process minion deaths and award bounties
 */
function processDeaths(state, playerId) {
  const playerState = state[playerId];
  const opponentId = playerId === 'player' ? 'ai' : 'player';

  // Find dead minions
  const alive = [];
  const dead = [];

  playerState.zones.battlefield.forEach(minion => {
    if (minion.currentHealth <= 0) {
      dead.push(minion);
    } else {
      alive.push(minion);
    }
  });

  if (dead.length === 0) {
    return state;
  }

  // Move dead minions to graveyard
  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      zones: {
        ...playerState.zones,
        battlefield: alive,
        graveyard: [...playerState.zones.graveyard, ...dead]
      }
    }
  };

  // Award bounties to opponent
  let totalBounty = 0;
  dead.forEach(minion => {
    const bounty = minion.bounty || 0;
    totalBounty += bounty;
    newState = logAction(newState, `${minion.name} died`);
  });

  if (totalBounty > 0) {
    newState[opponentId].hero.gold += totalBounty;
    newState = logAction(newState, `${opponentId === 'player' ? 'You' : 'AI'} gained ${totalBounty} gold`);
  }

  return newState;
}

/**
 * Necromancer: Raise a minion from graveyard
 */
export function raiseMinion(state, playerId, minionInstanceId) {
  const playerState = state[playerId];

  // Validate
  if (state.currentPlayer !== playerId) {
    return { error: 'Not your turn', state };
  }

  if (state.phase !== 'main') {
    return { error: 'Can only raise during main phase', state };
  }

  if (playerState.hero.name.toLowerCase() !== 'necromancer') {
    return { error: 'Only Necromancer can raise minions', state };
  }

  // Find minion in graveyard
  const minion = playerState.zones.graveyard.find(m => m.instanceId === minionInstanceId);
  if (!minion) {
    return { error: 'Minion not found in graveyard', state };
  }

  // Remove from graveyard
  const newGraveyard = playerState.zones.graveyard.filter(m => m.instanceId !== minionInstanceId);

  // Restore to full health and add to battlefield
  const raisedMinion = {
    ...minion,
    currentHealth: minion.health,
    tapped: !playerState.hero.leveled, // Leveled necromancer raises untapped
    summoningSickness: !playerState.hero.leveled
  };

  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      zones: {
        ...playerState.zones,
        graveyard: newGraveyard,
        battlefield: [...playerState.zones.battlefield, raisedMinion]
      }
    }
  };

  // Track level progress (Raise 5 minions)
  if (!newState[playerId].hero.leveled) {
    newState[playerId].hero.levelProgress += 1;

    if (newState[playerId].hero.levelProgress >= GAME_CONSTANTS.NECROMANCER_LEVEL_THRESHOLD) {
      newState[playerId].hero.leveled = true;
      // Upgrade abilities
      const heroName = newState[playerId].hero.name;
      newState[playerId].hero.abilities.heroPower = getHeroPowerForHero(heroName, true);
      newState[playerId].hero.abilities.attack = getHeroAttackForHero(heroName, true);
      newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} leveled up! ${newState[playerId].hero.levelBonus}`);
    }
  }

  newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} raised ${minion.name} from the dead!`);

  return { state: newState, error: null };
}

/**
 * Necromancer: Sacrifice a minion (gain 1 mana)
 */
export function sacrificeMinion(state, playerId, minionInstanceId) {
  const playerState = state[playerId];

  // Validate
  if (state.currentPlayer !== playerId) {
    return { error: 'Not your turn', state };
  }

  if (state.phase !== 'main') {
    return { error: 'Can only sacrifice during main phase', state };
  }

  if (playerState.hero.name.toLowerCase() !== 'necromancer') {
    return { error: 'Only Necromancer can sacrifice minions', state };
  }

  // Find minion on battlefield
  const minion = playerState.zones.battlefield.find(m => m.instanceId === minionInstanceId);
  if (!minion) {
    return { error: 'Minion not found on battlefield', state };
  }

  // Remove from battlefield, add to graveyard
  const newBattlefield = playerState.zones.battlefield.filter(m => m.instanceId !== minionInstanceId);
  const newGraveyard = [...playerState.zones.graveyard, minion];

  // Gain 1 mana
  const newMana = Math.min(playerState.hero.currentMana + 1, playerState.hero.maxMana);

  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      hero: {
        ...playerState.hero,
        currentMana: newMana
      },
      zones: {
        ...playerState.zones,
        battlefield: newBattlefield,
        graveyard: newGraveyard
      }
    }
  };

  newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} sacrificed ${minion.name} for 1 mana`);

  return { state: newState, error: null };
}

/**
 * Purchase equipment from shop
 */
export function purchaseEquipment(state, playerId, equipmentInstanceId) {
  const playerState = state[playerId];

  // Validate
  if (state.currentPlayer !== playerId) {
    return { error: 'Not your turn', state };
  }

  if (playerState.hero.abilitiesUsedThisTurn.shopPurchase) {
    return { error: 'Already purchased this turn', state };
  }

  // Find equipment in shop
  const equipment = state.shop.market.find(item => item.instanceId === equipmentInstanceId);
  if (!equipment) {
    return { error: 'Equipment not found in shop', state };
  }

  // Check gold
  if (playerState.hero.gold < equipment.cost) {
    return { error: 'Not enough gold', state };
  }

  // Check slot
  const slot = equipment.slot.toLowerCase();
  const validSlots = ['weapon', 'chest', 'jewelry', 'relic'];
  if (!validSlots.includes(slot)) {
    return { error: `Invalid equipment slot: ${slot}`, state };
  }

  // Remove from shop
  const newMarket = state.shop.market.filter(item => item.instanceId !== equipmentInstanceId);

  // Replace with new item from deck
  const currentTier = state.shop.currentTier;
  let deckKey = currentTier === 'early' ? 'earlyDeck' : currentTier === 'mid' ? 'midDeck' : 'lateDeck';
  const deck = [...state.shop[deckKey]];

  if (deck.length > 0) {
    newMarket.push(createEquipmentInstance(deck.shift()));
  }

  let newState = {
    ...state,
    [playerId]: {
      ...playerState,
      hero: {
        ...playerState.hero,
        gold: playerState.hero.gold - equipment.cost,
        equipment: {
          ...playerState.hero.equipment,
          [slot]: equipment
        },
        abilitiesUsedThisTurn: {
          ...playerState.hero.abilitiesUsedThisTurn,
          shopPurchase: true
        }
      }
    },
    shop: {
      ...state.shop,
      market: newMarket,
      [deckKey]: deck
    }
  };

  // Apply equipment effects
  newState = applyEquipmentEffects(newState, playerId, equipment, slot);
  newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} purchased ${equipment.name} for ${equipment.cost} gold`);

  // Rogue level-up: Track gold spent (Spend 15 gold)
  if (newState[playerId].hero.name.toLowerCase() === 'rogue' && !newState[playerId].hero.leveled) {
    // Initialize goldSpent tracker if it doesn't exist
    if (!newState[playerId].hero.goldSpent) {
      newState[playerId].hero.goldSpent = 0;
    }

    newState[playerId].hero.goldSpent += equipment.cost;
    newState[playerId].hero.levelProgress = newState[playerId].hero.goldSpent;

    if (newState[playerId].hero.goldSpent >= GAME_CONSTANTS.ROGUE_LEVEL_THRESHOLD) {
      newState[playerId].hero.leveled = true;
      // Upgrade abilities
      const heroName = newState[playerId].hero.name;
      newState[playerId].hero.abilities.heroPower = getHeroPowerForHero(heroName, true);
      newState[playerId].hero.abilities.attack = getHeroAttackForHero(heroName, true);
      newState = logAction(newState, `${playerId === 'player' ? 'You' : 'AI'} leveled up! ${newState[playerId].hero.levelBonus}`);
    }
  }

  return { state: newState, error: null };
}

/**
 * Apply equipment effects to hero
 */
function applyEquipmentEffects(state, playerId, equipment, slot) {
  let newState = { ...state };
  const effect = (equipment.effect || '').toLowerCase();

  // Parse and apply stat bonuses
  // Format examples: "+2 max health", "+1 armor", "+3 attack"

  // Max Health
  const healthMatch = effect.match(/\+(\d+) (?:max )?health/);
  if (healthMatch) {
    const bonus = parseInt(healthMatch[1]);
    newState[playerId].hero.maxHealth += bonus;
    newState[playerId].hero.currentHealth += bonus;
    newState = logAction(newState, `Gained +${bonus} max health`);
  }

  // Armor
  const armorMatch = effect.match(/\+(\d+) armor/);
  if (armorMatch) {
    const bonus = parseInt(armorMatch[1]);
    newState[playerId].hero.currentArmor = Math.min(
      newState[playerId].hero.currentArmor + bonus,
      10 // Max armor is 10
    );
    newState = logAction(newState, `Gained +${bonus} armor`);
  }

  // Weapon Damage (from weapon equipment)
  const weaponMatch = effect.match(/\+(\d+) (?:weapon )?(?:damage|attack)/);
  if (weaponMatch && slot === 'weapon') {
    const bonus = parseInt(weaponMatch[1]);
    newState[playerId].hero.weaponDamage += bonus;
    newState = logAction(newState, `Weapon damage increased to ${newState[playerId].hero.weaponDamage}`);
  }

  // Mana
  const manaMatch = effect.match(/\+(\d+) (?:max )?mana/);
  if (manaMatch) {
    const bonus = parseInt(manaMatch[1]);
    newState[playerId].hero.maxMana = Math.min(newState[playerId].hero.maxMana + bonus, GAME_CONSTANTS.MAX_MANA);
    newState = logAction(newState, `Gained +${bonus} max mana`);
  }

  return newState;
}

/**
 * Refresh shop to next tier
 */
export function refreshShop(state) {
  const currentTier = state.shop.currentTier;

  let newTier = currentTier;
  let deckKey = 'earlyDeck';

  if (state.roundNumber >= 9) {
    newTier = 'late';
    deckKey = 'lateDeck';
  } else if (state.roundNumber >= 5) {
    newTier = 'mid';
    deckKey = 'midDeck';
  } else {
    newTier = 'early';
    deckKey = 'earlyDeck';
  }

  // If tier changed, draw new market
  if (newTier !== currentTier) {
    const deck = [...state.shop[deckKey]];
    const newMarket = [];

    for (let i = 0; i < GAME_CONSTANTS.SHOP_SIZE && deck.length > 0; i++) {
      newMarket.push(deck.shift());
    }

    let newState = {
      ...state,
      shop: {
        ...state.shop,
        currentTier: newTier,
        market: newMarket,
        [deckKey]: deck
      }
    };

    newState = logAction(newState, `Shop refreshed to ${newTier} tier!`);
    return newState;
  }

  return state;
}


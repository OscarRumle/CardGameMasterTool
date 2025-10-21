// ECONOMY SIMULATION ASSUMPTIONS (MVP):
// 1. Simulate rounds 1-12 (early to mid game)
// 2. Minions die 1 turn after being played (75% chance)
// 3. Opening hand = 4 cards + 1 draw per turn
// 4. No mulligan optimization (simplified draw calc)
// 5. Standard mana progression: Turn X = X max mana
// 6. Passive gold gain per round (configurable)
// 7. Tier availability:
//    - Tier 1: Rounds 1-4
//    - Tier 2: Rounds 5-8
//    - Tier 3: Rounds 9+
//    - Old tiers become unavailable when new tier unlocks

/**
 * Calculate probability of drawing at least one copy of a card by turn X
 * Uses hypergeometric distribution approximation
 */
function calculateDrawProbability(deckSize, copies, cardsSeen) {
  if (copies === 0 || deckSize === 0) return 0;
  if (cardsSeen >= deckSize) return 1;

  // P(at least 1) = 1 - P(none)
  let probNone = 1;
  for (let i = 0; i < cardsSeen; i++) {
    probNone *= (deckSize - copies - i) / (deckSize - i);
  }

  return 1 - probNone;
}

/**
 * Get which shop tier is available for a given round
 */
export function getAvailableTier(round) {
  if (round >= 1 && round <= 4) return 1;
  if (round >= 5 && round <= 8) return 2;
  if (round >= 9) return 3;
  return 1; // Default to tier 1
}

/**
 * Filter equipment items by available tier for a round
 */
export function getAffordableItems(equipmentDeck, goldAvailable, round) {
  if (!equipmentDeck?.cards) return [];

  const availableTier = getAvailableTier(round);

  // Deduplicate equipment cards by Item Name
  const uniqueItemsMap = new Map();
  equipmentDeck.cards.forEach(card => {
    const itemName = card['Item Name'];
    const tier = card.Tier || 1;
    const cost = card.Cost || 0;

    if (itemName && tier === availableTier && cost <= goldAvailable) {
      if (!uniqueItemsMap.has(itemName)) {
        uniqueItemsMap.set(itemName, {
          name: itemName,
          cost: cost,
          tier: tier,
          slot: card.Slot || 'Unknown',
          effect: card.Effect || ''
        });
      }
    }
  });

  // Sort by cost (ascending)
  return Array.from(uniqueItemsMap.values()).sort((a, b) => a.cost - b.cost);
}

/**
 * Simulate gold accumulation over rounds
 * @param {Object} heroDeck - The hero's deck
 * @param {Object} opponentDeck - The opponent's deck
 * @param {Object} params - Simulation parameters
 * @returns {Array} Array of {round, cumulativeGold, goldGained, affordableItems}
 */
export function simulateGoldGain(heroDeck, opponentDeck, equipmentDeck, params = {}) {
  const {
    maxRounds = 12,
    passiveGoldPerRound = 0,
    minionDeathRate = 0.75
  } = params;

  if (!heroDeck || !opponentDeck) return [];

  // Get opponent's deck analysis (minionPool)
  const opponentMinions = [];
  const deckSize = 40; // Standard deck size

  // Build minion pool from opponent deck
  if (opponentDeck.cards) {
    const uniqueMinionsMap = new Map();
    opponentDeck.cards.forEach(card => {
      const cardName = card['Card Name'];
      const cardType = card['Card Type'];

      if (cardType === 'Minion' && cardName) {
        if (!uniqueMinionsMap.has(cardName)) {
          const cost = card['Mana Cost'] || 0;
          const bountyStr = String(card.Bounty || '0g');
          const bountyValue = parseInt(bountyStr.replace(/[^0-9]/g, '')) || 0;
          const copies = card.Copies || 1;

          uniqueMinionsMap.set(cardName, {
            name: cardName,
            cost,
            bounty: bountyValue,
            copies
          });
        }
      }
    });

    opponentMinions.push(...Array.from(uniqueMinionsMap.values()));
  }

  const results = [];
  let cumulativeGold = 0;

  for (let round = 1; round <= maxRounds; round++) {
    // Add passive gold
    cumulativeGold += passiveGoldPerRound;

    // Calculate gold from opponent minions that could have been played last turn
    let goldGainedThisRound = passiveGoldPerRound;

    if (round > 1) {
      const previousTurnMana = round - 1;
      const cardsSeen = 4 + round; // Opening hand + draws

      opponentMinions.forEach(minion => {
        // Could opponent have played this minion last turn?
        if (minion.cost <= previousTurnMana) {
          const drawProb = calculateDrawProbability(deckSize, minion.copies, cardsSeen);
          const expectedGold = minion.bounty * drawProb * minionDeathRate;
          goldGainedThisRound += expectedGold;
          cumulativeGold += expectedGold;
        }
      });
    }

    // Get affordable items for this round
    const affordableItems = equipmentDeck
      ? getAffordableItems(equipmentDeck, cumulativeGold, round)
      : [];

    results.push({
      round,
      cumulativeGold: Math.round(cumulativeGold * 10) / 10, // Round to 1 decimal
      goldGained: Math.round(goldGainedThisRound * 10) / 10,
      affordableItems,
      availableTier: getAvailableTier(round)
    });
  }

  return results;
}

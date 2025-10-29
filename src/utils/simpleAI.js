// Simple AI - Makes basic legal moves
import { playCard, useHeroPower, useHeroAttack, endTurn, canPlayCard, declareAttackers, resolveCombat, purchaseEquipment, declareBlocker, confirmBlockers, setDamageOrder, confirmDamageOrders, GAME_CONSTANTS } from './gameEngine';

/**
 * AI takes its turn
 * Returns updated game state after AI actions
 */
export function aiTakeTurn(initialState) {
  let state = { ...initialState };
  let actionsPerformed = 0;
  const maxActions = 10; // Prevent infinite loops

  console.log('AI turn starting...');

  // Validate it's actually AI's turn
  if (state.currentPlayer !== 'ai') {
    console.error('AI attempted to take turn when not current player');
    return state;
  }

  // Validate game is not over
  if (state.gameOver) {
    console.error('AI attempted to take turn after game over');
    return state;
  }

  // Keep taking actions until we can't do anything useful
  while (actionsPerformed < maxActions) {
    let actionTaken = false;

    // Try to play a card
    const playableCards = state.ai.zones.hand.filter(card => {
      const validation = canPlayCard(state, 'ai', card);
      return validation.valid;
    });

    if (playableCards.length > 0) {
      // Play the first playable card
      const cardToPlay = playableCards[0];
      const result = playCard(state, 'ai', cardToPlay);

      if (!result.error) {
        state = result.state;
        actionTaken = true;
        actionsPerformed++;
        console.log(`AI played: ${cardToPlay.name}`);
      }
    }

    // If no cards played, try hero power (but check if safe first)
    if (!actionTaken && !state.ai.hero.abilitiesUsedThisTurn.heroPower) {
      // Safety check for Necromancer Dark Pact
      const heroName = state.ai.hero.name.toLowerCase();
      const shouldUseHeroPower = !(
        heroName === 'necromancer' &&
        state.ai.hero.currentHealth <= GAME_CONSTANTS.DARK_PACT_HP_COST
      );

      if (shouldUseHeroPower) {
        const powerResult = useHeroPower(state, 'ai');

        if (!powerResult.error) {
          state = powerResult.state;
          actionTaken = true;
          actionsPerformed++;
          console.log('AI used hero power');
        }
      }
    }

    // If still no action, try hero attack
    if (!actionTaken && !state.ai.hero.abilitiesUsedThisTurn.attack) {
      const attackResult = useHeroAttack(state, 'ai');

      if (!attackResult.error) {
        state = attackResult.state;
        actionTaken = true;
        actionsPerformed++;
        console.log('AI used hero attack');
      }
    }

    // If no action was taken, break the loop
    if (!actionTaken) {
      break;
    }
  }

  console.log(`AI performed ${actionsPerformed} actions`);

  // Try to purchase equipment if we have gold and haven't purchased yet
  if (!state.ai.hero.abilitiesUsedThisTurn.shopPurchase && state.ai.hero.gold > 0) {
    // Validate shop exists and has items
    if (state.shop && state.shop.market && Array.isArray(state.shop.market)) {
      const affordableItems = state.shop.market.filter(item => {
        const cost = parseInt(item.cost);
        return !isNaN(cost) && cost > 0 && cost <= state.ai.hero.gold;
      });

      if (affordableItems.length > 0) {
        // Buy the most expensive affordable item
        affordableItems.sort((a, b) => b.cost - a.cost);
        const itemToBuy = affordableItems[0];

        const purchaseResult = purchaseEquipment(state, 'ai', itemToBuy.instanceId);
        if (!purchaseResult.error) {
          state = purchaseResult.state;
          console.log(`AI purchased: ${itemToBuy.name}`);
        } else {
          console.log(`AI purchase failed: ${purchaseResult.error}`);
        }
      }
    }
  }

  // Try to attack with all available minions
  if (!state.combat.active) {
    // Validate battlefield exists
    if (state.ai && state.ai.zones && Array.isArray(state.ai.zones.battlefield)) {
      const availableAttackers = state.ai.zones.battlefield.filter(minion => {
        // Validate minion has required fields
        return minion &&
               minion.instanceId &&
               !minion.tapped &&
               !minion.summoningSickness;
      }).map(m => m.instanceId);

      if (availableAttackers.length > 0) {
        console.log(`AI declaring ${availableAttackers.length} attackers`);
        const attackResult = declareAttackers(state, 'ai', availableAttackers);

        if (!attackResult.error) {
          state = attackResult.state;
          console.log('AI attacks declared');
        } else {
          console.log(`AI attack failed: ${attackResult.error}`);
        }
      }
    }
  }

  // Handle blocking if being attacked
  if (state.combat.active && state.combat.phase === 'blocking' && state.currentPlayer !== 'ai') {
    console.log('AI is being attacked, making blocking decisions');

    // Get available blockers (untapped minions) - Create immutable copy
    let availableBlockers = state.ai.zones.battlefield.filter(minion => !minion.tapped);

    // Sort attackers by attack power (block biggest threats)
    const sortedAttackers = [...state.combat.attackers].sort((a, b) => (b.attack || 0) - (a.attack || 0));

    // Assign blockers to biggest attackers
    // Simple strategy: assign 1 blocker per attacker, prioritizing biggest threats
    // Could gang up on big attackers in the future for smarter AI
    for (const attacker of sortedAttackers) {
      if (availableBlockers.length === 0) break;

      const attackerDamage = attacker.attack || 0;
      const currentBlockers = state.combat.blockers[attacker.instanceId] || [];

      // Find a suitable blocker (prefer minions that can survive or trade favorably)
      const blocker = availableBlockers.find(minion => {
        const minionHealth = minion.currentHealth || minion.health;
        // Block if we can survive OR if we're going to die anyway (trade)
        return minionHealth > attackerDamage || minionHealth <= attackerDamage;
      });

      if (blocker) {
        const blockResult = declareBlocker(state, 'ai', blocker.instanceId, attacker.instanceId);
        if (!blockResult.error) {
          state = blockResult.state;
          console.log(`AI blocked ${attacker.name} with ${blocker.name}`);

          // Remove blocker from available list (IMMUTABLE - use filter instead of splice)
          availableBlockers = availableBlockers.filter(m => m.instanceId !== blocker.instanceId);
        }
      }
    }

    // Done blocking, confirm blockers
    const confirmResult = confirmBlockers(state, 'ai');
    if (!confirmResult.error) {
      state = confirmResult.state;
      console.log('AI confirmed blockers');
    } else {
      console.log(`AI confirm blockers failed: ${confirmResult.error}`);
    }
  }

  // Handle damage order if AI is attacking and has multi-blocked attackers
  if (state.combat.active && state.combat.phase === 'damage_order' && state.currentPlayer === 'ai') {
    console.log('AI setting damage orders for multi-blocked attackers');

    // For each attacker with multiple blockers, set damage order
    for (const attacker of state.combat.attackers) {
      const blockers = state.combat.blockers[attacker.instanceId] || [];

      if (blockers.length > 1) {
        // Simple strategy: order by lowest health first (kill as many as possible)
        const orderedBlockers = [...blockers].sort((a, b) =>
          (a.currentHealth || a.health) - (b.currentHealth || b.health)
        );
        const orderedIds = orderedBlockers.map(b => b.instanceId);

        const orderResult = setDamageOrder(state, 'ai', attacker.instanceId, orderedIds);
        if (!orderResult.error) {
          state = orderResult.state;
          console.log(`AI set damage order for ${attacker.name}`);
        } else {
          console.log(`AI damage order failed: ${orderResult.error}`);
        }
      }
    }

    // Confirm all damage orders
    const confirmResult = confirmDamageOrders(state, 'ai');
    if (!confirmResult.error) {
      state = confirmResult.state;
      console.log('AI confirmed damage orders');
    } else {
      console.log(`AI confirm damage orders failed: ${confirmResult.error}`);
    }
  }

  // End AI turn
  state = endTurn(state);

  return state;
}

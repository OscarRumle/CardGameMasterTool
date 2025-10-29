// Simple AI - Makes basic legal moves
import { playCard, useHeroPower, useHeroAttack, endTurn, canPlayCard, declareAttackers, resolveCombat, purchaseEquipment, declareBlocker, skipBlocking, GAME_CONSTANTS } from './gameEngine';

/**
 * AI takes its turn
 * Returns updated game state after AI actions
 */
export function aiTakeTurn(initialState) {
  let state = { ...initialState };
  let actionsPerformed = 0;
  const maxActions = 10; // Prevent infinite loops

  console.log('AI turn starting...');

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
    const affordableItems = state.shop.market.filter(item => item.cost <= state.ai.hero.gold);
    if (affordableItems.length > 0) {
      // Buy the most expensive affordable item
      affordableItems.sort((a, b) => b.cost - a.cost);
      const itemToBuy = affordableItems[0];

      const purchaseResult = purchaseEquipment(state, 'ai', itemToBuy.instanceId);
      if (!purchaseResult.error) {
        state = purchaseResult.state;
        console.log(`AI purchased: ${itemToBuy.name}`);
      }
    }
  }

  // Try to attack with all available minions
  if (!state.combat.active) {
    const availableAttackers = state.ai.zones.battlefield.filter(minion => {
      return !minion.tapped && !minion.summoningSickness;
    }).map(m => m.instanceId);

    if (availableAttackers.length > 0) {
      console.log(`AI declaring ${availableAttackers.length} attackers`);
      const attackResult = declareAttackers(state, 'ai', availableAttackers);

      if (!attackResult.error) {
        state = attackResult.state;
        console.log('AI attacks declared');
      }
    }
  }

  // Handle blocking if being attacked
  if (state.combat.active && state.combat.phase === 'blocking' && state.currentPlayer !== 'ai') {
    console.log('AI is being attacked, making blocking decisions');

    // Get available blockers (untapped minions)
    const availableBlockers = state.ai.zones.battlefield.filter(minion => !minion.tapped);

    // Sort attackers by attack power (block biggest threats)
    const sortedAttackers = [...state.combat.attackers].sort((a, b) => (b.attack || 0) - (a.attack || 0));

    // Assign blockers to biggest attackers
    for (const attacker of sortedAttackers) {
      if (availableBlockers.length === 0) break;

      // Skip if already blocked
      if (state.combat.blockers[attacker.instanceId]) continue;

      // Find a suitable blocker (prefer minions that can survive or trade favorably)
      const blocker = availableBlockers.find(minion => {
        const minionHealth = minion.currentHealth || minion.health;
        const attackerDamage = attacker.attack || 0;
        // Block if we can survive OR if we're going to die anyway (trade)
        return minionHealth > attackerDamage || minionHealth <= attackerDamage;
      });

      if (blocker) {
        const blockResult = declareBlocker(state, 'ai', blocker.instanceId, attacker.instanceId);
        if (!blockResult.error) {
          state = blockResult.state;
          console.log(`AI blocked ${attacker.name} with ${blocker.name}`);

          // Remove blocker from available list
          const blockerIndex = availableBlockers.findIndex(m => m.instanceId === blocker.instanceId);
          if (blockerIndex !== -1) {
            availableBlockers.splice(blockerIndex, 1);
          }
        }
      }
    }

    // Done blocking, resolve combat
    const skipResult = skipBlocking(state);
    if (!skipResult.error) {
      state = skipResult.state;
      console.log('AI finished blocking, combat resolved');
    }
  }

  // End AI turn
  state = endTurn(state);

  return state;
}

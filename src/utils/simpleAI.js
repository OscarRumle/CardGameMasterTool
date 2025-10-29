// Simple AI - Makes basic legal moves
import { playCard, useHeroPower, useHeroAttack, endTurn, canPlayCard, GAME_CONSTANTS } from './gameEngine';

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

  // End AI turn
  state = endTurn(state);

  return state;
}

export const analyzeDeck = (deck, keywords) => {
  if (!deck?.cards) return null;

  // CRITICAL: Deduplicate by card name
  const uniqueCardsMap = new Map();
  deck.cards.forEach(card => {
    const cardName = card['Card Name'] || card['Item Name'];
    if (cardName && !uniqueCardsMap.has(cardName)) {
      uniqueCardsMap.set(cardName, card);
    }
  });

  const uniqueCards = Array.from(uniqueCardsMap.values());

  const manaCurve = {};
  const minionManaCurve = {};
  const spellManaCurve = {};

  uniqueCards.forEach(card => {
    const cost = card['Mana Cost'] || 0;
    const copies = card.Copies || 1;
    const cardType = card['Card Type'];

    manaCurve[cost] = (manaCurve[cost] || 0) + copies;
    if (cardType === 'Minion') minionManaCurve[cost] = (minionManaCurve[cost] || 0) + copies;
    if (cardType === 'Spell') spellManaCurve[cost] = (spellManaCurve[cost] || 0) + copies;
  });

  const spellCount = uniqueCards.reduce((sum, card) =>
    sum + (card['Card Type'] === 'Spell' ? (card.Copies || 1) : 0), 0);
  const minionCount = uniqueCards.reduce((sum, card) =>
    sum + (card['Card Type'] === 'Minion' ? (card.Copies || 1) : 0), 0);

  let totalAttack = 0, totalHealth = 0, totalMinionGold = 0;

  // Build minion pool for economy simulation
  const minionPool = [];
  uniqueCards.forEach(card => {
    if (card['Card Type'] === 'Minion') {
      const copies = card.Copies || 1;
      const cost = card['Mana Cost'] || 0;
      const bountyStr = String(card.Bounty || '0g');
      const bountyValue = parseInt(bountyStr.replace(/[^0-9]/g, '')) || 0;

      totalAttack += (card.Attack || 0) * copies;
      totalHealth += (card.Health || 0) * copies;
      totalMinionGold += bountyValue * copies;

      // Add each copy to pool for simulation
      for (let i = 0; i < copies; i++) {
        minionPool.push({ cost, bounty: bountyValue });
      }
    }
  });

  let keywordCards = 0, nonKeywordCards = 0;
  uniqueCards.forEach(card => {
    const effect = card.Effect || '';
    const copies = card.Copies || 1;
    const hasKeyword = keywords.some(keyword =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(effect)
    );
    hasKeyword ? keywordCards += copies : nonKeywordCards += copies;
  });

  return {
    manaCurve,
    minionManaCurve,
    spellManaCurve,
    spellCount,
    minionCount,
    totalAttack,
    totalHealth,
    totalMinionGold,
    uniqueCards: uniqueCards.length,
    keywordCards,
    nonKeywordCards,
    totalCards: uniqueCards.reduce((sum, card) => sum + (card.Copies || 1), 0),
    minionPool
  };
};

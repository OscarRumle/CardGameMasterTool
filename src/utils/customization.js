export const getDefaultCustomization = (type) => {
  if (type === 'equipment') {
    return {
      weapon: { color: '#D97706' },
      chest: { color: '#6B7280' },
      jewelry: { color: '#7C3AED' },
      relic: { color: '#2563EB' },
      consumable: { color: '#059669' },
      font: 'Arial, sans-serif'
    };
  }
  return {
    minion: { color: '#059669' },
    spell: { color: '#2563EB' },
    upgrade: { color: '#7C3AED' },
    ultimate: { color: '#DC2626' },
    font: 'Arial, sans-serif'
  };
};

export const applyKeywordBolding = (text, keywords) => {
  if (!text || keywords.length === 0) return text;
  let result = String(text);
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    result = result.replace(regex, `<strong>${keyword}</strong>`);
  });
  return result;
};

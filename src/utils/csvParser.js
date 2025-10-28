import Papa from 'papaparse';

// Normalized field mapping to handle any header order or variations
const FIELD_MAPPINGS = {
  'Card Name': ['Card Name', 'CardName', 'Name', 'card name'],
  'Mana Cost': ['Mana Cost', 'ManaCost', 'Cost', 'mana cost', 'Mana'],
  'Card Type': ['Card Type', 'CardType', 'Type', 'card type'],
  'Attack': ['Attack', 'ATK', 'attack'],
  'Health': ['Health', 'HP', 'health'],
  'Bounty': ['Bounty', 'bounty', 'Gold'],
  'Effect': ['Effect', 'effect', 'Text', 'Description'],
  'Copies': ['Copies', 'copies', 'Qty', 'Quantity'],
  'State': ['State', 'state', 'Status'],
  'Upgrade Slot': ['Upgrade Slot', 'UpgradeSlot', 'Slot', 'upgrade slot']
};

// Find the actual header name from the CSV that matches our expected field
const findHeaderMatch = (headers, expectedField) => {
  const possibleNames = FIELD_MAPPINGS[expectedField] || [expectedField];
  return headers.find(header =>
    possibleNames.some(name =>
      header.trim().toLowerCase() === name.toLowerCase()
    )
  );
};

// Normalize a card object to use standard field names
const normalizeCard = (row, headers) => {
  const normalized = {};

  Object.keys(FIELD_MAPPINGS).forEach(standardField => {
    const actualHeader = findHeaderMatch(headers, standardField);
    if (actualHeader && row[actualHeader] !== undefined) {
      normalized[standardField] = row[actualHeader];
    }
  });

  // Include any additional fields that weren't mapped
  Object.keys(row).forEach(key => {
    if (!Object.values(FIELD_MAPPINGS).flat().some(mapping =>
      mapping.toLowerCase() === key.trim().toLowerCase()
    )) {
      normalized[key] = row[key];
    }
  });

  return normalized;
};

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const parsedCards = results.data.map((row, idx) => ({
          ...normalizeCard(row, headers),
          id: `${Date.now()}-${idx}`
        }));
        resolve(parsedCards);
      },
      error: (error) => reject(error)
    });
  });
};

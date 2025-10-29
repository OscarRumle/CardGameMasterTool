// Load sample decks from the sample-data directory

const SAMPLE_DECKS = [
  {
    name: 'Barbarian Deck (Sample)',
    type: 'hero',
    path: '/hero-barbarian.csv',
    isSample: true
  },
  {
    name: 'Mage Deck (Sample)',
    type: 'hero',
    path: '/hero-mage.csv',
    isSample: true
  },
  {
    name: 'Necromancer Deck (Sample)',
    type: 'hero',
    path: '/hero-necromancer.csv',
    isSample: true
  },
  {
    name: 'Rogue Deck (Sample)',
    type: 'hero',
    path: '/hero-rogue.csv',
    isSample: true
  },
  {
    name: 'Equipment Shop (Sample)',
    type: 'equipment',
    path: '/equipment-starter-shop.csv',
    isSample: true
  }
];

/**
 * Load sample decks and add them to localStorage if they don't exist
 */
export async function loadSampleDecks(parseCSV, existingDecks) {
  console.log('Loading sample decks...');

  const newSampleDecks = [];

  for (const sampleDeck of SAMPLE_DECKS) {
    // Check if this sample deck already exists
    const exists = existingDecks.some(deck =>
      deck.name === sampleDeck.name && deck.isSample
    );

    if (!exists) {
      try {
        console.log(`Fetching ${sampleDeck.name}...`);

        // Fetch the CSV file
        const response = await fetch(sampleDeck.path);

        if (!response.ok) {
          console.warn(`Could not load ${sampleDeck.name}: ${response.statusText}`);
          continue;
        }

        const csvText = await response.text();

        // Convert text to File-like object for parseCSV
        const blob = new Blob([csvText], { type: 'text/csv' });
        const file = new File([blob], sampleDeck.name + '.csv', { type: 'text/csv' });

        // Parse the CSV
        const cards = await parseCSV(file);

        console.log(`Loaded ${cards.length} cards from ${sampleDeck.name}`);

        // Create deck object
        const deck = {
          id: Date.now() + Math.random(), // Unique ID
          name: sampleDeck.name,
          type: sampleDeck.type,
          cards: cards,
          customization: getDefaultCustomization(sampleDeck.type),
          createdAt: new Date().toISOString(),
          isSample: true // Mark as sample deck
        };

        newSampleDecks.push(deck);

      } catch (error) {
        console.error(`Error loading ${sampleDeck.name}:`, error);
      }
    } else {
      console.log(`${sampleDeck.name} already exists, skipping`);
    }
  }

  console.log(`Loaded ${newSampleDecks.length} new sample decks`);
  return newSampleDecks;
}

// Default customization based on deck type
function getDefaultCustomization(type) {
  if (type === 'hero') {
    return {
      backgroundColor: '#1a1a1a',
      borderColor: '#d97706',
      textColor: '#ffffff'
    };
  } else if (type === 'equipment') {
    return {
      backgroundColor: '#1a1a1a',
      borderColor: '#f59e0b',
      textColor: '#ffffff'
    };
  }

  return {
    backgroundColor: '#1a1a1a',
    borderColor: '#666666',
    textColor: '#ffffff'
  };
}

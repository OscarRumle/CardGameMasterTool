# Card Game Master Tool

A React-based web application for designing and balancing physical card game decks. Upload CSV files of card data, generate print-ready card layouts, and analyze deck balance with comprehensive analytics.

## Features

- **Card Generation & Export**: Upload CSVs → Generate 63mm × 88mm poker-sized cards → Export as A4 print layouts
- **Deck Management**: Create and manage multiple hero decks and equipment decks
- **Print Export**: Download printable HTML files or direct print with cut guides
- **Balancing Analytics**: Side-by-side deck comparison with mana curves, minion stats, and economy analysis
- **Text Customization**: Keyword bolding and dynamic font sizing
- **Persistent Storage**: All decks saved in localStorage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173` when running `npm run dev`.

## Project Structure

```
src/
├── components/
│   ├── cards/              # Card rendering components
│   │   ├── ClassCard.jsx
│   │   ├── EquipmentCard.jsx
│   │   ├── MTGCard.jsx
│   │   └── AutoSizeEffectText.jsx
│   ├── tabs/               # Main tab views
│   │   ├── HomeTab.jsx
│   │   ├── MyDecksTab.jsx
│   │   ├── DeckViewTab.jsx
│   │   ├── ExportTab.jsx
│   │   ├── BalancingTab.jsx
│   │   └── TextTweaksTab.jsx
│   ├── modals/             # Modal dialogs
│   │   ├── CreateDeckModal.jsx
│   │   ├── CustomizeModal.jsx
│   │   └── DeleteConfirmModal.jsx
│   ├── balancing/          # Analytics components
│   │   ├── DeckAnalysisPanel.jsx
│   │   ├── DecklistDisplay.jsx
│   │   └── ManaCurveDisplay.jsx
│   └── export/             # Print layout components
│       └── A4PrintLayout.jsx
├── utils/
│   ├── csvParser.js        # CSV parsing with PapaParse
│   ├── deckAnalyzer.js     # Deck analytics logic
│   └── customization.js    # Color schemes and keyword bolding
├── App.jsx                 # Main application component
├── main.jsx               # React entry point
└── index.css              # Tailwind CSS and print styles
```

## Usage Guide

### Creating a Deck

1. Click **"CREATE NEW DECK"** from the home screen
2. Enter a deck name (e.g., "Barbarian Starter")
3. Choose deck type:
   - **Hero Deck**: 40-card class decks for gameplay
   - **Equipment Deck**: 45-item shop deck
4. Upload a CSV file with your card data
5. Click **"SAVE DECK"**

### CSV Format

#### Hero Deck CSV Columns:
- `Card Name` - Name of the card
- `Card Type` - Minion, Spell, Upgrade, or Ultimate
- `Mana Cost` - Cost in mana
- `Copies` - Number of copies in deck
- `Effect` - Card effect text
- `Attack` - (Minions only) Attack value
- `Health` - (Minions only) Health value
- `Bounty` - (Minions only) Gold bounty (e.g., "2g")
- `Upgrade Slot` - (Upgrades only) Which ability it upgrades
- `State` - (Optional) "Print New" or "Updated" for filtering

#### Equipment Deck CSV Columns:
- `Item Name` - Name of the item
- `Category` - Weapon, Chest, Jewelry, Relic, or Consumable
- `Slot` - Equipment slot it fills
- `Tier` - 1, 2, or 3 (shown as stars)
- `Cost` - Gold cost
- `Effect` - Item effect text
- `Relic Type` - (Relics only) "Passive" or "Active"
- `Shop Phase` - (Optional) When it appears in shop

### Viewing and Exporting Decks

1. Go to **"MY DECKS"** tab
2. Click **"VIEW"** to see all cards in grid layout
3. Click **"EXPORT"** to enter print mode

### Export Options

**Filter by State:**
- **ALL CARDS**: Export entire deck
- **PRINT NEW**: Only cards marked as "Print New"
- **UPDATED**: Only cards marked as "Updated"

**Print Modes:**
- **Normal**: Cards with cut guides (2mm spacing)
- **Easy Print**: Tightly packed cards (1px spacing) for fast cutting

**Export Methods:**
- **DOWNLOAD PRINTABLE**: Saves HTML file → Open in browser → Ctrl+P → Save as PDF
- **PRINT NOW**: Direct print (may not work in all browsers)

### Balancing Analytics

1. Go to **"BALANCING"** tab
2. Select two hero decks to compare (Deck A and Deck B)
3. View side-by-side analytics:
   - **Mana Curves**: Overall, minion-only, and spell-only
   - **Card Composition**: Spell vs minion counts
   - **Minion Strength**: Total attack/health stats
   - **Total Minion Gold**: Economy analysis
   - **Keyword Density**: Cards with/without keywords

### Text Tweaks

**Keywords:**
- Add game keywords (e.g., "Rage", "Armor", "Spell Damage")
- Keywords automatically appear in **bold** on all cards

**Font Sizes:**
- **Effect Text - Standard Size**: Starting size (auto-sizes down to fit)
- **Effect Text - Minimum Size**: Won't shrink below this
- **Card Name Size**: Fixed size for card titles
- **Type Line Size**: Fixed size for card type
- **Mana Cost Size**: Fixed size for cost display

### Customizing Decks

1. View a deck
2. Click **"CUSTOMIZE"**
3. Change:
   - **Font Family**: Choose from 6 fonts
   - **Border Colors**: Customize colors for each card type

## Technical Details

### Dependencies

- **React 18**: UI framework
- **Tailwind CSS**: Utility-first styling
- **PapaParse**: CSV parsing
- **Lucide React**: Icon library
- **Vite**: Build tool and dev server

### Storage

All data is stored in browser localStorage:
- `cardDecks`: Array of deck objects
- `cardKeywords`: Array of keyword strings
- `textSettings`: Font size settings

### Print Layout

Cards are rendered at exact poker size (63mm × 88mm) with A4 page layouts:
- 9 cards per page (3×3 grid)
- Cut guides for easy trimming
- Page numbers for multi-page decks

### Analytics Deduplication

CSVs may have duplicate rows for print tracking. The analytics **automatically deduplicate by card name** before calculating statistics. This is intentional - don't "fix" it.

## Known Limitations

- **localStorage Limits**: No chunking/compression (5-10MB browser limit)
- **No Undo**: Deck deletion is permanent
- **Auto-sizing Performance**: Text sizing uses DOM measurement (can be janky on rapid re-renders)
- **Direct Print**: May not work in all browser environments (use HTML download method instead)

## Future Improvements

Potential enhancements for future versions:

- Deck editing (modify card counts without re-upload)
- Equipment deck analytics (tier distribution, shop balance)
- Export decklists as text
- Comparison highlights (auto-flag imbalances)
- Mulligan simulator
- Turn-by-turn playability curves
- Duplicate deck feature
- IndexedDB support for larger decks

## License

MIT License - Free to use and modify.

## Support

For bugs or feature requests, please create an issue in the repository.

---

Built for a 1v1 tactical card battler with MTG-style combat, hero progression, and persistent equipment shops.

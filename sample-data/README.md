# Sample Data for Testing Economy Tab

This directory contains sample CSV files for testing the Economy simulation feature.

## Hero Decks

- **hero-mage.csv** - Mage deck with spells and spell-synergy minions
- **hero-barbarian.csv** - Barbarian deck with aggressive minions and combat spells

## Equipment Decks

- **equipment-starter-shop.csv** - Sample equipment deck with items across all 3 tiers

## How to Use

1. Open the Card Game Master Tool
2. Click "MY DECKS" tab
3. Create a new deck:
   - Name: "Mage"
   - Type: Hero
   - Upload: `hero-mage.csv`
4. Create another deck:
   - Name: "Barbarian"
   - Type: Hero
   - Upload: `hero-barbarian.csv`
5. Create equipment deck:
   - Name: "Starter Shop"
   - Type: Equipment
   - Upload: `equipment-starter-shop.csv`
6. Go to BALANCING tab
7. Click ECONOMY sub-tab
8. Select Deck A: Mage
9. Select Equipment Deck: Starter Shop
10. Select Deck B: Barbarian

## Expected Behavior

The simulation will show:
- Gold accumulation over rounds 1-12
- Which equipment items each hero can afford based on killing opponent's minions
- Tier availability (Tier 1: R1-4, Tier 2: R5-8, Tier 3: R9+)
- Adjustable parameters (passive gold, minion death rate, max rounds)

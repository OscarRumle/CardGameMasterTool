# Card Game Master Tool - Game Guide

## 🎮 Welcome to the Card Battler!

A tactical card battler where you choose a hero, build a strategy, and battle against an AI opponent.

## 🎯 How to Play

### Starting a Game
1. Switch to **Game Mode** using the mode toggle button
2. Select your hero from 4 unique champions
3. Choose decks for:
   - Your hero deck
   - AI opponent deck
   - Shop equipment deck
4. Click **START GAME**

### Game Flow

#### Each Turn:
1. **Upkeep Phase**: Untap minions, gain mana, draw a card
2. **Main Phase**: Play cards, use abilities, purchase equipment
3. **Combat Phase**: Attack with minions
4. **End Turn**: Heal minions, gain 1 gold

#### Combat System:
1. **Declare Attackers**: Click your minions to select attackers
2. **Click ATTACK** button
3. **Defender Blocks**: Opponent assigns blockers (or skips)
4. **Resolve Damage**:
   - Blocked: Attacker and blocker deal damage to each other
   - Unblocked: Attacker damages opponent hero
5. **Process Deaths**: Dead minions go to graveyard, award bounties

### Win Condition
Reduce opponent's health to 0!

## 🦸 Heroes

### Necromancer (Master of Death)
- **Hero Power**: Dark Pact (2 mana) - Sacrifice 2 HP, draw a card
- **Hero Attack**: Life Drain - Deal 1 damage
- **Special**: Raise minions from graveyard, Sacrifice for mana
- **Level Up**: Raise 5+ minions → Raised minions enter untapped

### Barbarian (Fury Warrior)
- **Hero Power**: Battle Fury (1 mana) - Gain 2 Fury (max 12)
- **Hero Attack**: Fury Strike - Deal damage = Fury, reset to 0
- **Special**: Build fury through minions and powers
- **Level Up**: Deal 15+ weapon damage → Weapon deals +Armor damage

### Mage (Arcane Master)
- **Hero Power**: Arcane Surge (1 mana) - Gain 1 Arcana, draw if 5+
- **Hero Attack**: Arcane Bolt - Deal 1 damage
- **Special**: Gain Arcana when casting spells
- **Level Up**: Cast 15+ spells → Spells cost -1 mana

### Rogue (Shadow Assassin)
- **Hero Power**: Shadow Step (2 mana) - Enter Stealth
- **Hero Attack**: Quick Strike - Deal 1 (2x from Stealth)
- **Special**: Stealth breaks when attacking
- **Level Up**: Spend 15 gold → Weapon deals 2x while Stealthed

## 💰 Economy System

### Gold
- Earn: +1 per turn, minion bounties when they die
- Spend: Shop equipment, reroll shop (1 gold)

### Shop
- **5 items** available each game
- **Rounds 5 & 9**: Shop automatically upgrades to better items
- **Reroll**: Pay 1 gold to refresh all items
- **One purchase per turn**

### Equipment Slots
- **Weapon**: Attack bonuses
- **Chest**: Health/armor bonuses
- **Jewelry**: Mana bonuses
- **Relic**: Special effects

## 🎴 Card Types

### Minions
- Play to battlefield
- Attack: Damage dealt
- Health: How much damage they can take
- Bounty: Gold awarded to opponent when killed
- **Prepared**: Can attack immediately (no summoning sickness)

### Spells
- One-time effects
- Go to discard pile after use
- Examples: Deal damage, draw cards, buff minions

## 💡 Pro Tips

1. **Mana Curve**: Balance cheap and expensive cards
2. **Tempo vs Value**: Sometimes playing a weaker minion early is better than waiting
3. **Blocking**: Trade minions to prevent hero damage
4. **Equipment**: Early equipment can snowball advantages
5. **Hero Powers**: Use consistently to maximize value
6. **Level Up**: Build towards your hero's level-up condition
7. **Card Advantage**: Drawing extra cards wins games
8. **Gold Management**: Save for expensive equipment vs buy immediately

## 🎨 UI Guide

### Color Coding
- **Green**: Your minions/hero
- **Red**: Opponent minions/hero
- **Amber/Gold**: Shop, important buttons
- **Orange**: Selected attackers
- **Blue**: Blockers, blocking phase
- **Purple**: Necromancer cards

### Visual Indicators
- **💤**: Summoning sickness (can't attack)
- **Rotated**: Tapped (used this turn)
- **Glowing Border**: Selected
- **BLOCKED Badge**: Minion is blocked in combat

## ⌨️ Controls

- **Click**: Select cards, minions, shop items
- **Double-Click**: Quick-play cards from hand
- **Drag**: None - click-based controls only

## 🐛 Troubleshooting

### Game won't start?
- Ensure all 3 decks are selected
- Check that deck files have cards

### Cards not playing?
- Check if you have enough mana
- Ensure it's your turn
- Verify you're in main phase

### Shop not working?
- Need gold to purchase
- One purchase per turn limit
- Must be your turn

## 📝 Deck Building Tips (Tool Mode)

1. **30+ cards minimum** recommended
2. **Include copies** (use Copies column in CSV)
3. **Mana curve**: 2-3 cost (many), 5+ cost (few)
4. **Win conditions**: Cards that can close games
5. **Card draw**: Include ways to refill your hand
6. **Balance**: Mix minions and spells

## 🎯 Strategy Guide

### Early Game (Turns 1-4)
- Play cheap minions
- Establish board presence
- Use hero power if mana efficient

### Mid Game (Turns 5-8)
- Purchase shop equipment
- Build towards level-up
- Start pressuring opponent

### Late Game (Turns 9+)
- Close out the game
- Use equipment advantages
- Push for lethal damage

## 🏆 Have Fun!

Master the combat, outsmart the AI, and become the champion!

---

*Generated with [Claude Code](https://claude.com/claude-code)*

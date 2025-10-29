# CARD GAME VIDEO GAME - GAME DESIGN & DEVELOPMENT SPECIFICATION

**Version 1.0** | Digital Implementation of Physical Card Game

---

## DOCUMENT PURPOSE

This document defines **WHAT** needs to be built to create a digital version of our tactical card battler. It is written for developers who need to understand the complete game vision, all mechanics, systems, and implementation priorities.

**This is NOT a coding guide.** It explains game systems, rules, features, and best practices for approaching development—not how to write specific code.

---

## TABLE OF CONTENTS

1. [Project Vision](#project-vision)
2. [Game Overview](#game-overview)
3. [MVP Scope & Phases](#mvp-scope--phases)
4. [Core Game Loop](#core-game-loop)
5. [Complete Rules Reference](#complete-rules-reference)
6. [Hero System (All 4 Heroes)](#hero-system-all-4-heroes)
7. [Card Types & Deck Structure](#card-types--deck-structure)
8. [Equipment & Shop System](#equipment--shop-system)
9. [Combat System](#combat-system)
10. [Level-Up System](#level-up-system)
11. [AI Opponent Requirements](#ai-opponent-requirements)
12. [Game State & Data Flow](#game-state--data-flow)
13. [UI/UX Requirements](#uiux-requirements)
14. [Technical Constraints](#technical-constraints)
15. [Development Best Practices](#development-best-practices)
16. [Testing & Balance Considerations](#testing--balance-considerations)

---

## PROJECT VISION

### What We're Building
A **desktop video game** (Electron app) that faithfully recreates our 1v1 tactical card battler with the feel of a premium Steam game. Players select heroes with unique mechanics, build armies, manage economies through a persistent shop, and engage in MTG-style tactical combat against an AI opponent.

### Core Experience
**Choose Hero & Deck** → **Battle AI** → **Make Tactical Decisions** → **Win or Learn**

### Design Goals
- **Faithful to physical game**: All rules work exactly as designed
- **Premium feel**: Feels like Slay the Spire, not a website
- **Accessible depth**: New players can play, experts can master
- **Single-player focused**: MVP is vs AI, multiplayer is Phase 3

### Target Playtime
20-30 minutes per match (typical: 10-15 rounds = 20-30 turns total)

---

## GAME OVERVIEW

### Genre
1v1 Tactical Card Battler with Hero Progression and Persistent Shop Economy

### Key Differentiators
1. **Hero Progression**: Level-up mid-game, unlock Ultimate cards
2. **Persistent Shop**: Shared equipment market with timed refreshes (Rounds 4 & 7)
3. **MTG-Style Combat**: Declare attackers → opponent blocks → resolve
4. **Class Resources**: Each hero has unique resource (Fury, Arcana, Stealth, etc.)
5. **Economic Strategy**: Gold tension between buying equipment vs spending on card effects

### Inspirations (for reference)
- **Magic: The Gathering** (combat, card types, mana system)
- **Hearthstone** (hero powers, digital-first design)
- **Slay the Spire** (single-player card battler, progression)
- **Dota Underlords** (shared shop with timed refreshes)

---

## MVP SCOPE & PHASES

### Phase 1: MVP (Current Focus)
**Goal**: Functional game loop against AI opponent

✅ **Must Have:**
- Hero selection screen (4 heroes available)
- Deck selection (load from uploaded CSVs)
- Complete turn structure (Upkeep → Main → End)
- All core mechanics working:
  - Mana system (gain +1/turn, cap at 10)
  - Playing cards (minions, spells, upgrades)
  - Combat system (attackers, blockers, damage resolution)
  - Shop system (5-card market, refreshes at R4/R7)
  - Level-up system (hero-specific conditions & passives)
  - All 4 hero-specific mechanics (Fury, Raise/Sacrifice, Arcana/Echo, Stealth/Pay)
- Hero abilities (Hero Power, Attack, once per turn each)
- Rule-based AI opponent (simple but legal moves)
- Win/loss conditions
- Action log (track what happened)
- Basic functional UI (readable, usable, not polished)

❌ **NOT in MVP:**
- Animations (cards moving, attack effects, etc.)
- Sound effects / music
- Advanced AI (just rules-compliant basic AI)
- Multiplayer (PvP)
- Deck builder (use CSV uploads from existing tool)
- Replays, statistics, achievements
- Tutorial mode

---

### Phase 2: Polish & Enhancement
- Visual animations (card play, combat, effects)
- Sound design
- Better AI (evaluates board state, makes strategic decisions)
- UI polish (hover effects, card zoom, better layout)
- Game history / log improvements
- Save/load mid-game

---

### Phase 3: Multiplayer & Advanced Features
- Local hotseat multiplayer
- Online PvP (matchmaking, etc.)
- Deck builder in-game
- Additional heroes (beyond initial 4)
- Spectator mode
- Ranked mode

---

## CORE GAME LOOP

### Match Flow
```
1. HERO SELECTION
   - Player chooses: Barbarian, Necromancer, Mage, or Rogue
   - Player chooses deck CSV for selected hero
   - Player chooses AI hero + deck
   
2. GAME SETUP
   - Determine first player (coin flip or choice)
   - Starting resources:
     * Health: 25
     * Mana: 1 (first player) or 2 (second player)
     * Gold: 0
     * Armor: 0
     * Class Resource: 0
   - Shuffle decks
   - Draw opening hands:
     * First player: 4 cards
     * Second player: 5 cards
   - Mulligan phase (optional): redraw up to 3 cards
   - Initialize shop: shuffle equipment deck, deal 5 Early tier cards
   
3. GAME LOOP (alternating turns)
   EACH TURN:
   
   A. UPKEEP PHASE (automatic)
      1. Untap all minions
      2. Gain +1 max mana (cap 10), refill mana pool
      3. Draw 1 card
      4. Trigger "at start of turn" effects
      → Advance to Main Phase
   
   B. MAIN PHASE (player actions)
      Player can perform actions in ANY order:
      - Play cards from hand (minions, spells, upgrades)
      - Use Hero Power (once per turn, costs mana)
      - Use Attack ability (once per turn, costs 2 mana)
      - Declare combat (choose attackers)
      - Buy from shop (once per turn)
      
      COMBAT RESOLUTION (when declared):
      1. Active player declares attackers (tap minions)
      2. Defender declares blockers
      3. Resolve damage (all simultaneous)
      4. Process deaths, award bounties
      5. Return to Main Phase
      
      When done: Click "End Turn"
   
   C. END PHASE (automatic)
      1. Trigger "at end of turn" effects
      2. Heal all minions to full health
      3. Gain +1 gold
      4. Reset ability usage counters
      5. Increment turn counter
      6. Check shop refresh (Round 4 → Mid tier, Round 7 → Late tier)
      → Switch to opponent's turn
   
4. GAME END
   - When hero reaches 0 health → opponent wins
   - If both reach 0 simultaneously → draw
   - Display result screen with stats
```

### Turn Structure Details

**Round vs Turn:**
- **Round** = both players take 1 turn each (Round 3 = 6 total turns)
- **Turn** = single player's complete Upkeep → Main → End sequence

**Timing Windows:**
- Cards/abilities can only be used during **your Main Phase**
- No instant-speed responses (not like MTG instants)
- All effects resolve immediately when played

**Shop Refresh Timing:**
- Round 1-4: Early tier (1-4g items)
- Round 5-8: Mid tier (5-8g items) — REFRESHES at start of Round 5
- Round 9+: Late tier (9-16g items) — REFRESHES at start of Round 9

---

## COMPLETE RULES REFERENCE

### Starting Conditions

**Hero Health:** 25
**Starting Mana:** 
- First player: 1
- Second player: 2 (compensation for going second)

**Mana Growth:** 
- Gain +1 max mana each turn during Upkeep
- Max mana caps at 10
- Mana pool refills to max every Upkeep

**Opening Hand:**
- First player: 4 cards
- Second player: 5 cards
- Mulligan: Choose up to 3 cards to redraw (shuffle back into deck, draw new)

**Gold Economy:**
- Start at 0 gold
- Gain +1 gold at end of EVERY turn (both players)
- Gain bounty gold when you kill enemy minions
- Spend gold: buying from shop, Pay effects (Rogue)

---

### Card Playing Rules

**Playing Minions:**
- Pay mana cost
- Place on your side of battlefield
- Minion has **summoning sickness** (cannot attack this turn)
- Minion CAN block immediately (no summoning sickness for blocking)
- No hand size limit

**Casting Spells:**
- Pay mana cost
- Effect resolves immediately
- Spell goes to discard pile
- Some spells have hero-specific bonuses (Arcana thresholds, Stealth bonuses, etc.)

**Playing Upgrades:**
- Pay mana cost
- Choose which ability slot to replace (Hero Power, Attack)
- Upgrade permanently replaces base ability
- Old ability is lost (can't swap back)

**Playing Ultimates:**
- Can ONLY be played after hero has leveled up
- Before level-up: Ultimate cards are dead draws (unplayable)
- After level-up: play normally (pay mana, resolve effect)
- Powerful late-game bombs (board wipes, massive damage, finishers)

---

### Hero Abilities

Each hero has 2 abilities (some have 3 in full game, MVP focuses on 2):

**1. Hero Power**
- Costs mana (usually 1 mana)
- Can be used once per turn
- Class-specific effect
- Example: Barbarian "Gain 2 Armor", Mage "Gain 1 Arcana"

**2. Attack (Weapon)**
- Costs 2 mana
- Can be used once per turn, any time during Main Phase
- Base effect: "Deal weapon damage to target enemy minion or hero. Take damage back if attacking minion."
- Base weapon damage: 2 (increases with equipment)
- If you kill a minion: gain its bounty gold
- Can be used BEFORE or AFTER declaring minion combat

**Ability Restrictions:**
- Each ability can only be used ONCE per turn
- Using an ability does NOT end your Main Phase
- You can play cards before or after using abilities

**Upgrades:**
- Upgrade cards permanently improve abilities
- Example: Barbarian Attack upgrade makes weapon attacks cost 0 at 5+ Fury

---

### Combat System (MTG-Style Blocking)

**IMPORTANT CONCEPT:**
Minions attack the **enemy hero**, not other minions. The defending player **chooses blockers** to prevent damage.

**Combat Flow:**

**Step 1: Declare Attackers**
- Active player chooses which minions attack
- Tap each attacker (turn sideways)
- Minions with summoning sickness CANNOT attack
- All attackers are attacking the enemy hero (not specific targets)

**Step 2: Declare Blockers**
- Defender chooses which minions block
- Blockers do NOT tap
- Each blocker blocks ONE attacker
- Multiple blockers CAN gang up on one attacker
- Unblocked attackers will damage the hero

**Step 3: Resolve Damage**
- All damage happens SIMULTANEOUSLY
- **Blocked attackers**: deal damage to their blocker(s)
- **Blockers**: deal damage back to attacker
- **Unblocked attackers**: damage enemy hero (armor absorbs first)

**Multi-Block Rules:**
When multiple minions block one attacker:
- Attacker chooses damage order
- Must assign lethal damage to first blocker before next
- All blockers deal full damage to attacker simultaneously

**Example:**
- 6/6 attacker blocked by 2/2 and 3/3
- Attacker orders: 2/2 first, 3/3 second
- Attacker assigns: 2 damage to first (dies), 4 damage to second
- Blockers deal: 2+3 = 5 damage to attacker
- Result: 2/2 dies, 3/3 survives, attacker survives at 1 health

**Death & Bounties:**
- Minions with damage ≥ health die
- Killer gains bounty gold immediately
- Dead minions go to discard pile (and graveyard for Necromancer)

**Healing:**
- At END of turn: all surviving minions heal to full health
- No damage carries between turns
- Minions reset to max health in End Phase

---

### Equipment & Armor

**Armor Mechanic:**
- Reduces incoming damage to hero by 1 per point
- Armor depletes before health
- Persists across turns until consumed
- No upper limit (but practical max ~10-12)
- Can go negative on minions (they take extra damage)

**Example:**
- Hero has 5 Armor, takes 8 damage
- Armor absorbs 5 → 0 Armor remaining
- Remaining 3 damage goes to health

**Equipment Slots:**
- Weapon: increases Attack ability damage
- Chest: grants health, armor, defensive effects
- Jewelry: grants gold generation, card draw
- Relic: passive auras OR once-per-game activated abilities

---

### Bounty System

**Gold Rewards for Killing Minions:**
- When you kill an enemy minion, gain its bounty immediately
- Bounty values based on cost:
  - 1-3 cost minions: 1 gold
  - 4 cost minions: 2 gold
  - 5+ cost minions: 3 gold

**Who Gets Bounty:**
- The player whose effect/minion/attack killed the enemy minion
- Combat: attacker gains bounty if blocker dies
- Spell: caster gains bounty if minion dies
- Weapon Attack: hero gains bounty if minion dies

---

### Deck-Out Rule

**When deck is empty:**
- Shuffle discard pile into deck
- Draw continues normally
- NO penalty for running out of cards
- Can cycle through deck multiple times per game

---

### Win/Loss Conditions

**Victory:** Reduce opponent's hero to 0 health

**Simultaneous Death:** Both heroes hit 0 HP → **DRAW** (no winner)

**No Other Win Conditions:**
- Can't win by milling/deck-out
- Can't win by quest/alternate conditions
- Only way to win: reduce opponent to 0 HP

---

## HERO SYSTEM (ALL 4 HEROES)

Each hero has:
- Unique **class resource** (Fury, Arcana, Stealth state, etc.)
- Unique **Hero Power** and **Attack** abilities
- Unique **level-up condition** and **passive bonus**
- Unique **keywords** and card mechanics
- 40-card **class deck** with 2 Ultimate cards

---

### BARBARIAN - "Fury Burst Warrior"

**Identity:** Unstoppable warrior who builds Fury resource, then unleashes massive weapon strikes. Midrange burst deck that cycles between setup and explosive payoff.

**Class Resource: FURY** (tracked 0-12)
- Accumulating offensive resource
- Gained from minions and spells
- **When you use Attack ability: damage = weapon + ALL Fury, then Fury resets to 0**
- Persists across turns (doesn't decay)
- Spend all at once for big burst

**Secondary Resource: ARMOR**
- Protects while building Fury
- Enables safe weapon attacks
- After level-up: converts to offense (weapon damage gets +Armor bonus)

**Level-Up Condition:**
*"Deal 15+ damage with Weapon Attacks"*
- Track cumulative weapon damage dealt (to heroes OR minions)
- Typical timing: Turns 6-8 (after 2-3 weapon attacks)

**Level-Up Passive:**
*"Your Weapon Attacks deal bonus damage equal to your Armor"*
- **Calculation:** Weapon damage + Fury + Armor = total damage
- Example: 3 weapon + 6 Fury + 5 Armor = 14 damage in one hit
- Makes opponent fear both Fury count AND Armor count

**Hero Power - "War Cry"**
- Base: *"Cost 1 mana: Gain 2 Armor"*
- Upgrade: *"Cost 1 mana: Gain 2 Armor and 1 Fury"*

**Attack - "Weapon Strike"**
- Base: *"Cost 2 mana: Deal weapon damage + Fury to target. Take damage back. Spend ALL Fury."*
- Upgrade: *"Cost 2 mana: Same effect. 5+ Fury: This costs 0 instead"*

**Ultimate: Rampage** (2 copies in deck)
- *"6 mana: Gain Fury equal to your Armor. Attack twice this turn (costs 0 mana each)."*
- Enables double-attack burst turns for 25+ damage

**Key Mechanics:**
- **Fury generation:** Many minions/spells grant Fury when played or on effects
- **Armor stacking:** Hero Power, defensive minions, spells
- **Burst windows:** Build Fury → Attack → Rebuild → Attack again
- **Threshold payoffs:** Some cards trigger at specific Fury amounts (5+, 8+)

**Gameplay Pattern:**
```
Turns 1-3: Play Fury-generating minions, build Armor
Turn 4: Attack with weapon (3 weapon + 4 Fury = 7 damage), reset Fury
Turns 5-6: Rebuild Fury, stack more Armor
Turn 7: Attack again (3 weapon + 5 Fury + 6 Armor = 14 damage post-level-up)
Turn 9: Rampage turn (double attack for 25+ damage)
```

**Equipment Priority:**
1. Weapon (critical for damage scaling)
2. Chest (HP pool + Armor for defense → offense conversion)
3. Jewelry (gold for better equipment)
4. Relic (utility, lowest priority)

---

### NECROMANCER - "Recursive Swarm"

**Identity:** Master of death who commands undead armies. Floods board with cheap minions, brings them back from graveyard repeatedly, and sacrifices them for powerful effects. Midrange deck that wins through attrition and recursion.

**Class Resource: RAISE** (keyword on cards)
- Bring minions back from graveyard to battlefield
- Syntax: *"Raise 1 minion (X-cost or less)"*
- Graveyard = dead minions only (spells go to discard, not graveyard)
- Raised minions have summoning sickness UNTIL level-up

**Secondary Resource: SACRIFICE** (keyword on cards)
- Pay health OR kill your own minions for effects
- Syntax: *"Sacrifice X: [Effect]"*
- Player chooses: pay X health OR kill minion with X+ health
- Denial strategy: sacrifice minions to deny opponent bounties

**Level-Up Condition:**
*"Raise 5+ minions"*
- Count every Raise trigger (Hero Power, spells, Attack kills)
- Typical timing: Turns 6-7

**Level-Up Passive:**
*"Raised minions enter play untapped"*
- Removes summoning sickness from ALL raised minions
- **Huge tempo swing:** Mass Resurrection → 3 minions attack immediately
- Enables combo turns: Raise → attack → Sacrifice → repeat

**Hero Power - "Soul Harvest"**
- Base: *"Cost 1 mana: Sacrifice 2: Draw a card"*
- Upgrade: *"Cost 1 mana: Sacrifice 2: Draw a card. If you sacrificed a minion, gain 1 Health"*

**Attack - "Deathtouch"**
- Base: *"Cost 2 mana: Deal weapon damage to target. Take damage back. If target dies, Raise 1 minion (2-cost or less)"*
- Upgrade: *"Cost 2 mana: Deal weapon damage +1 to target. If target dies, Raise 1 minion (3-cost or less)"*

**Ultimate: Bone Colossus** (2 copies in deck)
- *"8 mana 3/3 Defender: When played, kill all your minions. This gains their combined Attack and Health."*
- **THE FINISHER:** Wide board with 25+ stats → Bone Colossus becomes 28/31 threat
- Opponent must answer or take 28 face damage

**Key Mechanics:**
- **Graveyard zone:** Dead minions go here (separate from discard pile)
- **Raise effects:** Move minions from graveyard → battlefield
- **Sacrifice costs:** Flexible payment (HP or minions)
- **Scaling threats:** Minions that grow when you Raise (Grave Warden +1/+1 per Raise)
- **Bounty denial:** Kill own minions before opponent does

**Gameplay Pattern:**
```
Turns 1-4: Flood board with cheap minions (Skeleton Warrior, Plague Rat)
Turn 5: Minions die in combat → graveyard fills
Turn 6: Reanimate spell → Raise best minion back
Turn 7: Level up → Mass Resurrection → 3 minions return, all attack immediately
Turn 10: Bone Colossus → absorb 25+ stats, instant win threat
```

**Equipment Priority:**
1. Chest (HP pool for Sacrifice costs)
2. Jewelry (gold generation from constant trading)
3. Relic (board-wide buffs for swarm)
4. Weapon (lowest priority, Attack generates minions but not main damage source)

---

### MAGE - "Arcana Control"

**Identity:** Scholarly master of arcane arts who builds Arcana resource through spellcasting, curates a spellbook of premium effects, then unleashes devastating combinations. Control deck that dominates late game.

**Class Resource: ARCANA** (tracked 0+, no cap)
- Permanent scaling resource
- **Gain 1 Arcana every time you cast a spell**
- Used for threshold checks (cards get bonuses at 3/5/6/8 Arcana)
- Persists forever (never resets)

**Secondary Resource: ECHO ZONE** (max 3 spells)
- Separate zone from hand/battlefield
- Store premium spells here to recast later at reduced cost
- Syntax: *"Echo: Add this to your Echo Zone"*
- Limited to 3 slots = curation decisions
- Can replace Echoed spells by playing new ones

**Level-Up Condition:**
*"Cast 15+ spells"*
- Count every spell cast (cheap or expensive)
- Typical timing: Turns 7-9

**Level-Up Passive:**
*"Your spells cost 1 less"*
- Applies to ALL spells (hand, Echo Zone, deck)
- Stacks with other cost reductions
- Makes late-game explosive (chain multiple spells per turn)

**Hero Power - "Arcane Focus"**
- Base: *"Cost 1 mana: Gain 1 Arcana"*
- Upgrade: *"Cost 1 mana: Gain 1 Arcana and draw a card"*

**Attack - "Arcane Blast"**
- Base: *"Cost 2 mana: Deal weapon damage to target. Take damage back."*
- Upgrade: *"Cost 2 mana: Deal weapon damage +1 to target. 5+ Arcana: This costs 0 instead"*

**Ultimate: Pyroblast** (2 copies) & **Time Cascade** (1 copy)
- Pyroblast: *"7 mana: Deal 10 damage to any target. 8+ Arcana: Deal 15 instead"*
- Time Cascade: *"8 mana: Recast all spells in Echo Zone without paying costs. They return to Echo Zone afterward."*

**Key Mechanics:**
- **Arcana thresholds:** Many cards have *"3+ Arcana: bonus effect"* or *"6+ Arcana: better bonus"*
- **Echo system:** Store 3 best spells, recast later at discount
- **Spell chaining:** Cast multiple spells per turn to build/use Arcana
- **Threshold optimization:** Plan turns around hitting breakpoints (need 6 Arcana for big Fireball)

**Gameplay Pattern:**
```
Turns 1-4: Cast cheap spells, build Arcana, survive
Turn 5: Hit 3 Arcana → Arcane Missiles deals 2 damage instead of 1
Turn 7: Cast 5 spells → Level up (spells cost -1)
Turn 9: 8+ Arcana → Pyroblast for 15, Fireball for 7, Chain Lightning for 5 = 27 damage
Turn 11: Time Cascade → recast all Echo spells for free, win
```

**Equipment Priority:**
1. Relic (spell-boosting effects, card draw)
2. Chest (survival for late game)
3. Jewelry (card advantage)
4. Weapon (lowest priority, not spell-focused)

---

### ROGUE - "Stealth Combo Economy"

**Identity:** Shadow operative who enters/maintains Stealth for bonuses, accumulates wealth through kills, and spends gold on powerful Pay effects. Combo/economy deck with explosive burst turns and economic tension.

**Class Resource: STEALTH** (binary state: In Stealth or not)
- Enter Stealth through cards/Hero Power
- **While In Stealth:** immune to enemy spells, get bonus effects on cards
- **Broken by:** taking damage from enemy hero's Attack ability
- **NOT broken by:** minion combat damage, spell damage to your minions
- Persists across turns (doesn't auto-reset)

**Secondary Resource: PAY** (keyword on cards)
- Spend gold to activate powerful card effects
- Syntax: *"Pay X: [Effect]"*
- Creates tension: gold for equipment OR gold for card effects
- Hidden information: opponent doesn't see your gold total

**Level-Up Condition:**
*"Spend 15 gold (on Pay effects OR in shop)"*
- Track all gold spent (buying equipment counts)
- Typical timing: Turns 6-8

**Level-Up Passive:**
*"Your Weapon Attacks deal double damage to enemy hero while In Stealth"*
- **Calculation:** (Weapon damage) × 2, only against hero, only while Stealthed
- Combined with Attack upgrade (Stealth: Cost 0) = free burst damage
- Example: 3 weapon → 6 damage for 0 mana while Stealthed

**Hero Power - "Shadowstep"**
- Base: *"Cost 1 mana: Enter Stealth"*
- Upgrade: *"Cost 1 mana: Enter Stealth and deal 1 damage to target enemy minion"*

**Attack - "Blade Strike"**
- Base: *"Cost 2 mana: Deal weapon damage to target. Take damage back. (Taking damage from enemy hero attacks breaks Stealth)"*
- Upgrade: *"Cost 2 mana: Deal weapon damage +1 to target. If you kill target, don't take damage back. Stealth: Cost 0 instead"*

**Ultimate: The Heist** (3 copies in deck)
- *"7 mana: Gain gold equal to twice the total bounty of all enemy minions. For rest of this turn, your Pay costs are 0."*
- **THE FINISHER:** Opponent has 10g bounty → gain 20g → chain all Pay spells for free

**Key Mechanics:**
- **Stealth bonuses:** Many cards have *"Stealth: better effect"* or *"Stealth: costs less"*
- **Pay effects:** Spend gold on card bonuses vs saving for equipment
- **Gold generation:** Minions that grant bonus gold on kills
- **Burst combo:** Enter Stealth → play Phantom Blade for free → chain Pays → burst

**Gameplay Pattern:**
```
Turns 1-3: Kill minions for gold (Cutpurse +2g per kill)
Turn 4: Enter Stealth, play Phantom Blade for free (0 cost), Pay effects
Turn 6: Buy equipment with accumulated gold
Turn 8: Level up (spent 15g)
Turn 10: The Heist (gain 24g from enemy board) → Blood Money (Pay 0: draw 4 gain 10g) → chain more
Turn 11: Enter Stealth, Attack hero for free (0 cost, 6+ damage doubled) → win
```

**Equipment Priority:**
1. Jewelry (gold generation for both equipment and Pay effects)
2. Weapon (post-level-up doubles to hero while Stealthed)
3. Chest (survival)
4. Relic (utility)

---

## CARD TYPES & DECK STRUCTURE

### Deck Composition (40 cards per hero)

**Card Type Breakdown:**
- **Minions:** ~20-25 cards (battlefield creatures with Attack/Health)
- **Spells:** ~10-15 cards (one-time effects)
- **Upgrades:** 2 cards (Hero Power upgrade, Attack upgrade)
- **Ultimates:** 2 cards (powerful late-game bombs, unplayable until leveled)

**Copy System:**
- CSVs list each unique card with "Copies" column
- Example: "Fireball, Spell, 3, 4" = 3 copies of Fireball at 4 mana
- Deck loader must expand: 1 row → 3 actual cards in deck

---

### Card Types Explained

**MINION CARDS**
- Played to battlefield, stay until killed
- Stats: Attack / Health / Bounty
- Bounty: gold opponent gets when they kill this minion
- Keywords: Defender, Duelist, Prepared, Empower, etc.

**Format:**
```
Card Name: Fury Initiate
Type: Minion
Cost: 1 mana
Stats: 2/1 (2 Attack, 1 Health)
Bounty: 1g
Effect: "Gain 1 Fury when played"
Copies: 3
```

**SPELL CARDS**
- Cast for immediate effect, go to discard
- No permanent board presence
- Categories: Damage, Draw, Buff, Removal

**Format:**
```
Card Name: Fireball
Type: Spell
Cost: 4 mana
Effect: "Deal 5 damage to any target. 6+ Arcana: Deal 7 instead"
Copies: 2
```

**UPGRADE CARDS**
- Played onto hero ability slots
- Permanently replace base abilities
- Expensive early (3 mana), huge value over time

**Format:**
```
Card Name: Berserker's Roar
Type: Upgrade
Cost: 3 mana
Effect: "Hero Power becomes: Cost 1 mana: Gain 2 Armor and 1 Fury"
Upgrade Slot: Hero Power
Copies: 1
```

**ULTIMATE CARDS**
- Cannot be played UNTIL hero has leveled up
- Before level-up: dead cards in hand
- After level-up: game-ending bombs
- Always expensive (6-8 mana)

**Format:**
```
Card Name: Rampage
Type: Ultimate
Cost: 6 mana
Effect: "Gain Fury equal to your Armor. Attack twice this turn (costs 0 mana each)."
Copies: 2
```

---

### Common Keywords

**MINION KEYWORDS:**

**Defender**
- Enemy minions must attack this minion if able
- Forces opponent to deal with threat before hitting hero

**Duelist**
- When this attacks or blocks, it deals damage before taking damage back
- Survives combat against equal-attack minions

**Prepared**
- Can attack the turn it's played (ignores summoning sickness)
- Rare, high-value keyword

**Empower**
- Permanent buff when condition is met
- Example: "Empower: When you gain Fury, this gets +1/+1"

**Deathrattle**
- Effect triggers when minion dies
- Example: "Deathrattle: Gain 2 gold"

---

**SPELL/EFFECT KEYWORDS:**

**Channeled** (Mage)
- Bonus effect if you cast another spell this turn first
- Rewards spell chaining
- Example: "Deal 2 damage. Channeled: Deal 4 instead"

**Echo** (Mage)
- Add spell to Echo Zone (max 3)
- Can recast later at reduced cost
- Example: "Echo: Add this to your Echo Zone"

---

**HERO-SPECIFIC KEYWORDS:**

**Fury** (Barbarian)
- "Gain X Fury" = increase Fury resource
- "Spend Fury" = use Attack ability, reset to 0

**Raise** (Necromancer)
- "Raise 1 minion (X-cost or less)" = bring minion from graveyard to battlefield

**Sacrifice** (Necromancer)
- "Sacrifice X: [Effect]" = pay X health OR kill minion with X+ health

**Stealth** (Rogue)
- "Enter Stealth" = become immune to enemy spells, get card bonuses
- "Stealth: [Effect]" = bonus effect only while In Stealth

**Pay** (Rogue)
- "Pay X: [Effect]" = spend X gold to activate bonus effect

---

## EQUIPMENT & SHOP SYSTEM

### Shop Structure

**Market Display:**
- 5 face-up equipment cards always visible
- Shared between both players (first-come, first-served)
- Purchased slots stay empty until shop refreshes

**Three Tier Decks:**
- **Early Tier (1-4g items):** Rounds 1-4
- **Mid Tier (5-8g items):** Rounds 5-8 (refreshes at start of Round 5)
- **Late Tier (9-16g items):** Round 9+ (refreshes at start of Round 9)

**Refresh Timing:**
- **Round 5 (turn 9):** Remove all Early cards, deal 5 Mid cards
- **Round 9 (turn 17):** Remove all Mid cards, deal 5 Late cards
- Purchased slots do NOT refill mid-tier (empty = empty)

**Purchasing Rules:**
- Buy during Main Phase (once per turn)
- Pay gold cost
- Equipment: immediately equipped, old equipment discarded
- Consumables: effect activates immediately, item discarded

---

### Equipment Types

**45 Total Items:** 36 equipment + 9 consumables

**WEAPON SLOT** (7 items)
- Increases weapon damage (base 2 → 3, 4, 5+)
- On-hit effects (cleave, bonus damage, etc.)
- Priority: High for Barbarian/Rogue, Low for Mage/Necromancer

**CHEST SLOT** (7 items)
- Increases max health (+5, +8, +12)
- Grants armor (+2, +4)
- Defensive effects (damage reduction, regeneration)
- Priority: High for all heroes (survival)

**JEWELRY SLOT** (7 items)
- Gold generation (bonus gold on kills)
- Card draw (draw extra cards)
- Mana/economy effects
- Priority: High for Rogue, Medium for others

**RELIC SLOT** (15 items: 8 passive, 7 active)
- **Passive Relics:** Always-on auras (e.g., "Deal 1 damage to all enemy minions at start of turn")
- **Active Relics:** Once-per-game abilities (e.g., "Pay 3 mana: Your hero is Immune until end of turn")
- Priority: Medium-High for utility plays

**CONSUMABLES** (9 items: 3 Mana, 3 Health, 3 Knowledge)
- **Mana Potions:** +1/+2/+4 max mana (costs 4g/7g/13g)
- **Health Potions:** Restore 4/7/12 health (costs 3g/5g/8g)
- **Knowledge Potions:** Draw 1/3/5 cards (costs 2g/6g/10g)
- One-time use, immediate effect

---

### Strategic Implications

**Economic Tension:**
- Every turn matters (can only buy 1 item per turn)
- Denial plays (buy item opponent wants)
- Tempo vs value (cheap item now vs save for expensive later)

**Information Warfare:**
- Both see same shop options
- Gold totals hidden (until shopping)
- Bluffing/predicting opponent's buys

**Hero-Specific Priorities:**
- Barbarian: Weapon > Chest > Jewelry
- Necromancer: Chest > Jewelry > Relic
- Mage: Relic > Chest > Jewelry
- Rogue: Jewelry > Weapon > Chest

---

## COMBAT SYSTEM

### Core Combat Concept

**Minions attack HEROES, not other minions.**
The defending player **assigns blockers** to prevent hero damage.

This is fundamentally different from direct-attack games (like Hearthstone) where minions fight each other.

---

### Combat Phases

**PHASE 1: DECLARE ATTACKERS**
- Active player selects which minions attack
- Requirements: minion must be untapped + no summoning sickness
- Tap each attacker (visual indicator)
- All attackers target enemy hero (not specific minions)

**PHASE 2: DECLARE BLOCKERS**
- Defending player assigns blockers
- Each blocker can block ONE attacker
- Multiple blockers CAN gang up on ONE attacker
- Blockers do NOT tap
- Unassigned attackers are "unblocked"

**PHASE 3: RESOLVE DAMAGE**
All damage is SIMULTANEOUS:
- Blocked attackers deal damage to their blocker(s)
- Blockers deal damage to attacker
- Unblocked attackers damage defending hero (armor absorbs first)
- Minions with damage ≥ health die
- Attacker gains bounty for each killed blocker

---

### Multi-Block Resolution

**When 2+ minions block 1 attacker:**

1. **Attacker orders blockers** (choose who takes damage first)
2. **Attacker assigns lethal damage** to first blocker before next
3. **All blockers deal full damage** to attacker simultaneously

**Example:**
```
Attacker: 8/8 minion
Blockers: 3/3 and 4/4

Attacker orders: 3/3 first, 4/4 second
Attacker assigns: 3 to first (dies), 5 to second (1 survives)
Blockers deal: 3+4 = 7 to attacker
Result: 3/3 dies, 4/4 survives at 4/1, attacker survives at 8/1
Attacker gains: 2g bounty from 3/3 death
```

---

### Combat Timing & Strategy

**When to Declare Combat:**
- Any time during your Main Phase
- Can play cards BEFORE combat (buff minions, remove blockers)
- Can play cards AFTER combat (finish survivors)

**Weapon Attack vs Minion Combat:**
- Weapon Attack: targets specific minion directly (costs 2 mana)
- Minion Combat: minions attack hero, opponent chooses blocks
- Strategy: Use Weapon Attack to kill key blockers before combat

**Example Turn:**
```
1. Play minions (4 mana)
2. Use Weapon Attack to kill enemy 5/5 Defender (2 mana)
3. Declare combat: all 4 minions attack
4. Opponent has fewer blockers → more damage gets through
5. Use Hero Power with leftover mana (1 mana)
```

---

### Combat Keywords Impact

**Defender:**
- Opponent must block this minion if able
- Forces unfavorable trades

**Duelist:**
- Deals damage before taking damage back
- Survives combat against same-attack minions
- Example: 3/3 Duelist vs 3/3 blocker → Duelist survives, blocker dies

**Prepared:**
- Can attack the turn played (no summoning sickness)
- Immediate pressure

---

## LEVEL-UP SYSTEM

### Overview

Every hero has:
1. **Condition** = objective to achieve (unique per hero)
2. **Passive Bonus** = permanent effect when leveled (game-changing)
3. **Ultimate Access** = Ultimate cards become playable (before: dead draws)

### Leveling Mechanics

**Once Per Game:**
- Can only level up ONCE per match
- Irreversible (no downgrade)

**Tracking:**
- Each hero tracks progress differently (see hero sections)
- Visual indicator shows progress (e.g., "12/15 weapon damage dealt")

**When Leveled:**
- Passive bonus activates immediately
- All Ultimate cards in deck/hand become playable
- Often changes playstyle dramatically

---

### Hero-Specific Level-Ups

**BARBARIAN**
- Condition: Deal 15+ damage with Weapon Attacks
- Passive: Your Weapon Attacks deal bonus damage = Armor
- Timing: Turns 6-8 (after 2-3 weapon attacks)
- Impact: Defense becomes offense (6 Armor = +6 damage)

**NECROMANCER**
- Condition: Raise 5+ minions
- Passive: Raised minions enter play untapped
- Timing: Turns 6-7 (easy to achieve with cheap Raise effects)
- Impact: Mass Resurrection → 3 minions attack immediately

**MAGE**
- Condition: Cast 15+ spells
- Passive: Your spells cost 1 less
- Timing: Turns 7-9 (must cast many spells)
- Impact: Chain multiple spells per turn, explosive combos

**ROGUE**
- Condition: Spend 15 gold (Pay effects + shop)
- Passive: Weapon deals 2x damage to hero while In Stealth
- Timing: Turns 6-8 (gold accumulates naturally)
- Impact: Free burst damage (0 mana, 6+ damage while Stealthed)

---

## AI OPPONENT REQUIREMENTS

### MVP AI Specification

**Goal:** Rule-compliant opponent that makes legal moves and poses basic challenge.

**NOT Required:**
- Perfect play
- Advanced strategy
- Learning from games
- Human-like behavior

**Required Behaviors:**

**1. Legal Move Generation**
- Only consider actions allowed by rules
- Check mana costs, ability usage limits, summoning sickness
- Don't attempt illegal plays

**2. Basic Priority System**
Simple evaluation:
- Play cards if affordable
- Use Hero Power if mana available
- Attack with minions when board advantage
- Buy equipment when gold available
- End turn when no good actions

**3. Combat Decisions**
- **Attacking:** Attack if board power ≥ opponent's
- **Blocking:** Block biggest threats first with smallest defenders
- **Damage Order:** Assign lethal to first blocker, overkill if needed

**4. Target Selection**
- **Removal spells:** Target largest enemy minion
- **Damage spells:** Target hero if close to lethal, otherwise largest minion
- **Weapon Attack:** Target hero if unblocked path, otherwise largest minion

**5. Hero-Specific Basics**
- **Barbarian:** Use Hero Power, attack when 5+ Fury
- **Necromancer:** Play minions to fill graveyard, Raise when able
- **Mage:** Cast cheap spells, build Arcana
- **Rogue:** Enter Stealth when able, kill minions for gold

---

### AI Implementation Approach

**Suggested Architecture:**

**1. Action Generation Phase**
- List all legal actions this turn
- Categories: Play Card, Use Ability, Declare Combat, Buy Item, End Turn

**2. Action Evaluation Phase**
- Score each action (simple heuristic)
- Card value = stats + effects
- Removal value = enemy minion stats
- Equipment value = slot priority

**3. Action Selection Phase**
- Pick highest-scoring action
- Execute
- Repeat until no good actions remain

**4. End Turn**
- When all actions evaluated, end turn

---

**Simple Heuristics:**

**Card Value:**
- Minion: Attack × 1.5 + Health × 1.0
- Spell (damage): Damage × 1.2
- Spell (draw): Cards drawn × 2

**Equipment Value:**
- Weapon: 8 (high priority)
- Chest: 6
- Jewelry: 5
- Relic: 7

**Combat Threshold:**
- Attack if: (our board power) ≥ (their board power × 0.7)
- Board power = sum of (Attack + Health) of all minions

---

## GAME STATE & DATA FLOW

### Central State Structure

**What the game needs to track:**

```
MATCH LEVEL:
- Match ID
- Current player (1 or 2)
- Round number (1-15 typical)
- Turn number (1-30 typical)
- Phase (upkeep/main/end)
- Winner (null, 1, 2, or "draw")
- Game over? (boolean)

PLAYER STATE (×2, one for each player):
- Player ID (1 or 2)
- Is AI? (boolean)

- Hero:
  * Name (Barbarian/Necromancer/Mage/Rogue)
  * Health (current / max)
  * Armor (0-12 typical)
  * Mana (current / max)
  * Gold
  * Class Resource (Fury/Arcana, 0-12 typical)
  * Stealth state (boolean, Rogue only)
  * Leveled? (boolean)
  * Level progress (tracking toward condition)
  
  * Equipment:
    - Weapon (item object or null)
    - Chest (item object or null)
    - Jewelry (item object or null)
    - Relic (item object or null)
  
  * Abilities:
    - Hero Power (base or upgraded, cost, effect)
    - Attack (base or upgraded, cost, effect)
  
  * Abilities used this turn (array of ability names)

- Deck (array of card objects, order matters)
- Hand (array of card objects)
- Battlefield (array of minion objects)
- Discard (array of card objects)
- Graveyard (array of minion objects, Necromancer only)
- Echo Zone (array of spell objects, Mage only, max 3)

SHOP STATE (shared):
- Market (5 face-up cards, nulls for purchased slots)
- Early deck (remaining tier 1 cards)
- Mid deck (remaining tier 2 cards)
- Late deck (remaining tier 3 cards)
- Current tier (1, 2, or 3)

COMBAT STATE (temporary):
- Active? (boolean)
- Attackers (array of minion IDs)
- Blockers (array of {attackerId, blockerId} pairs)
- Damage order (for multi-blocks)

ACTION LOG:
- Array of timestamped action strings
- "Player 1 plays Fireball (4 mana)"
- "Fireball deals 5 damage to hero"
- "Player 1 ends turn"
```

---

### State Management Best Practices

**1. Immutability**
- Never mutate state directly
- Create new state objects for each change
- Makes undo/redo possible later

**2. Validation**
- Validate all actions before applying
- Check mana, ability limits, summoning sickness
- Return error if invalid

**3. Logging**
- Log every state change
- Critical for debugging + replay system
- User-visible action log

**4. Separation of Concerns**
- **UI Layer:** Displays state, captures input
- **Game Engine:** Validates + executes actions
- **State Container:** Holds current game state

---

### Data Flow Pattern

```
USER ACTION
   ↓
UI Component (button click, card drag, etc.)
   ↓
Action Dispatch (type + payload)
   ↓
Game Engine (validate legality)
   ↓
State Update (create new state)
   ↓
UI Re-render (React to new state)
   ↓
AI Response (if AI's turn)
```

**Example Flow:**
```
1. Player clicks "Play Fireball" targeting enemy hero
2. UI dispatches: { type: 'PLAY_CARD', card: fireball, target: enemyHero }
3. Engine validates: Has 4 mana? Has card in hand? Target valid?
4. Engine executes: Deduct mana, remove from hand, apply damage, add to discard
5. Engine returns new state
6. UI re-renders: Hand updates, hero health decreases, log shows action
7. If AI turn: AI evaluates board, picks action, repeats flow
```

---

## UI/UX REQUIREMENTS

### Core Layout (Desktop, 16:9 aspect ratio)

```
┌─────────────────────────────────────────────────────────────┐
│  [OPPONENT HERO BOARD] (Health, Mana, Gold, Resources)     │
│  Equipment: [W] [C] [J] [R]   Abilities: [HP] [ATK]        │
├─────────────────────────────────────────────────────────────┤
│  [OPPONENT BATTLEFIELD]                                      │
│  [Minion] [Minion] [Minion] [Minion] [Minion]             │
├─────────────────────────────────────────────────────────────┤
│  [SHARED SHOP PANEL]                                        │
│  Shop: [Item] [Item] [Item] [Item] [Item]    Tier: 2      │
├─────────────────────────────────────────────────────────────┤
│  [PLAYER BATTLEFIELD]                                        │
│  [Minion] [Minion] [Minion] [Minion] [Minion]             │
├─────────────────────────────────────────────────────────────┤
│  [PLAYER HAND]                                              │
│  [Card] [Card] [Card] [Card] [Card] [Card] [Card]         │
├─────────────────────────────────────────────────────────────┤
│  [PLAYER HERO BOARD] (Health, Mana, Gold, Resources)       │
│  Equipment: [W] [C] [J] [R]   Abilities: [HP] [ATK]        │
│  [USE HERO POWER] [USE ATTACK] [END TURN]                  │
└─────────────────────────────────────────────────────────────┘

Right Sidebar: [ACTION LOG]
- Turn-by-turn history
- Scrollable
- Filterable
```

---

### Essential UI Elements

**HERO BOARD DISPLAY:**
- Large health number (25/25)
- Armor indicator (shield icon + number)
- Mana crystals (filled vs empty, 0-10)
- Gold count (coin icon + number)
- Class resource (Fury/Arcana/etc., bar or number)
- Level-up progress (bar, "12/15 damage dealt")
- Leveled indicator (golden border or icon)

**MINION CARD DISPLAY:**
- Attack/Health (bottom corners)
- Mana cost (top left)
- Card name (top center)
- Effect text (center, readable)
- Tapped state (rotated 90° or grayed out)
- Summoning sickness indicator (zzz icon)
- Damage taken (temporary red numbers)
- Keywords (icons: shield for Defender, sword for Duelist, etc.)

**HAND CARD DISPLAY:**
- Cards fanned out (hover to expand)
- Playable cards highlighted (have enough mana)
- Unplayable cards grayed out
- Click to select, click battlefield/target to play
- Drag-and-drop alternative for card playing

**SHOP PANEL:**
- 5 cards visible always
- Gold cost prominent
- Purchased slots show "SOLD" or empty
- Current tier indicator (stars or text)
- Your gold total
- "BUY" button on each item

**ACTION LOG:**
- Right sidebar, always visible
- Scrollable
- Color-coded by player
- Icons for card types
- Expandable for details

**PHASE INDICATOR:**
- Top center
- "UPKEEP" → "MAIN PHASE" → "END PHASE"
- "OPPONENT'S TURN" when not active
- "COMBAT - DECLARE ATTACKERS" during combat phases

**BUTTONS & CONTROLS:**
- "USE HERO POWER" (shows cost, grayed if used)
- "USE ATTACK" (shows cost, grayed if used)
- "DECLARE COMBAT" (when minions can attack)
- "END TURN" (large, prominent)
- "CONCEDE" (small, corner)

---

### Interactive Elements

**TARGETING:**
- Click card → cursor shows targeting reticle
- Valid targets highlighted (green glow)
- Invalid targets grayed out
- Click target to confirm
- Right-click or ESC to cancel

**COMBAT DECLARATION:**
- Click minions to add to attackers
- Selected minions highlighted
- "CONFIRM ATTACKERS" button appears
- Opponent turn: select blockers similarly

**EQUIPMENT EQUIPPING:**
- Click shop item → "BUY FOR Xg" button
- Equipment immediately replaces old item
- Old item shows briefly before fading out

**CARD HOVER:**
- Hover over card → full-size preview (sidebar or modal)
- Shows full text, art, stats
- Hover over minion → shows buffs, keywords, etc.

---

### Visual Clarity Priorities

**MVP can be simple, but MUST be:**
1. **Readable:** All text legible at glance
2. **Clear state:** Obvious whose turn, what phase, what can be done
3. **Scannable:** Board state clear at a glance
4. **Responsive:** Clicks feel immediate
5. **No ambiguity:** Player always knows what will happen before confirming

**NOT required in MVP:**
- Beautiful art
- Smooth animations
- Particle effects
- Sound effects
- Voice lines

**But DO prioritize:**
- Clean layout
- Consistent colors (player = blue, opponent = red)
- Clear icons (mana, gold, armor, etc.)
- Good contrast (text readable on all backgrounds)

---

## TECHNICAL CONSTRAINTS

### Platform & Framework

**Platform:** Electron (desktop app)
**Why:** Native desktop feel, no browser chrome, existing tooling set up

**Frontend:** React 18 + Hooks
**Why:** Component reuse, state management, declarative UI

**Styling:** Tailwind CSS + Custom Game UI
**Why:** Rapid iteration, utility-first, easy customization

**State Management:** React Context + useReducer (or Redux if complex)
**Why:** Clean separation, predictable updates, works with React

**Data Loading:** PapaParse (CSV parsing)
**Why:** Already in use, handles deck CSVs

**Storage:** localStorage (for save games, future)
**Why:** Simple, sufficient for single-player

---

### Existing Infrastructure to Reuse

**From Card Tool:**
- CSV parser (utils/csvParser.js)
- Deck storage system (localStorage patterns)
- Card rendering components (adapt for game view)
- Color schemes (utils/customization.js)
- Keyword bolding logic

**Add New:**
- Game mode / Game tab in main app
- Game state management (Context + Reducer)
- Game engine (pure JS, no UI)
- AI player logic (separate module)
- Combat resolver
- Shop manager
- Turn manager

---

### Data Structure Formats

**DECK CSV FORMAT:**
(Already used in tool, must match)

```csv
Card Name,Card Type,Copies,Mana Cost,Attack,Health,Effect,Bounty,State
Fury Initiate,Minion,3,1,2,1,Gain 1 Fury when played,1,
Fireball,Spell,2,4,,,Deal 5 damage to any target,,
```

**EQUIPMENT CSV FORMAT:**
```csv
Item Name,Category,Slot,Tier,Cost,Effect,Relic Type
Desolator,Weapon,Weapon,3,15,+3 weapon damage,
Heart of Tarrasque,Chest,Chest,3,12,+10 max health,
```

**Card Object (in memory):**
```javascript
{
  id: "card_12345", // unique instance ID
  name: "Fireball",
  cardType: "Spell",
  manaCost: 4,
  effect: "Deal 5 damage to any target",
  copies: 2, // from CSV
  // Minions only:
  attack: null,
  health: null,
  bounty: null
}
```

**Minion Object (on battlefield):**
```javascript
{
  id: "minion_12345", // unique instance ID
  cardId: "card_12345", // original card
  name: "Fury Initiate",
  attack: 2,
  currentHealth: 1,
  maxHealth: 1,
  bounty: 1,
  tapped: false,
  summoningSickness: true,
  keywords: ["Prepared"], // parsed from effect
  buffs: [], // temporary modifiers
}
```

---

### Performance Considerations

**Target:**
- Game runs smoothly at 60 FPS
- State updates feel instant (<50ms)
- AI turns complete within 1-3 seconds (not instant, feels "thinking")

**Optimization Tips:**
- Use React.memo for cards (prevent unnecessary re-renders)
- Batch state updates (don't update 50 times in one action)
- Lazy load card images (if images added later)
- Keep game logic in pure JS (no DOM manipulation in engine)

---

## DEVELOPMENT BEST PRACTICES

### Recommended Development Order

**Phase 1A: Foundation (Week 1-2)**
1. Set up game mode in existing app
2. Create Hero Selection screen (4 hero buttons, deck dropdowns)
3. Load decks from CSVs (reuse existing parser)
4. Initialize game state (both players, decks, shop)
5. Basic game board UI (hero boards, battlefield, hand, shop)
6. Display game state (no interactions yet)

**Phase 1B: Core Actions (Week 2-3)**
1. Play minions from hand (drag or click → battlefield)
2. Cast spells (click → target → resolve)
3. Hero Power button (click → pay mana → effect)
4. Attack button (click → target → damage)
5. End Turn button (advance phase → switch player)
6. Basic turn structure (Upkeep → Main → End)

**Phase 1C: Combat System (Week 3-4)**
1. Declare attackers (click minions, tap them)
2. Declare blockers (opponent selects, assignments)
3. Resolve combat (damage calculation, deaths, bounties)
4. Multi-block damage ordering UI

**Phase 1D: Advanced Systems (Week 4-5)**
1. Shop purchases (click item → spend gold → equip)
2. Equipment effects (weapon damage, armor, etc.)
3. Level-up tracking (progress bars, condition checks)
4. Level-up triggers (passive activation, Ultimate unlock)
5. Hero-specific mechanics (Fury, Raise, Arcana, Stealth, Pay)

**Phase 1E: AI Opponent (Week 5-6)**
1. Basic AI (random legal moves)
2. Improved AI (simple heuristics)
3. Hero-specific AI (understands class mechanics)
4. Combat AI (blocking decisions)

**Phase 1F: Polish & Testing (Week 6-7)**
1. Action log improvements
2. Visual feedback (card glow, highlights, etc.)
3. Win/loss screen
4. Bug fixes
5. Playtesting

---

### Testing Strategy

**Unit Tests:**
- Game engine functions (pure logic, no UI)
- Combat resolver (damage calculations)
- Level-up conditions
- Card effects

**Integration Tests:**
- Full turn sequences
- AI vs AI games (run 1000x, check for crashes)
- Hero-specific mechanics

**Manual Playtesting:**
- Play each hero vs each AI hero
- Test edge cases (simultaneous death, empty deck, 0 mana plays)
- Test all Ultimates
- Test shop refresh timing
- Test level-up triggers

---

### Code Organization Tips

**Keep Game Logic Separate from UI:**
- ✅ Good: `GameEngine.playCard(state, card)` → new state
- ❌ Bad: Card component directly mutates state

**Use Pure Functions:**
- ✅ Good: `function resolveCombat(state) { return newState; }`
- ❌ Bad: `function resolveCombat() { state.combat = ...; }`

**Validate Before Execute:**
- Always check if action is legal before applying
- Return error object if illegal
- UI shows error message

**Log Everything:**
- Every state change should log to action log
- Critical for debugging
- Users love seeing what happened

---

### Common Pitfalls to Avoid

**1. Forgetting Turn Restrictions**
- Hero Power used twice in one turn
- Minions attacking with summoning sickness
- Buying 2 items in one turn

**2. Combat Edge Cases**
- Multi-block damage ordering
- Simultaneous death (attacker + blocker both die)
- Keyword interactions (Duelist priority)

**3. Hero Mechanic Bugs**
- Fury not resetting after Attack
- Stealth not breaking on hero damage
- Arcana persisting when it shouldn't
- Raised minions having summoning sickness (before level-up)

**4. Shop Refresh Timing**
- Refreshing on wrong round
- Not clearing purchased slots
- Tier deck shuffle randomness

**5. Gold/Mana Tracking**
- Not awarding bounties
- Not refilling mana in Upkeep
- Not gaining +1 gold in End Phase

---

## TESTING & BALANCE CONSIDERATIONS

### Critical Test Cases

**GAME FLOW:**
- [ ] First player gets 4 cards, second gets 5
- [ ] First player starts with 1 mana, second with 2
- [ ] Shop refreshes at Round 5 and Round 9
- [ ] Game ends when hero reaches 0 HP
- [ ] Simultaneous death = draw

**TURN STRUCTURE:**
- [ ] Mana refills to max each Upkeep
- [ ] Max mana caps at 10
- [ ] Minions heal to full at End Phase
- [ ] +1 gold at End Phase
- [ ] Abilities reset each turn

**COMBAT:**
- [ ] Summoning sickness prevents attacks (not blocks)
- [ ] Attackers tap, blockers don't
- [ ] Multi-block damage ordered correctly
- [ ] Bounties awarded to correct player
- [ ] Minions die at 0 health

**HERO MECHANICS:**
- [ ] Barbarian: Fury resets after Attack
- [ ] Necromancer: Graveyard only has minions
- [ ] Mage: Arcana persists forever
- [ ] Rogue: Stealth breaks on hero Attack damage only

**LEVEL-UP:**
- [ ] Can only level once per game
- [ ] Passive activates immediately
- [ ] Ultimates become playable
- [ ] Progress tracked correctly

**SHOP:**
- [ ] Can only buy 1 item per turn
- [ ] Equipment replaces old item
- [ ] Consumables activate immediately
- [ ] Purchased slots stay empty until refresh

---

### Balance Testing

**AI Winrate Goal:** 40-60% (challenging but beatable)

**Hero Balance Check:**
- Each hero should win ~50% vs each other hero (after 100 games)
- No hero should feel "unplayable" or "auto-win"

**Equipment Balance Check:**
- No item should be "always correct buy"
- Late tier items should feel impactful
- Consumables should be situationally good

**Level-Up Timing Check:**
- All heroes should level around turns 6-8
- No hero should level turn 3 or turn 15

**Game Length Check:**
- Average game: 10-15 rounds (20-30 turns)
- Shortest game: ~8 rounds (fast aggro)
- Longest game: ~18 rounds (grindy control)

---

## APPENDIX: QUICK REFERENCE

### Mana Curve
- Turn 1: 1 mana
- Turn 2: 2 mana
- Turn 3: 3 mana
- ...
- Turn 10+: 10 mana (max)

### Round → Turn Conversion
- Round 1 = Turns 1-2 (both players)
- Round 2 = Turns 3-4
- Round 3 = Turns 5-6
- Round 4 = Turns 7-8 (SHOP REFRESH)
- Round 5 = Turns 9-10
- ...
- Round 9 = Turns 17-18 (SHOP REFRESH)

### Bounty Values
- 1-3 cost minions: 1g
- 4 cost minions: 2g
- 5+ cost minions: 3g

### Keywords Summary
- **Defender:** Must be blocked
- **Duelist:** Strikes first
- **Prepared:** No summoning sickness
- **Empower:** Permanent buff trigger
- **Deathrattle:** Effect on death
- **Channeled:** Bonus if spell cast first
- **Echo:** Add to Echo Zone

### Hero Level-Up Shortcuts
- Barbarian: 15 weapon damage
- Necromancer: 5 Raises
- Mage: 15 spells cast
- Rogue: 15 gold spent

---

## CONCLUSION

This document defines the complete scope of the card game video game. It explains:
- **WHAT** systems exist (turn structure, combat, shop, heroes)
- **HOW** they work (rules, mechanics, interactions)
- **WHEN** to build them (development phases)
- **WHY** design decisions matter (best practices, pitfalls)

**Next Steps for Development:**
1. Review this document thoroughly
2. Set up game mode in existing app
3. Build hero selection screen
4. Implement core game loop (MVP Phase 1)
5. Test each system as you build
6. Iterate based on playtesting

**Remember:** MVP is about functionality, not polish. Get the rules working correctly first. Animations, sounds, and advanced AI come later.

Good luck building the game!

---

**Document Version:** 1.0  
**Last Updated:** October 29, 2025  
**Authors:** Game Design Team + Technical Producer
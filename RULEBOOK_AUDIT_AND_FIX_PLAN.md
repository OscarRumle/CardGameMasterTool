# Rulebook Audit & Fix Plan

**Date**: 2025-10-29
**Audited Against**: Rulebook: Complete Edition (17 pages)
**Current Implementation**: Card Game Master Tool (GameBoard.jsx, gameEngine.js)

---

## CRITICAL DISCREPANCIES FOUND

### ❌ **1. STARTING HEALTH (CRITICAL)**
**Location**: `src/utils/gameEngine.js:6`

**Current Implementation**:
```javascript
STARTING_HEALTH: 30
```

**Rulebook Says**:
> Hero Health: **25**

**Fix Required**: Change to 25

---

### ❌ **2. NECROMANCER MECHANICS - NOT IN RULEBOOK (CRITICAL)**
**Location**:
- `GameBoard.jsx:511-523` (Sacrifice button)
- `GameBoard.jsx:454-475` (Graveyard zone)
- `gameEngine.js:1205-1263` (raiseMinion function)
- `gameEngine.js:1268-1315` (sacrificeMinion function)

**Current Implementation**:
- Necromancer has "Raise Minion" mechanic (click graveyard to raise)
- Necromancer has "Sacrifice Minion" button on all minions (+1 mana)
- Necromancer has a graveyard zone separate from discard

**Rulebook Says**:
> **NO MENTION** of Necromancer having Raise or Sacrifice mechanics.
> The rulebook does NOT define Necromancer-specific mechanics beyond:
> - Hero Power: Class-specific (not specified)
> - Attack ability: Same as all heroes (2 mana, weapon attack)

**Fix Required**:
1. **REMOVE** entire Necromancer raise/sacrifice system
2. **REMOVE** graveyard zone (only discard pile exists)
3. **REMOVE** sacrifice button from minions
4. Check Hero Design Docs to see what Necromancer's actual mechanics should be

---

### ❌ **3. SHOP REROLL - NOT IN RULEBOOK (CRITICAL)**
**Location**:
- `GameBoard.jsx:687-697` (Reroll button)
- `gameEngine.js:1481-1523` (rerollShop function)

**Current Implementation**:
- Shop has a "REROLL (1g)" button
- Costs 1 gold
- Replaces all 5 shop items with new random items from current tier

**Rulebook Says**:
> **Shop Refresh Timing**
> - Rounds 1-4: 5 Early items available (same items all rounds)
> - Round 5: Refresh → 5 Mid items
> - Rounds 5-8: Same 5 Mid items available
> - Round 8: Refresh → 5 Late items
> - Round 9+: Same 5 Late items for rest of game
>
> **Purchasing Rules**
> - Purchased slot stays **empty until refresh**
> - NO REROLL MECHANIC mentioned

**Fix Required**:
1. **REMOVE** reroll button completely
2. **REMOVE** rerollShop function
3. Purchased items should leave empty slot until next automatic refresh
4. Shop refreshes ONLY on Round 5 and Round 8

---

### ❌ **4. SHOP REFRESH TIMING (CRITICAL)**
**Location**: `gameEngine.js:461-462`

**Current Implementation**:
```javascript
if (newState.roundNumber === 5 || newState.roundNumber === 9) {
  newState = refreshShop(newState);
}
```

**Rulebook Says**:
> - Round 5: Refresh → 5 Mid items
> - Round **8**: Refresh → 5 Late items

**Fix Required**: Change round 9 to round **8**

---

### ❌ **5. HERO POWERS - ALL WRONG (CRITICAL)**
**Location**: `gameEngine.js:193-221`

**Current Implementation**:
- **Necromancer**: "Dark Pact" (2 mana: Sacrifice 2 HP, draw a card)
- **Barbarian**: "Battle Fury" (1 mana: Gain 2 Fury)
- **Mage**: "Arcane Surge" (1 mana: Gain 1 Arcana, draw if Arcana >= 5)
- **Rogue**: "Shadow Step" (2 mana: Enter Stealth)

**Rulebook Says**:
> **Hero Power**: Costs mana (usually 1-2 mana), Once per turn
> - **Barbarian**: "Gain 2 Armor"
> - **Mage**: "Gain 1 Spellpower"
> - Hero powers are class-specific but NOT the ones currently implemented

**Fix Required**:
1. **Barbarian**: Change to "Gain 2 Armor" (1-2 mana cost, check design docs)
2. **Mage**: Change to "Gain 1 Spell Damage" (1-2 mana cost, check design docs)
3. **Necromancer** & **Rogue**: Check Hero Design Docs for correct powers

---

### ❌ **6. HERO ATTACK ABILITY - COMPLETELY WRONG (CRITICAL)**
**Location**: `gameEngine.js:227-256`

**Current Implementation**:
- **Necromancer**: "Life Drain" (1 damage)
- **Barbarian**: "Fury Strike" (damage = Fury, reset Fury to 0)
- **Mage**: "Arcane Bolt" (1 damage)
- **Rogue**: "Quick Strike" (1 damage, 2x while Stealthed)

**Rulebook Says**:
> **ATTACK (Using Your Weapon)** - ALL HEROES HAVE THE SAME ATTACK ABILITY:
> - Costs **2 mana**
> - Once per turn
> - Target: enemy minion OR enemy hero
> - **Heroes start with base weapon damage of 2**
> - **Weapon equipment adds to this total** (e.g., Blades of Attack +1 = 3 total)
> - When attacking minions: Take damage back equal to their attack
> - When attacking heroes: Take damage equal to opponent's weapon
> - Gain bounty if Attack kills a minion

**Fix Required**:
1. **REMOVE** all hero-specific attack abilities
2. **IMPLEMENT** universal "Attack" ability:
   - 2 mana cost
   - Base damage: 2
   - Weapon equipment adds damage
   - Player takes damage back from target (minion's attack or opponent's weapon)
   - Gain bounty on kill

---

### ❌ **7. CLASS RESOURCES - WRONG NAMES & MECHANICS (CRITICAL)**
**Location**: `gameEngine.js:139-187`

**Current Implementation**:
- **Barbarian**: "Fury" (offensive resource, persists)
- **Mage**: "Arcana" (spell casting resource)
- **Necromancer**: "none" (uses Raise/Sacrifice)
- **Rogue**: "Stealth" (boolean)

**Rulebook Says**:
> **Class Resources:**
> - **Armor** (All Heroes): Max 10, reduces damage by 1 per point
> - **Rage (Barbarian)**: Offensive resource, persists, doesn't reset, **increases damage**
> - **Spell Damage (Mage)**: Max **5**, player chooses how much to spend when casting damage spell, **resets after casting damage spell**
> - **Channeled (Mage)**: Keyword on Mage spells - bonus if cast another spell this turn

**Fix Required**:
1. **Barbarian**: Rename "Fury" → "**Rage**"
2. **Mage**: Rename "Arcana" → "**Spell Damage**", add max of **5**
3. **Mage**: Implement reset after casting damage spell
4. **Necromancer**: Remove Raise/Sacrifice, check design docs for actual mechanic
5. **All Heroes**: Ensure Armor is properly implemented (max 10)

---

### ❌ **8. LEVEL-UP THRESHOLDS - LIKELY WRONG**
**Location**: `gameEngine.js:12-16`

**Current Implementation**:
```javascript
BARBARIAN_LEVEL_THRESHOLD: 15,
NECROMANCER_LEVEL_THRESHOLD: 5,
MAGE_LEVEL_THRESHOLD: 15,
ROGUE_LEVEL_THRESHOLD: 15,
```

**Rulebook Says**:
> Level-up quests have specific conditions:
> - **Example**: "Have 8+ Armor"
> - Typical timing: Turns 5-8 (mid-game)
> - Once per game only

**Fix Required**:
- **Check Hero Design Docs** for actual level-up conditions
- These thresholds may not match the actual game design

---

### ❌ **9. TURN PHASES - MAY BE INCORRECT**
**Location**: `gameEngine.js:49`

**Current Implementation**:
```javascript
phase: 'main', // upkeep/main/end
```

**Rulebook Says**:
> Each turn has **three phases**:
> 1. **UPKEEP PHASE**: Untap, gain mana, draw, trigger effects
> 2. **MAIN PHASE**: Play cards, use abilities, declare combat, buy from shop
> 3. **END PHASE**: Trigger effects, **minions heal**, gain +1 gold, pass turn

**Implementation Looks Mostly Correct** ✅
- Upkeep: Line 479-519 ✅
- Main: Default phase ✅
- End: Line 423-474 ✅

**Potential Issue**:
- End phase should explicitly set phase to 'end' before switching player
- Currently mixes end phase and next player's upkeep

---

### ❌ **10. COMBAT SYSTEM - NEED TO VERIFY**
**Current Implementation**:
- Has declare attackers, declare blockers, resolve combat
- Multiple blockers can gang up

**Rulebook Says**: (Matches mostly, but needs careful review)
- **CRITICAL RULE**: Minions ONLY attack heroes, not other minions
- Hero Attack ability CAN target minions
- All damage simultaneous
- Multiple blockers: attacker chooses order, must assign lethal

**Fix Required**:
- Review combat code carefully against rulebook
- Ensure minions can't target other minions in combat
- Verify multiple blocker damage order logic

---

### ⚠️ **11. ROUND TRACKING**
**Current Implementation**: Uses "roundNumber" (increments when player turn starts again)

**Rulebook Says**:
> **What's a Round?** A round = one turn per player. Round 3 means after both players have taken 3 turns each (6 total turns).

**Status**: Appears correct, but verify shop refreshes align with this definition

---

## SUMMARY OF CRITICAL FIXES

| # | Issue | Severity | Files Affected | Estimated Effort |
|---|-------|----------|----------------|------------------|
| 1 | Starting Health (30 → 25) | CRITICAL | gameEngine.js | 5 min |
| 2 | Remove Necromancer Raise/Sacrifice | CRITICAL | GameBoard.jsx, gameEngine.js | 2 hours |
| 3 | Remove Shop Reroll | CRITICAL | GameBoard.jsx, gameEngine.js | 30 min |
| 4 | Shop Refresh (Round 9 → 8) | CRITICAL | gameEngine.js | 5 min |
| 5 | Fix All Hero Powers | CRITICAL | gameEngine.js | 3 hours |
| 6 | Fix Attack Ability (Universal) | CRITICAL | gameEngine.js | 4 hours |
| 7 | Fix Class Resources | CRITICAL | gameEngine.js | 3 hours |
| 8 | Fix Level-Up Conditions | HIGH | gameEngine.js, Hero Docs | 2 hours |
| 9 | Review Turn Phases | MEDIUM | gameEngine.js | 1 hour |
| 10 | Verify Combat System | HIGH | gameEngine.js | 2 hours |

**Total Estimated Effort**: ~17-20 hours

---

## IMPLEMENTATION PLAN

### Phase 1: Quick Wins (30 minutes)
✅ Fix starting health (30 → 25)
✅ Fix shop refresh timing (Round 9 → 8)
✅ Remove shop reroll button from UI

### Phase 2: Read Hero Design Docs (1 hour)
📖 Read Design_Doc_-_Barbarian.pdf
📖 Read Design_Doc_-_Mage.pdf
📖 Read Design_Doc_-_Necromancer.pdf
📖 Read Design_Doc_-_Rogue.pdf
📝 Document actual hero powers, mechanics, and level-up conditions

### Phase 3: Hero Powers & Abilities (6 hours)
🔧 Implement correct hero powers for all 4 heroes
🔧 Replace hero-specific attacks with universal Attack ability
🔧 Fix weapon damage calculation (base 2 + equipment)
🔧 Implement damage-back when attacking
🔧 Implement bounty on kill via Attack

### Phase 4: Class Resources (3 hours)
🔧 Rename Fury → Rage for Barbarian
🔧 Rename Arcana → Spell Damage for Mage
🔧 Add max 5 cap for Spell Damage
🔧 Implement Spell Damage reset after damage spell
🔧 Remove Necromancer Raise/Sacrifice
🔧 Implement correct Necromancer mechanic from design docs

### Phase 5: Level-Up System (2 hours)
🔧 Implement correct level-up conditions from design docs
🔧 Implement correct level-up bonuses
🔧 Fix Ultimate card unlock system

### Phase 6: Shop System (2 hours)
🔧 Remove reroll function from gameEngine
🔧 Implement empty slot behavior on purchase
🔧 Verify shop refresh only on Round 5 and 8
🔧 Verify tier progression works correctly

### Phase 7: Combat & Turn Structure (3 hours)
🔧 Verify minions only attack heroes (not other minions)
🔧 Verify Attack ability can target minions
🔧 Verify multiple blocker damage order
🔧 Verify turn phase transitions
🔧 Verify minion healing at end of turn

### Phase 8: Testing & Validation (3 hours)
🧪 Test full game flow against rulebook
🧪 Test all 4 heroes with correct mechanics
🧪 Test shop purchases and refreshes
🧪 Test combat with multiple blockers
🧪 Test level-up system

---

## NEXT STEPS

1. ✅ **APPROVED**: Read this audit document
2. 📖 **NEXT**: Read all 4 Hero Design Docs to get correct mechanics
3. 🔧 **THEN**: Begin Phase 1 (Quick Wins)
4. 🔧 **CONTINUE**: Phases 2-8 in order

---

## NOTES

- Many mechanics were custom-invented and don't match the rulebook
- Necromancer's entire mechanic set appears to be homebrew
- Hero powers are completely different from rulebook
- Attack ability is hero-specific when it should be universal
- Class resources have wrong names and wrong mechanics

**This needs significant refactoring to match the rulebook.**

# Correct Hero Mechanics from Design Docs

This document summarizes the CORRECT hero mechanics from the official Hero Design PDFs. Use this as reference when implementing fixes.

## UNIVERSAL MECHANICS (ALL HEROES)

### Starting Health
- **25 HP** (NOT 30)

### Base Weapon Damage
- All heroes start with **weapon damage 2**
- Equipment adds to this total

### Attack Ability (Base - All Heroes Same)
- **Cost**: 2 mana
- **Effect**: Deal weapon damage to target enemy minion or hero
- Take damage back equal to their Attack (minion) or weapon (hero)
- Gain bounty if Attack kills a minion

---

## BARBARIAN

### Hero Power
- **Base**: "War Cry" - Cost 1 mana: Gain 2 Armor
- **Upgrade**: "Berserker's Roar" - Cost 1 mana: Gain 2 Armor and 1 Fury

### Attack Ability
- **Base**: "Weapon Strike" - Cost 2 mana: Deal weapon damage to target. Take damage back. **When you use this, spend ALL Fury for bonus damage**
- **Upgrade**: "Devastating Blow" - Cost 2 mana: Deal (weapon + Fury) to target. **When you attack at 5+ Fury: This costs 0 instead**

### Level-Up
- **Condition**: Deal 15+ damage with Weapon Attacks
- **Passive**: Your Weapon Attacks deal bonus damage equal to your Armor

### Key Mechanic
- **Fury**: Accumulating offensive resource. Gain from minions/spells. When you Attack, spend ALL Fury for bonus damage (weapon + Fury = total damage). Fury resets to 0 after attacking.
- **Armor**: Max 10. Reduces damage by 1 per point.

---

## MAGE

### Hero Power
- **Base**: "Arcane Focus" - Cost 1 mana: Gain 1 Arcana
- **Upgrade**: "Arcane Mastery" - Cost 1 mana: Gain 1 Arcana and draw a card

### Attack Ability
- **Base**: "Arcane Blast" - Cost 2 mana: Deal weapon damage to target. Take damage back.
- **Upgrade**: "Empowered Blast" - Cost 2 mana: Deal weapon damage +1 to target. **5+ Arcana: This costs 0 instead**

### Level-Up
- **Condition**: Cast 15 spells
- **Passive**: Your spells cost 1 less

### Key Mechanics
- **Arcana**: Gain 1 Arcana for every 3 mana spent on spells (round down). Persists permanently. Cards have threshold bonuses at different Arcana levels (3+, 5+, 6+, 8+). You don't spend Arcana - it's a stat that makes cards better.
- **Echo**: When you cast a spell, place it face-up in your Echo Zone (max 3 spells). Later, recast it for 2 mana less.

---

## NECROMANCER

### Hero Power
- **Base**: "Soul Harvest" - Cost 1 mana: Sacrifice 2: Draw a card
- **Upgrade**: "Unholy Empowerment" - Cost 1 mana: Sacrifice 2: Draw a card. If you sacrificed a minion, gain 1 Health

### Attack Ability
- **Base**: "Deathtouch" - Cost 2 mana: Deal weapon damage to target. Take damage back. **If target dies, Raise 1 minion (2-cost or less)**
- **Upgrade**: "Reaper's Touch" - Cost 2 mana: Deal weapon damage +1 to target. Take damage back. **If target dies, Raise 1 minion (3-cost or less)**

### Level-Up
- **Condition**: Raise 5 minions from your graveyard
- **Passive**: Raised minions enter play untapped (can attack immediately)

### Key Mechanics
- **Raise**: Bring minions back from your graveyard to the battlefield. Raised minions enter tapped UNLESS you've leveled up.
- **Sacrifice**: Pay health OR kill your own minions to activate effects. Syntax: "Sacrifice X: [Effect]". You choose to pay X HP or kill a minion with health ≥ X. Opponent does NOT gain bounty.

---

## ROGUE

### Hero Power
- **Base**: "Shadowstep" - Cost 1 mana: Enter Stealth
- **Upgrade**: "Calculated Strike" - Cost 1 mana: Enter Stealth and deal 1 damage to target enemy minion

### Attack Ability
- **Base**: "Blade Strike" - Cost 2 mana: Deal weapon damage to target. Take damage back. **(Taking damage from enemy hero attacks breaks your Stealth)**
- **Upgrade**: "Assassin's Strike" - Cost 2 mana: Deal weapon damage +1 to target. If you kill target, don't take damage back. **Stealth: Cost 0 instead**

### Level-Up
- **Condition**: Spend 15 gold (on Pay effects or in shop)
- **Passive**: Your Weapon Attacks deal double damage to the enemy hero while In Stealth

### Key Mechanics
- **Stealth**: A state you enter and maintain. While In Stealth, you can't be targeted by enemy spells. Persists across turns. Broken when you take damage from enemy hero's Attack ability (NOT broken by minion combat damage or spell damage to your minions).
- **Pay**: Spend gold to activate powerful effects. Syntax: "Pay X: [Effect]"

---

## KEY DIFFERENCES FROM CURRENT IMPLEMENTATION

1. **Starting Health**: 30 → **25**
2. **Shop Refresh**: Rounds [5, 9] → **[5, 8]**
3. **Shop Reroll**: Remove entirely (not in rulebook)
4. **All Hero Attacks**: Should follow universal pattern (2 mana, weapon damage, take damage back)
5. **Barbarian**:
   - Keep "Fury" naming (design doc uses "Fury")
   - Attack spends ALL Fury for bonus damage
   - Level-up adds Armor to weapon damage
6. **Mage**:
   - Arcana = 1 per 3 mana spent on spells
   - Hero Power just gains 1 Arcana (simple)
7. **Necromancer**:
   - Remove custom Raise/Sacrifice UI mechanics from GameBoard
   - Raise is card-based, not a universal button
   - Sacrifice is a cost on specific cards
8. **Rogue**:
   - Keep as-is (already well-designed)

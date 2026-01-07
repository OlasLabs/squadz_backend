# XP System

## Description
Defines the XP (Experience Points) system for SQUADZ app including XP allocation rules, reward calculations, grade progression, and coin earnings. Use this as the authoritative source for implementing XP tracking, player progression, and reward distribution.

---

## XP Allocation Rules

### Match Outcome XP
All players on a squad receive XP based on match result:

- **Win**: 10 XP
- **Draw**: 6 XP
- **Loss**: 3 XP

### Individual Performance XP

**Recognition Awards:**
- **MVP of the Match**: 8 XP
- **Match Rating ≥ 8.0**: 4 XP
- **Match Rating ≥ 7.0**: 2 XP

**Goal Contributions:**
- **Goal Scored**: 5 XP
- **Assist**: 4 XP

**Defensive Performance:**
- **Clean Sheet**: 5 XP (defenders and goalkeepers only)
- **Successful Tackle**: 1 XP (maximum 3 per match, total cap of 3 XP)

**Participation:**
- **Playing Full Match**: 2 XP
- **Subbed On / Played Partial Match**: 1 XP

**Discipline:**
- **No Fouls or Cards**: 2 XP

### Challenge Completion XP

- **Easy Challenge**: 6 XP
- **Medium Challenge**: 10 XP
- **Difficult Challenge**: 20 XP
- **Squad Challenges**: 10 XP

> Note: Squad Challenges are team-based challenges where all squad members work toward the same goal.

### Team Achievement XP
All squad members receive XP when team hits these milestones:

- **Team Wins 3 Matches in a Row**: 5 XP (per member)
- **Team Scores 10 Goals in a Week**: 4 XP (per member)
- **Team Keeps 3 Clean Sheets in a Row**: 5 XP (per member)
- **Team Goes Unbeaten for a Week**: 8 XP (per member)

---

## Coin Rewards

Coins are earned through specific achievements:

### Challenge-Based Coins
- **Completing Medium Challenge**: 1 Coin
- **Completing Difficult Challenge**: 2 Coins

### Performance-Based Coins
- **Weekly Top 10 XP Earners**: 2 Coins (per player in top 10)
- **Individual Seasonal Awards**: 3 Coins (Top Scorer, MVP, etc.)

### Team-Based Coins
- **Team Wins Competition**: 5 Coins (per member)

---

## Grade Progression System

### Grade Tiers

Players progress through 4 grade levels based on total accumulated XP:

**Grade D - Beginner**
- XP Range: 0 - 249 XP
- Difficulty: Easy
- Target: New players can reach Grade C within 1 tournament if active

**Grade C - Competent**
- XP Range: 250 - 799 XP
- Difficulty: Moderate
- Target: Requires consistent performance over several matches

**Grade B - Talent**
- XP Range: 800 - 1,999 XP
- Difficulty: Hard
- Target: Requires strong performances across multiple competitions

**Grade A - World Class**
- XP Range: 2,000+ XP
- Difficulty: Very Hard
- Target: Only top, long-term active players reach and maintain this level

### Progression Characteristics

**XP Curve Type**: Linear progression with increasing gaps between grades

**Promotion Logic**: 
- Player promoted immediately upon reaching next grade's minimum XP
- No demotion system (grades are permanent achievements)

**Timeframe Estimates:**
- Grade D → C: ~1 active tournament
- Grade C → B: Several tournaments with consistent performance
- Grade B → A: Multiple competitions with strong performances
- Grade A: Long-term achievement for elite players

---

## XP Calculation Rules

### Match XP Stacking
Players can earn multiple XP rewards from a single match:

**Example Calculation:**
- Win: 10 XP
- 1 Goal: 5 XP
- 1 Assist: 4 XP
- Match Rating 8.2: 4 XP
- Full Match: 2 XP
- No Cards: 2 XP
- **Total: 27 XP from one match**

### Position-Specific Restrictions
- **Clean Sheet XP**: Only awarded to defenders and goalkeepers
- Validate player position before awarding clean sheet XP

### Performance Caps
- **Tackle XP**: Maximum 3 tackles counted per match (cap at 3 XP)
- All other performance XP has no per-match cap

### Match Rating Tiers
- **Rating ≥ 8.0**: Awards 4 XP (does NOT stack with 7.0+ tier)
- **Rating ≥ 7.0**: Awards 2 XP (only if rating is below 8.0)
- Rating system uses single highest tier achieved

### Team Achievement Distribution
- All active squad members receive team achievement XP
- "Active" defined as: participated in at least one match during achievement period
- Members who left squad before achievement completion do NOT receive XP

---

## XP Tracking Requirements

### Data Points to Track

**Per Match:**
- Match outcome (win/draw/loss)
- Individual goals scored
- Individual assists
- Match rating (numerical value)
- Clean sheet status (for defenders/GKs)
- Successful tackles count
- Minutes played (full vs partial)
- Fouls committed
- Cards received (yellow/red)
- MVP award status

**Per Challenge:**
- Challenge difficulty tier
- Completion timestamp
- XP reward amount

**Per Team Achievement:**
- Achievement type
- Active squad members at completion
- XP distribution amount

**Player Totals:**
- Total accumulated XP (lifetime)
- Current grade level
- Total coins earned

### XP Award Timing
- **Match XP**: Awarded immediately after match result is confirmed
- **Challenge XP**: Awarded immediately upon challenge completion validation
- **Team Achievement XP**: Awarded when achievement criteria is met, distributed to all eligible members
- **Grade Promotion**: Calculated and updated immediately when XP threshold is crossed

---

## Validation Rules

### Clean Sheet Validation
- Match must end with opponent scoring 0 goals
- Player must be defender or goalkeeper
- Player must have participated in the match (started or subbed on)

### Full Match Validation
- Player must be in starting lineup
- Player must complete entire match duration (no substitution off)

### Partial Match Validation
- Player subbed on from bench OR
- Player started but was substituted off before match end

### No Fouls or Cards Validation
- Zero fouls recorded for player in match stats
- No yellow or red cards received
- Both conditions must be met

### Tackle Cap Logic
- Count successful tackles from match stats
- If tackles > 3, cap XP at 3 (award only 3 XP)
- If tackles ≤ 3, award 1 XP per tackle

### Team Achievement Eligibility
- Player must be current squad member at achievement completion time
- Player must have participated in at least 1 match during achievement tracking period
- Example: For "3 wins in a row", player must have played in at least 1 of those 3 matches

---

## Edge Cases

### Multiple Awards in Same Category
- Player can earn both "Goal Scored" and "Assist" in same match
- Player can earn both "Match Rating ≥ 8.0" and "MVP" in same match
- All earned XP stacks additively

### Match Rating Threshold Overlap
- If rating is 8.0+, player gets 4 XP (not 4 XP + 2 XP)
- Only highest tier applies, no stacking between rating tiers

### Tackles Beyond Cap
- If player makes 5 tackles, only 3 XP awarded
- Track actual tackle count for stats, but cap XP reward

### Grade Boundaries
- Player at exactly 250 XP is Grade C (inclusive lower bound)
- Player at exactly 2,000 XP is Grade A (inclusive lower bound)
- Use >= comparison for grade thresholds

### Coin Rewards Timing
- Coins awarded separately from XP
- Weekly Top 10 calculated at end of each week
- Seasonal awards calculated at competition end

### Team Achievement During Player Transfer
- If player transfers mid-achievement, they only get XP if achievement completes while in new squad
- Example: Player transfers after 2 wins in streak, new squad gets 3rd win → original player does NOT get XP

---

## Implementation Notes

### Data Requirements

**XP Tracking:**
- Player total XP (lifetime accumulation)
- Current grade level (D, C, B, A)
- XP transaction history (for audit trail)

**Match Stats Integration:**
- All performance metrics must be captured from match results
- Match rating must be calculated and stored per player
- MVP/MOTM voting results must be recorded

**Coin Balance:**
- Separate coin balance from XP
- Coin transaction history

> Refer to `db-schema.mdc` for exact field names and table structure.

### Critical Business Rules

1. **XP is never deducted** - Players only gain XP, never lose it
2. **Grades are permanent** - No demotion once a grade is achieved
3. **Position validation is mandatory** for clean sheet XP
4. **Tackle XP has hard cap** at 3 XP per match regardless of actual tackles
5. **Match rating tiers don't stack** - only highest tier applies
6. **Team achievement XP requires participation** in at least one match during achievement period

### State Management
- Calculate XP immediately after match completion
- Update player grade if XP threshold crossed
- Use transactions for XP awards to ensure atomicity
- Prevent duplicate XP awards for same match/challenge

---

## Related Documentation

- **`prd.mdc`** - Product requirements and feature specifications
- **`game-rules.mdc`** - PRIMARY SOURCE - Complete business rules and validation logic (transfer market is a subset)
- **`db-schema.mdc`** - Database schema, table structures, and field definitions
- **`challenges.mdc`** - Challenge system details 



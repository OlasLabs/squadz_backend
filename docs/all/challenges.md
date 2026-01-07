# Challenges System

## Description
Defines the challenges system for SQUADZ app including challenge types, difficulty tiers, XP rewards, and completion validation logic. Use this as the authoritative source for implementing challenge-related features, tracking, and reward distribution.


## Challenge Structure

### Difficulty Tiers
Challenges are organized into four difficulty levels, each with different XP rewards:

- **Easy Challenges**: 6 XP per completion
- **Medium Challenges**: 10 XP per completion  
- **Difficult Challenges**: 20 XP per completion
- **Squad Challenges**: 10 XP per completion (team-based)

### Challenge Types

**Individual Challenges**: Completed by individual players based on their match performance
**Squad Challenges**: Completed by the entire squad based on collective team performance

---

## Easy Challenges (6 XP Each)

### Goal-Based
- Score 1 goal in your next match
- Get 1 assist in your next match

### Performance Metrics
- Register 2 shots on target in a single match
- Make 5 successful passes in a match
- Make 1 successful tackle in a match
- Receive a match rating of 6.0 or higher

### Defensive
- Keep 1 clean sheet (defenders/GKs only)

### Participation
- Complete player availability check-in before the match
- Play at least two matches this week
- Be in the starting lineup for 2 matches in a row

### Match Results
- Win your next match
- End a match without receiving a yellow or red card

---

## Medium Challenges (10 XP Each)

### Goal-Based
- Score 3 goals in a week
- Get 2 assists in one match
- Score a goal with your weak foot
- Score 1 headed goal
- Get 1 goal and 1 assist in the same match

### Performance Metrics
- Achieve a 7.5+ match rating in a match
- Complete 15 successful passes in one game
- Create 3 chances in a match
- Successfully dribble past 3 opponents in a match

### Defensive
- Make 5 tackles without committing a foul
- Keep 2 clean sheets in a row (defender/GK only)

### Match Results
- Win 2 matches in a row

### Recognition
- Be voted Man of the Match once this week

---

## Difficult Challenges (20 XP Each)

### Goal-Based
- Score 5+ goals in a week
- Get 5 assists in a week
- Score a hat-trick in one match
- Score a free-kick goal
- Score a goal and get 2 assists in a single match

### Performance Metrics
- Achieve an 8.5+ match rating in a match
- Create 5+ chances in a single match
- Complete 30+ successful passes in one game
- Make 10+ tackles in one match

### Defensive
- Keep 3 clean sheets in a row (defender/GK only)
- Prevent the opponent from having a shot on target (GK challenge)

### Match Results
- Win 3 consecutive matches
- Win a match after being behind at halftime

### Recognition
- Be voted MVP in 2 matches in a week

### Participation
- Participate in all scheduled matches for the week

---

## Squad Challenges (10 XP Each)

### Team Goal-Based
- Team scores 10 goals this week
- Score in the first 10 minutes of a match

### Team Performance
- Win a match by 3+ goals
- Win 4 matches in a single week
- Be unbeaten in a week (team)

### Team Defensive
- Team keeps 3 consecutive clean sheets

### Consistency
- Register a goal contribution (goal/assist) in every match this week

---

## Challenge Validation Rules

### Position-Specific Restrictions
- **Clean Sheet Challenges**: Only valid for defenders and goalkeepers
- **GK-Specific Challenges**: "Prevent opponent from shot on target" only for goalkeepers
- Validate player position before assigning position-specific challenges

### Time-Based Scopes
- **"Next Match"**: Applies to the immediate upcoming match only
- **"In a Week"**: 7-day rolling window from challenge acceptance
- **"This Week"**: Calendar week (Monday-Sunday) or competition week based on game rules
- **"In a Row/Consecutive"**: Must be uninterrupted sequence with no failures between

### Match Context Requirements
- **"In One Match/Single Match"**: All criteria must be met within same match
- **"Starting Lineup"**: Player must be in starting 11, not substituted in
- **"Participate"**: Player must appear in match (starting or substitute)

### Performance Tracking
- Stats must be officially recorded in match result
- Ratings pulled from match rating system (refer to game_rules for calculation)
- "Weak foot" determined by player profile dominant foot setting
- "Headed goal" requires goal type metadata in match stats

### Squad Challenge Distribution
When squad completes a challenge:
- All active squad members receive XP reward
- "Active" defined as: participated in at least one match during challenge period
- Members who left squad before completion do NOT receive reward

---

## XP Distribution

### Individual Challenge Completion
- XP awarded directly to player's personal XP balance
- Updates player rank progression
- Triggers notification to player

### Squad Challenge Completion
- XP awarded to all active squad members equally
- Does not affect squad-level XP (only individual players)
- Triggers notification to all eligible squad members

### Failed Challenges
- No XP penalty for failed challenges
- Challenge simply removed from active pool
- Player can receive same challenge again in future

---

## Validation Edge Cases

### Multi-Match Challenges (Consecutive/Weekly)
- **"2 matches in a row"**: If player misses a match (injured, unavailable), streak does NOT break unless they play and fail
- **"All matches this week"**: Validate against scheduled matches where player was available
- **"Unbeaten in a week"**: Draws count as unbeaten; only losses break this

### Performance Thresholds
- **"3+ goals"**: Exactly 3 or more (inclusive)
- **"7.5+ rating"**: Must be 7.5 or higher (inclusive)
- **"Without committing foul"**: Zero fouls recorded; even 1 foul invalidates

### Goal Contribution Tracking
- **"Goal contribution"**: Counts as either goal OR assist (not both required)
- **"Goal AND assist"**: Both must be achieved in same match
- Track across all competitions player participates in during timeframe

### Team vs Individual Context
- Squad challenges evaluate team stats, not individual player stats
- Example: "Team scores 10 goals" counts all goals by any squad member
- Individual challenges within squad challenges still require personal contribution

---

## Implementation Notes

### Data Requirements

**Challenge Tracking:**
- Challenge status (active, completed, failed, expired)
- Challenge start date/acceptance timestamp
- Challenge expiration date (for time-bound challenges)
- Progress tracking (current count toward goal)

**Player Context:**
- Player position (for position-specific challenges)
- Dominant foot (for weak foot challenges)
- Squad membership status (for squad challenge eligibility)

**Match Stats Required:**
- Goals, assists, shots on target, passes completed
- Tackles made, fouls committed, chances created
- Clean sheets, match rating, Man of the Match/MVP votes
- Goal types (free-kick, header, etc.)
- Starting lineup vs substitute appearance
- Halftime score (for comeback challenges)

> Refer to `db-schema.mdc` for exact field names and table structure.

### Critical Business Rules

1. **Position validation is mandatory** before assigning position-specific challenges
2. **Time-bound challenges must have expiration logic** to prevent indefinite active state
3. **Squad challenge eligibility requires participation** in at least one match during challenge period
4. **Consecutive challenges break only on active participation failure**, not on absence
5. **XP distribution is immediate** upon challenge completion validation

### State Management
- Validate challenge completion after each match result is recorded
- Use batch processing for squad-wide XP distribution
- Lock challenge records during validation to prevent duplicate completions
- Cleanup expired challenges on daily cron job

---


## Related Documentation

- **`prd.mdc`** - Product requirements and feature specifications
- **`db-schema.mdc`** - Database schema, table structures, and field definitions
- **`game-rules.mdc`** - Complete business rules and validation logic
- **`monetization.mdc`** - Coin transactions, balance management, subscription and user tier system



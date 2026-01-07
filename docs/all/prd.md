# PRODUCT REQUIREMENTS DOCUMENT - SQUADZ

## DESCRIPTION

SQUADZ is a mobile tournament management app (iOS & Android) for FC25 Pro Clubs teams. Core systems: competition management (leagues & cups), dual-captain match verification, XP progression with grade rankings, dynamic player valuation (2-12 coins), transfer market with contract management, coin-based economy, and Discord integration for match coordination and team communication.

**Core Systems:**
- Competition management (leagues & cups)
- Manual match verification with dual-captain approval
- XP progression with grade-based rankings (D, C, B, A)
- Dynamic player valuation (2-12 coins)
- Transfer market with contract management
- Coin-based virtual economy
- Discord integration for coordination, team communication, and transfer market chats

**Key Entities:**
- **Users** → **Players** → **Captains** (create squads) → **Vice Captains** (assigned by Captains)
- **Squads** (NonCompSquad / CompSquad)
- **Competitions** (Leagues / Cups)
- **Contracts** (InitContract / CompContract)
- **Matches, Transfers, Challenges**

**Monetization:**
- Player tiers: Basic (free), Pro (£5/month), Premium (£10/month)
- Coin purchases via App Store/Google Play
- Squad Pass: 6 coins (one-time use per competition for Sub-Ineligible player registration)

---

## DEFINITIONS

| Term | Definition |
|------|------------|
| **User** | Account with incomplete setup; restricted access until setup complete |
| **Player** | User who completed account setup including Discord connection; can participate in competitions |
| **Vice Captain** | Player assigned by Captain to assist with match operations; automatically becomes Captain if Captain leaves |
| **Captain** | Player who created or owns a squad; has full team management permissions |
| **Squad** | A team - either NonCompSquad or CompSquad |
| **NonCompSquad** | Squad not yet registered for any competition |
| **CompSquad** | Squad registered for a competition (paid registration fee) |
| **InitContract** | Contract to join NonCompSquad (non-competition) |
| **CompContract** | Contract to join CompSquad for competition participation |
| **InitOrCompContract** | Either an initial contract or competition contract |
| **Known As name** | Player's chosen display name used throughout the platform (player cards, match facts, ratings, search). Set during sign up and editable in Player Profile |
| **Free Agent** | Player in Transfer Pool without active CompContract or wanting to leave CompSquad |
| **Transfer Listed** | Player placed in Transfer Pool by CompSquad Captain |
| **SquadBank** | Squad's shared coin wallet for fees and transfers |
| **Squad Pass** | One-time 6-coin fee allowing all Sub-Ineligible players to register for one competition |
| **Sub-Ineligible Player** | Player at subscription limit for max competitions (Basic in 1 comp, Pro in 2 comps) |
| **Reg-Ineligible Player** | Player already registered to a competition in another squad |
| **Trans-Ineligible Player** | Player ineligible to receive InitOrCompContract |
| **XP** | Experience Points earned through match performance and achievements |
| **Grade** | Player ranking tier based on total XP (D, C, B, A) |
| **Player Valuation** | Dynamic coin value (2-12 coins) based on performance metrics |
| **FC25 Attributes** | In-game player statistics (Pace, Shooting, Passing, Dribbling, Defending, Physicality) displayed via screenshots |

---

## USER ROLES & PERMISSIONS

*For complete business rules governing permissions and constraints, see game-rules.mdc*

### User (Incomplete Setup)

**Description:** Base role assigned after registration. Restricted access until account setup completed.

**Setup Requirements (4 Pages):**

**Page 1: Additional Details**
- Nationality (country of origin)
- Current location (country of residence)
- PSN ID/Gamertag
- Known As name (display name used on player cards, match facts, ratings)
- Favorite team

**Page 2: Select Preferred Positions**
- Primary position
- Secondary position

**Page 3: Upload Avatar Image**
- Avatar image (processed: Sharp optimization → Removal.ai background removal)

**Page 4: Connect Discord**
- Discord OAuth connection (required for match coordination, team channels, and transfer market communication)
- One-time setup that persists across all features

**Permissions:**
- Access basic navigation
- View own incomplete profile
- Access setup pages
- View general app info

**Restrictions:**
- Cannot access competitions/leagues/tournaments
- Cannot join/create teams
- Cannot access transfer market
- Cannot view other profiles
- Cannot access challenges
- Cannot purchase coins/subscriptions

**Gated Access:**
When accessing restricted pages → Modal with:
- Explanation message
- Prompt to complete setup
- Direct link to resume setup flow

**Progression:** User → Player (all setup requirements complete including Discord connection) → Captain (create/own team) or Vice Captain (assigned by Captain)

---

### Player

**Description:** Completed account setup (all requirements fulfilled including Discord connection). Can participate in competitions as team member. Can become Captain by creating team.

#### Permissions by Subscription Tier

### Squad & Competition Limits

| Tier | Max Squads | Max Competitions |
|------|------------|------------------|
| Basic | 1 | 1 |
| Pro | 1 | 2 |
| Premium | 2 | 3 |

### Financial Permissions

| Tier | Contract Break Fee | Challenge Access |
|------|-------------------|------------------|
| Basic | 100% valuation | 1 coin per challenge |
| Pro | 100% valuation | 1 coin per challenge |
| Premium | 50% valuation | Free unlimited |

### Profile & Player Cards

| Tier | Player Attributes | Screenshot Images | Card Designs |
|------|------------------|-------------------|--------------|
| Basic | 0 | 0 | Basic card |
| Pro | 6 | 2 max | 1 Pro card (primary position) |
| Premium | 12 | 4 max | 2 Premium cards (primary + secondary) |

### Transfer Market

| Tier | Market Visibility |
|------|------------------|
| Basic | Standard placement |
| Pro | Boosted placement |
| Premium | Top placement |

### Universal Permissions (All Tiers)

All players regardless of tier can:
- Create and manage personal profile
- Accept/reject team invitations and contracts
- Join Transfer Pool as Free Agent
- Request to be transfer listed
- View competition tables, fixtures, results
- Submit individual stats with video verification
- Participate in team matches
- View personal XP progression and grade ranking
- Rate squad players after matches
- Initiate disputes
- Add stream links before matches
- Upload FC25 attribute screenshots (optional, max once per week)
- Access Discord team channels for their squads
- Communicate with Captains via Discord for transfer negotiations

---

### Captain

**Description:** Player who created or was assigned team ownership. Retains all Player permissions plus full team management and administration capabilities.

**How to Become Captain:**
- Create new team, OR
- Be assigned captaincy by existing Captain, OR
- Automatic succession from Vice Captain when Captain leaves

**Discord Connection Requirement:**
- Captains must have Discord connected (completed during account setup) to access match operations
- Connection required before submitting lineups or accessing match coordination rooms
- Connection persists across all matches (no re-authentication needed)
- Squad team channel created automatically when Captain creates squad
- Captain added to squad team channel immediately upon squad creation

**Permissions:**
- Register/manage team profile
- Add/remove players (restrictions apply - see Game Rules)
- Send InitContract (NonCompSquad)
- Send CompContract (CompSquad)
- Assign/change Vice Captain
- List players as "Transfer Listed"
- Sign players with signing fees
- Purchase coins, pay competition fees
- Access Discord match rooms
- Access Discord squad team channel
- Communicate with transfer market players via Discord private channels
- Enter match results/statistics
- Upload match video proof
- View team stats/performance/XP
- Initiate/accept team challenges
- Communicate with admins
- Submit lineup before matches

---

### Vice Captain

**Description:** Player assigned by Captain to assist with match operations and team coordination. Retains all Player permissions plus match management capabilities. Serves as backup leadership and automatically succeeds to Captain role if Captain leaves.

**How to Become Vice Captain:**
- Assigned by Captain
- Captain can change Vice Captain at any time
- Auto-assigned to next squad member when NonCompSquad is formed (after Captain)
- Must be in same region as competition (CompSquad only)
- NonCompSquad Vice Captain assignment has no regional restrictions

**Discord Connection Requirement:**
- Vice Captains must have Discord connected (completed during account setup) to access match operations
- Connection required before submitting lineups or accessing match coordination rooms
- Connection persists across all matches (no re-authentication needed)
- Automatically added to squad team channel when assigned as Vice Captain

**Permissions:**
- All Player permissions (retained)
- Submit lineup before matches
- Confirm match results and match facts
- Initiate disputes for match-related issues
- Access Discord match rooms
- Access Discord squad team channel
- Coordinate matches with opponent Captain/Vice Captain
- Click "Ready" and "Done" for match status updates
- Enter match data independently after matches
- Upload match video proof
- Add stream links before matches (up to 2 per squad)

**Automatic Succession:**
- Automatically becomes Captain if Captain breaks contract or transfers to another squad
- Squad becomes internally "inactive" if no Vice Captain assigned

**Restrictions:**
- Cannot register squad for competitions (Captain only)
- Cannot send contracts to players (Captain only)
- Cannot remove players from squad (Captain only)
- Cannot assign new Vice Captain (Captain only)
- Cannot fold/terminate squad (Captain only)

---

### Admin

**Description:** Platform administrators. System management, dispute resolution, verification.

**Permissions:**
- Manage competitions/leagues
- Approve/reject team registrations
- Handle match disputes
- Verify match results from video
- Approve/reject player stats
- Review/approve player cards
- Access Discord admin rooms
- Manage user accounts/bans
- Process refunds/payments
- Generate reports/analytics
- Moderate transfer market
- Monitor challenges
- Penalize false submissions
- Verify challenge completions

---

## CORE FEATURES

### Competition System

#### League Management

**Structure:**
- Central platform-managed system
- Auto-generated fixtures and matchdays
- Real-time league tables with live updates
- Multiple divisions with skill-based placement
- Promotion/relegation based on performance

**Features:**
- XP-based rankings and leaderboards
- Grade-based player rankings (D, C, B, A)
- Automated scheduling

#### Cup Competitions

**Structure:**
- Knockout tournaments parallel to leagues
- Single elimination brackets
- Automated bracket generation

**Features:**
- Prize pool distribution
- Live bracket updates
- XP rewards for progression

---

### Squad Management

#### Squad Types

| Type | Description | Registration Status |
|------|-------------|---------------------|
| **NonCompSquad** | Not registered for competition | No registration fee paid |
| **CompSquad** | Registered for competition | Registration fee paid |

#### Squad Profile

**Components:**
- Team name, logo, colors
- Player roster (5-14 players; 11 active + 3 subs)
- Team statistics and achievements
- Team XP tracking
- Discord integration (squad team channel)

**Roster Management:**
- Player invitation system (accept/decline)
- Contract management (InitContract / CompContract)
- Minimum 5 players, maximum 14 players (11 active + 3 subs)
- Automatic Discord team channel creation when squad created
- Automatic Discord team channel membership updates when players join/leave

#### Squad Fees & Registration

**Player Registration Fees:**
| Player Tier | Active Competitions | Registration Fee for NEW Competition | Alternative |
|-------------|---------------------|--------------------------------------|-------------|
| **Premium** | Any number | FREE | N/A |
| **Pro** | 1 competition | FREE | N/A |
| **Pro** | 2 competitions (Sub-Ineligible) | 2 coins per player | Squad Pass (6 coins) |
| **Basic** | 1 competition (Sub-Ineligible) | 2 coins per player | Squad Pass (6 coins) |

**Squad Pass:**
- **Cost:** 6 coins (one-time use per competition)
- **Benefit:** Register ALL Sub-Ineligible players for ONE new competition
- **When to Use:** Cost-effective when registering 3+ Sub-Ineligible players (vs paying 2 coins each)
- **Limitation:** Single use only - need to purchase again for next competition if needed

---

### Player Profile & Statistics

#### Profile Components

**Core Data:**
- Player name (Known As name)
- Gamertag (PSN ID / Xbox / PC)
- Platform
- Primary position
- Country/Region
- Profile picture

**Statistics:**
- Goals, assists, matches played
- Average match rating
- Clean sheets (GK/Defenders)
- Pass accuracy
- Career achievements and badges
- Position and playstyle tracking

**FC25 Attributes (Optional):**
- Screenshot images of in-game attributes (Pace, Shooting, Passing, Dribbling, Defending, Physicality)
- Not mandatory to add
- Can be updated once per week (7-day cooldown)
- Displayed on profile and in transfer market
- Helps strengthen transfer market appeal

**Progression Data:**
- Player XP level
- Grade ranking (D, C, B, A)
- Player valuation (2-12 coins)
- Competition access list
- Active contracts (all CompContracts visible)

**Customization (Tier-Based):**
- Basic: 0 attributes, 0 screenshot images
- Pro: 6 attributes, 2 screenshot images max
- Premium: 12 attributes, 4 screenshot images max

#### Player Cards

**Card Elements:**
- Player name and gamertag
- Custom profile picture (Pro/Premium only)
- Position and preferred role
- Key stats (goals, assists, matches, rating)
- XP level and grade
- Player valuation
- Attributes (0 Basic / 6 Pro / 12 Premium)
- Subscription badge (Pro/Premium)
- Team affiliation

**Card Types by Tier:**
- Basic: Basic card design
- Pro: 1 Pro card (primary position)
- Premium: 2 Premium cards (primary + secondary positions)

**Requirements:**
- Verified player stats (admin approved)
- Approved profile picture
- Card visible on profile and in transfer market

**Functionality:**
- Card customization interface
- Picture upload/cropping (Pro/Premium)
- Preview before publishing

---

### XP Progression & Grade Rankings

*For complete XP earning rules, grade calculations, and achievement triggers, see xp.mdc*

#### XP Earning Categories

**Match Outcomes:**
| Result | XP |
|--------|-----|
| Win | 10 |
| Draw | 6 |
| Loss | 3 |

**Individual Performance:**
| Achievement | XP |
|-------------|-----|
| MVP | 8 |
| Goal scored | 5 |
| Assist | 4 |
| Clean sheet (GK/Defenders) | 5 |

**Match Ratings:**
| Rating | XP |
|--------|-----|
| ≥ 8.0 | 4 |
| ≥ 7.0 | 2 |

**Match Participation:**
| Type | XP |
|------|-----|
| Full match | 2 |
| Partial match | 1 |

**Discipline:**
| Achievement | XP |
|-------------|-----|
| No fouls or cards | 2 |
| Successful tackle | 1 (max 3/match) |

**Challenge Completion:**
| Difficulty | XP |
|------------|-----|
| Easy | 6 |
| Medium | 10 |
| Difficult | 20 |
| Weekly Team Challenge | 10 |

**Team Achievements:**
| Achievement | XP |
|-------------|-----|
| 3 wins in a row | 5 |
| 10 goals in a week | 4 |
| 3 clean sheets in a row | 5 |
| Unbeaten for a week | 8 |

#### Grade Rankings

| Grade | Name | XP Range | Description |
|-------|------|----------|-------------|
| D | Beginner | 0-249 | New players |
| C | Competent | 250-799 | Consistent performers |
| B | Talent | 800-1,999 | Strong performers across competitions |
| A | World Class | 2,000+ | Elite, long-term active players |

**Grade Features:**
- Displayed on profile and player card
- Used for transfer market filtering
- Grade progression tracking dashboard
- Milestones and achievements
- Affects prestige and transfer appeal

---

### In-Game Challenges

*For detailed challenge mechanics, verification logic, and reward calculations, see challenges.mdc*

#### Challenge Types & Rewards

| Difficulty | XP Reward | Examples |
|------------|-----------|----------|
| **Easy** | 6 XP | Score 1 goal in next match / Win next match |
| **Medium** | 10 XP | Score 3 goals in a week / Achieve 7.5+ rating |
| **Difficult** | 20 XP | Score hat-trick / Win 3 consecutive matches |
| **Squad** | 10 XP | Team scores 10 goals this week / 3 consecutive clean sheets |

#### Challenge Access by Tier

| Tier | Access Cost | Limit |
|------|-------------|-------|
| Basic | 1 coin per challenge | Pay per challenge |
| Pro | 1 coin per challenge | Pay per challenge |
| Premium | Free | Unlimited |

#### Challenge Mechanics

**Flow:**
1. Player views available challenges
2. Selects challenge (Easy/Medium/Difficult/Squad)
3. Pays 1 coin (Basic/Pro) or Free (Premium)
4. Challenge becomes active
5. Challenge remains active until completed or refreshed
6. Player completes during match
7. System auto-verifies completion
8. XP awarded automatically
9. Challenge displayed in history

**Rules:**
- Once accepted, challenge continues until refreshed/accomplished
- Completed challenges contribute to XP and grade progression
- Additional challenges defined in content database

---

### Player Valuation System

*For detailed calculation formulas, position-specific weights, and update algorithms, see player-valuation.mdc*

#### System Parameters

**Valuation Range:** 2-12 coins  
**Performance Score Range:** 0.0-10.0  
**Update Frequency:** Based on recent performances  
**Form Factor:** Weighted last 4 matches  

#### Position-Specific Formulas

**Strikers/Forwards:**
| Metric | Weight |
|--------|--------|
| Goals | 30% (Primary) |
| Form | 20% |
| Match Rating | 20% |
| Assists | 15% |
| MOTM Awards | 15% |

**Midfielders:**
| Metric | Weight |
|--------|--------|
| Assists | 25% (Primary) |
| Match Rating | 22% |
| Form | 20% |
| Goals | 18% |
| MOTM Awards | 15% |

**Defenders:**
| Metric | Weight |
|--------|--------|
| Clean Sheets | 35% (Primary) |
| Match Rating | 25% |
| Assists | 12% |
| Form | 10% |
| MOTM Awards | 10% |
| Goals | 8% |

**Goalkeepers:**
| Metric | Weight |
|--------|--------|
| Clean Sheets | 42% (Primary) |
| Match Rating | 25% |
| Form | 10% |
| MOTM Awards | 10% |
| Assists | 8% |
| Goals | 5% (Rare) |

#### Coin Value Mapping

| Performance Score | Coin Value | Category |
|-------------------|------------|----------|
| 0.0-0.9 | 2 | Very low impact |
| 1.0-1.9 | 3 | Low impact |
| 2.0-2.9 | 4 | Developing |
| 3.0-3.9 | 5 | Average contributor |
| 4.0-4.9 | 6 | Reliable performer |
| 5.0-5.9 | 7 | Team regular |
| 6.0-6.9 | 8 | Good performer / Key player |
| 7.0-7.9 | 9 | Strong performer |
| 8.0-8.9 | 10 | Elite player |
| 9.0-9.4 | 11 | World class |
| 9.5-10.0 | 12 | Perfect (extremely rare) |

#### Valuation Usage

| Use Case | Application |
|----------|-------------|
| Transfer Market | Displayed on profiles and cards |
| Contract Breaking | Players pay valuation (100% Basic/Pro, 50% Premium) |
| Free Agent Registration | Free Agents pay valuation to sign new contracts |
| Squad Planning | Captains assess player value when building rosters |
| Player Development | Track valuation changes as performance indicator |
| Transfer Negotiations | Signing fees capped at 50% above valuation |

---

### Transfer Market & Contracts

*For complete transfer flows, state transitions, and detailed validation rules, see transfer-market.mdc*

#### Contract Types

| Contract Type | Purpose | Squad Type | Signing Fee | Breaking Fee |
|---------------|---------|------------|-------------|--------------|
| **InitContract** | Join NonCompSquad | NonCompSquad | Free | Free |
| **CompContract** | Register for competition | CompSquad | Varies (see below) | 100% value (Basic/Pro)<br>50% value (Premium) |

**InitContract Behavior:**
- Basic/Pro players: Leave old NonCompSquad when accepting new InitContract
- Premium players: Can be in 2 NonCompSquads simultaneously

#### Contract Breaking Process

**Flow:**
1. Player initiates contract break in app
2. System calculates fee: Valuation × 100% (Basic/Pro) or 50% (Premium)
3. Player confirms payment from personal balance
4. Fee transferred to squad balance
5. Player status → "Free Agent"
6. Player removed from squad, added to Free Agent pool
7. Player cannot join same competition until it ends

#### Transfer Pool

**Player Statuses:**
| Status | Definition | Signing Fee |
|--------|------------|-------------|
| **Free Agent** | No active CompContract or broke contract to leave | 0 coins |
| **Transfer Listed** | Placed by CompSquad Captain | Player's full valuation |

**Transfer Pool Rules:**
- Free Agents already paid to break contract → no signing fee
- Free Agents must pay valuation to sign new contracts
- Transfer Listed players: Signing squad pays player value → previous SquadBank
- Players removed from pool immediately after CompContract signed
- Players asked to confirm removal after InitContract signed
- Transfer Listed removed if CompSquad becomes NonCompSquad

**Transfer Pool Display:**
- Player profiles show FC25 attribute screenshots (if uploaded)
- Captains can view attribute screenshots during transfer negotiations
- Attribute screenshots strengthen player appeal and transfer prospects

#### Transfer Request Process

**Flow:**
1. Captain browses available players in transfer pool
2. Captain views stats, XP, grade, valuation, player card, and FC25 attribute screenshots
3. Captain initiates private Discord chat with player for negotiations
4. Captain sends transfer offer with signing fee (0-50% above valuation)
5. Player receives notification in app and can continue discussion in Discord
6. Both parties must agree
7. Requesting squad must have sufficient balance (signing fee + 2 coin registration)
8. Upon agreement, coins transferred and player moves

#### Transfer Market Constraints

**Roster Limits:**
- Minimum: 5 players
- Maximum: 14 players (11 active + 3 subs)

**Transfer Windows:**
- Open 2× per season per competition
- Separate markets for each competition

**Fees:**
| Action | Fee |
|--------|-----|
| Market entry | 2 coins |
| Transfer request | 2 coins (refunded if rejected) |
| Transfer acceptance | 2 coins |
| Signing fee | 0-50% above player valuation |

**Requirements:**
- Verified stats with video proof required for market entry
- Players become teamless when entering market
- Cannot be registered in 2 different squads in same competition

**Special Access:**
- Cross-Continent Transfers: Premium users can access worldwide transfer pool

**Multi-Competition Contract Rules:**
- Pro players: Can only receive competition contracts from same squad for additional competitions
- Premium players: Can receive competition contracts from same squad OR different squads
- Premium players in another squad: Can receive contracts from either squad Captain

---

### Match Management

#### Match Coordination Process

**Pre-Match:**
1. App generates fixture schedule
2. Captains can start lineup submission 2 hours before match (notification sent)
3. System checks if Captain/Vice Captain have connected Discord (completed during account setup)
4. Captain/Vice Captain submit lineup (deadline varies by squad tier)
5. After both lineups submitted → SQUADZ backend creates Discord match coordination channel via API
6. App provides deep link button to open Discord app with match room
7. Admin moderator automatically added to Discord room
8. Captains coordinate team invites and match setup in Discord app (external)

**During Match:**
8. Both captains click "Ready" when available to play
9. Match status → "Live" when both confirm start
10. Match is played on FC25
11. Players can add stream links (30 min before match)

**Post-Match:**
12. Both captains click "Done" after match completion
13. Both captains enter match data independently
14. System compares entries and processes results
15. Status → "Completed" after verification

#### Lineup Submission Timeline

**All CompSquads:**
- Can start submitting: 2 hours before match
- Standard deadline: 1 hour before match start
- Late fee option: Pay 1 coin to submit up to 30 minutes before match
- Hard deadline: 30 minutes before match start
- Forfeit: Yes, if not submitted by hard deadline

**Requirements:**
- Captain AND Vice Captain must have Discord connected (completed during account setup) before lineup submission
- Only CompSquad players who accepted CompContract can be selected
- Players on InitContract unavailable for selection

#### Match Data Entry

**Entry Fields:**
- Final score
- Goalscorers
- Assists
- Clean sheets
- Match ratings

**Verification Process:**
1. Both captains submit independently
2. System auto-compares submissions
3. **If match** → Results auto-approved
4. **If mismatch** → Captains prompted to re-enter
5. **If 2nd mismatch** → Dispute flagged
6. Both captains redirected to Discord dispute room
7. Both upload video proof showing:
   - Final scoreboard
   - Goal replays/timestamps
   - Match statistics screen
8. Admin reviews video on Discord
9. Admin enters correct data via admin dashboard
10. Penalty applied to captain who submitted false data (-30 XP, warning)
11. Results finalized, league tables updated

#### Result Confirmation Timeline

| Match Type | Leg | Deadline | Failure Consequence |
|------------|-----|----------|---------------------|
| Any fixture | 1st leg | 1 hour after match start | Lose 1 point, use opponent's results |
| Any fixture | 2nd leg | 2 hours after match start | Lose 1 point, use opponent's results |
| League (both fail) | Any leg | After deadline | Both lose 1 point, score recorded as 0-0 |

**Discord Chat Triggers:**
| Competition Type | Scenario | Action |
|------------------|----------|--------|
| League match | BOTH squads fail to submit after 1 leg | Discord chat initiated |
| Knockout round | ANY squad fails to submit after each leg | Discord chat initiated |

#### Forfeit Rules

| Scenario | Result |
|----------|--------|
| One captain clicks "Ready", other doesn't respond within 15 min | Non-responsive team forfeits (3-0 loss, 0 XP) |
| Neither captain shows within 30 min of scheduled time | Both teams: 0 points, 0 XP |
| Captain fails to click "Done" or submit data within timeframe | That team forfeits |
| Both teams fail post-match requirements | Both forfeit (0 points, 0 XP) |

#### Post-Match Actions

**Player Ratings:**
- Players in submitted lineup can rate squad members
- Available after match result and disputes confirmed
- Uses Known As names

**Stream Links:**
- Any CompSquad player in lineup can add links
- Maximum 2 links per squad
- Must add 30 min before match time

**Disputes:**
- Captain or Vice Captain in confirmed lineup can initiate
- Valid reasons:
  1. Inaccurate match scores
  2. Inaccurate player stats
  3. Game crash/network issues
  4. Incorrect lineup
- Admin reviews and makes final decision
- Penalties for false submissions

---

### Player Stats Verification

#### Manual Stats Entry

**Player Submits:**
- Goals scored
- Assists provided
- Matches played
- Average match rating
- Clean sheets (GK/Defenders)
- Pass accuracy
- Position(s) played

#### Video Verification (Discord)

**Video Requirements:**
- Screen recording of EA stats on official platform
- Must clearly show:
  - Player's gamertag
  - Current season statistics
  - All submitted stat categories
  - Date of recording
- Uploaded to Discord (not in app)

**Verification Flow:**
1. Player enters stats in app
2. Player sends screen recording via Discord
3. Admin reviews video on Discord
4. Admin compares video with submitted data in admin dashboard
5. Admin approves or rejects via dashboard

**Approval Benefits:**
- Stats displayed on profile
- Transfer market access unlocked
- Player card creation enabled (requires Pro plan)
- Verified badge on profile
- Player valuation calculated
- Re-verification required every 3 months

---

### Monetization

*For payment implementation details, subscription flows, and fee calculation logic, see monetization.mdc*

#### Player Subscription Tiers

### Pricing

| Tier | Monthly Price | Annual Price | Annual Discount |
|------|---------------|--------------|-----------------|
| Basic | Free | Free | - |
| Pro | £5/month | £40/year | 20% |
| Premium | £10/month | £85/year | 29% |

### Squad & Competition Access

| Tier | Max Squads | Max Competitions |
|------|------------|------------------|
| Basic | 1 | 1 |
| Pro | 1 | 2 |
| Premium | 2 | 3 |

### Profile Customization

| Tier | Player Attributes | Screenshot Images |
|------|------------------|-------------------|
| Basic | 0 | 0 |
| Pro | 6 | 2 max |
| Premium | 12 | 4 max |

### Player Cards

| Tier | Card Designs Available |
|------|----------------------|
| Basic | Basic card |
| Pro | 1 Pro card (primary position) |
| Premium | 2 Premium cards (primary + secondary positions) |

### Financial Features

| Tier | Contract Break Fee | Challenge Access |
|------|-------------------|------------------|
| Basic | 100% player valuation | 1 coin per challenge |
| Pro | 100% player valuation | 1 coin per challenge |
| Premium | 50% player valuation | Free unlimited |

### Transfer Market

| Tier | Visibility Placement |
|------|---------------------|
| Basic | Standard |
| Pro | Boosted |
| Premium | Top placement |

**Payment Processing:**
- Via Google Play (Android) and App Store (iOS)
- Subscription management through app store settings

#### Coin Economy

**Coin Packages:**
| Package | Price | Bonus |
|---------|-------|-------|
| 5 coins | £5 | - |
| 22 coins | £22 | Team registration package |
| 50 coins | £45 | 10% bonus |
| 100 coins | £85 | 15% bonus |

**Fee Structure:**
| Feature | Fee |
|---------|-----|
| Team registration | 22 coins |
| Transfer market entry | 2 coins |
| Transfer request | 2 coins |
| Transfer acceptance | 2 coins |
| Challenge (Basic/Pro) | 1 coin |
| Late lineup submission | 1 coin |
| Squad Pass (one-time use per competition) | 6 coins |
| Player registration (Basic/Pro) | 2 coins |
| Player registration (Premium) | FREE |

**Coin System:**
- In-app purchases via App Store/Google Play
- Secure wallet management
- Transaction history and receipts
- Refunds handled through app stores

---

## KEY USER FLOWS

### Account Setup Flow

```
Download App
→ Create Account (Email/Password or Social Auth)
→ Email Verification
→ User Role Assigned (Incomplete)
→ Account Setup (4 Pages - Required):
   
   Page 1: Additional Details
   → Nationality (country of origin)
   → Current location (country of residence)
   → PSN ID/Gamertag
   → Known As name (display name)
   → Favorite team
   
   Page 2: Select Preferred Positions
   → Primary position
   → Secondary position
   
   Page 3: Upload Avatar Image
   → Upload avatar image
   → Image optimization (Sharp)
   → Background removal (Removal.ai API)
   → Saved as user avatar
   
   Page 4: Connect Discord
   → Discord OAuth connection
   → One-time setup for all Discord features
   → Connection saved to player account
   
→ Account Setup Complete
→ Player Role Assigned
→ Access full app features (competitions, teams, transfers, challenges, purchases)
```

**If User Attempts to Access Restricted Features Before Setup:**
- User remains in "User" role
- Restricted access to features
- Modal appears when accessing restricted pages:
  - Explanation message
  - Prompt to complete setup
  - Direct link to resume setup from last incomplete page
- After completion → Access to originally requested page

---

### Squad Creation Flow

```
Captain Creates Squad
→ Enter Squad Details (name, logo, colors)
→ Submit Squad Creation
→ SQUADZ Backend Creates Discord Team Channel via API
→ Captain Automatically Added to Discord Team Channel
→ Squad Successfully Created
→ Captain Can Send Contracts to Players
→ Players Accept Contracts
→ New Players Automatically Added to Discord Team Channel
→ Squad Members Can Communicate in Discord Team Channel
```

---

### Transfer Market Communication Flow

```
Captain Browses Transfer Pool
→ Views Player Profile (stats, XP, grade, valuation, card, FC25 attributes)
→ Captain Initiates Transfer Interest
→ SQUADZ Backend Creates Private Discord Channel via API
→ Captain and Player Added to Private Discord Channel
→ Captain and Player Negotiate Transfer in Discord
→ Captain Sends Official Transfer Offer in App
→ Player Accepts/Rejects in App
→ If Accepted: Player Joins Squad, Added to Squad Team Channel
→ Private Discord Channel Deleted via Discord API
```

---

### Captain Match Flow

```
View Fixtures
→ Receive Match Notification
→ Click "Ready"
→ Join Discord Match Room (via deep link)
→ Coordinate Match Setup
→ Play Match
→ Click "Done"
→ Enter Match Data
→ Wait for Opponent Entry
→ Verification Process
→ Results Confirmed (or Dispute Resolution)
→ League & XP Updated
```

---

### Player Stats Submission Flow

```
Access Stats Submission Form
→ Enter EA Stats Manually
→ Record Screen Showing EA Stats
→ Upload Video Proof to Discord
→ Submit for Review
→ Admin Verification
→ Approval/Rejection
→ Stats Displayed on Profile
→ Player Valuation Calculated
→ Transfer Market Access Unlocked
→ Player Card Creation Enabled
```

---

### FC25 Attributes Upload Flow

```
Access Player Profile
→ Navigate to FC25 Attributes Section
→ Upload Screenshot of In-Game Attributes
→ Screenshot Saved to Profile
→ Attributes Visible on Profile and Transfer Market
→ 7-Day Cooldown Begins
→ Can Update Again After 7 Days
```

---

### Transfer Market Flow

```
Verify Stats with Video Proof
→ Admin Approves Stats
→ Pay 2 Coins to Enter Market
→ Select Competitions
→ Listed in Transfer Pool
→ Captain Browses Players
→ Captain Views Player Profile and FC25 Attributes
→ Captain Initiates Private Discord Chat
→ Captain Sends Request (2 coins)
→ Player Receives Notification
→ Player Accepts (2 coins) or Declines (Captain refunded)
→ Player Joins New Team
→ Player Added to Squad Team Channel
→ Rosters Updated
```

---

### Contract Breaking Flow

```
Player in CompSquad
→ Initiates Contract Break
→ System Calculates Fee (100% or 50% valuation)
→ Player Confirms Payment
→ Fee Transferred to Squad
→ Player Becomes Free Agent
→ Player Removed from Squad Team Channel
→ Player Added to Transfer Pool
→ Cannot Join Same Competition Until Ends
```

---

### Player Card Creation Flow

```
Verify Stats (if not done)
→ Access Player Card Builder
→ Upload Custom Picture (Pro/Premium)
→ Review Card Preview
→ Publish Player Card
→ Card Displayed on Profile
→ Card Visible in Transfer Market
```

---

### In-Game Challenge Flow

```
Player Views Available Challenges
→ Selects Challenge (Easy/Medium/Difficult/Squad)
→ Pays 1 Coin (Basic/Pro) or Free (Premium)
→ Challenge Becomes Active
→ Player Completes Challenge During Match
→ System Auto-Verifies Completion
→ XP Awarded Automatically
→ Challenge Displayed in History
```

---

## ADMIN CAPABILITIES

**Competition Management:**
- Manage all competitions and leagues
- Approve/reject team registrations
- Set match rules for leagues and cups
- Announce events (e.g., transfer window open)

**Verification & Moderation:**
- Verify match results from video evidence
- Review and approve player stats submissions
- Review and approve player card applications
- Handle disputes and reports via Discord moderation
- Access Discord admin rooms for live coordination

**User Management:**
- Manage user accounts and bans
- Process refunds and payment issues
- Penalize teams/players for false data submission

**Analytics:**
- Generate reports and analytics
- Monitor challenge results
- Moderate transfer market activities

---

## INTEGRATION REQUIREMENTS

### Discord Integration

*For API implementation details, webhook configuration, and authentication flows, see discord-integration.mdc*

**Purpose:** External match coordination, team communication, transfer negotiations, and dispute resolution (all chats hosted in Discord, not in-app)

**Connection Flow:**
1. User connects Discord during account setup (Page 4 - required)
2. Discord OAuth flow initiated
3. SQUADZ app saves Discord User ID to player account
4. Connection persists for all Discord features (no re-authentication needed)
5. Player can now access all Discord-integrated features

**Discord Channel Types:**

**Match Coordination Rooms:**
- Created automatically after both squads submit lineups
- SQUADZ backend calls Discord API to create private channel
- Captains, Vice Captains, and Admin added to channel
- SQUADZ app provides deep link to open Discord app with match room
- Used for match setup coordination and video proof uploads
- Deleted via Discord API after match completion and result verification

**Squad Team Channels:**
- Created automatically when Captain creates squad
- SQUADZ backend calls Discord API to create private team channel
- Captain automatically added upon squad creation
- Squad members automatically added when they accept contracts (InitContract or CompContract)
- Players automatically removed when they leave squad or break contract
- Remains active for squad lifetime (until squad is dissolved or all members leave)
- Used for team coordination, strategy discussion, and general communication

**Transfer Market Private Channels:**
- Created when Captain initiates transfer interest with player
- SQUADZ backend calls Discord API to create private channel
- Captain and player added to private channel
- Used for transfer negotiations and discussions
- Deleted via Discord API after transfer finalized or negotiation abandoned (7-day timeout)

**Admin Moderation Rooms:**
- Persistent Discord channels for admin oversight
- Admins join match rooms, dispute rooms, and stats verification channels
- Used for reviewing video proof and resolving disputes

**Features:**
- Match coordination rooms (created via Discord API, accessed via deep links)
- Squad team channels for internal squad communication
- Transfer market private channels for Captain-Player negotiations
- Admin moderation rooms (Discord channels)
- Video proof upload for disputes (uploaded in Discord)
- Video proof upload for stats verification (uploaded in Discord)

**Access Rules:**
- All players must connect Discord during account setup (Page 4 - required)
- Connection is one-time and persists across all features
- No re-authentication needed for any Discord feature
- Match Discord rooms created automatically after both squads submit lineups
- Squad team channels created when squad is created
- Transfer market channels created when Captain initiates transfer interest
- Captains access rooms via deep links that open Discord app
- Admin joins Discord rooms to oversee match setup and disputes

**Technical Implementation:**
- Discord OAuth for one-time account connection during setup
- Discord Bot API for channel creation and user management
- Deep links to open Discord app from SQUADZ app
- Automatic channel membership management based on squad/contract changes
- No in-app chat UI or websockets needed (all chat in Discord)

**Channel Lifecycle Management:**
- Backend tracks all created Discord channels (channel_id, purpose, participants, created_at, status)
- Triggers Discord API actions based on business events:
  * Delete match rooms after match completion and result verification
  * Delete transfer channels after transfer finalized or 7-day negotiation timeout
  * Delete squad team channels when squad is dissolved or becomes inactive
  * Lock/rename channels before deletion for audit trail (optional)
- Automated cleanup for abandoned/stale channels
- Channel status tracking: active, locked, pending_deletion, deleted

---

### Payment Processing

**Platforms:**
- Google Play (Android)
- App Store (iOS)

**Handled via Stores:**
- All subscriptions
- All coin purchases
- Subscription management
- Refund processing

**App Responsibilities:**
- Secure wallet management
- Transaction history
- Receipt display

---

### Social Media

**Streaming:**
- Players manually upload or link Twitch/YouTube highlights
- Links attached to profiles and match records
- Max 2 stream links per squad per match

---

## TECHNICAL CONSTRAINTS

**Roster Limits:**
- Minimum squad size: 5 players
- Maximum squad size: 14 players

**Competition Constraints:**
- Players cannot be registered in 2 different squads in same competition
- Transfer windows open 2× per season
- Separate transfer markets per competition

**Match Timing:**
- Lineup submission opens 2 hours before match
- Stream links added 30 min before match
- Result confirmation deadlines: 1h (leg 1), 2h (leg 2) after start

**Verification:**
- Stats re-verification required every 3 months
- Video proof required for all stat submissions
- Video proof required for disputed match results

**FC25 Attributes:**
- Screenshot uploads limited to once per week (7-day cooldown)
- Attribute screenshots displayed on profile and transfer market
- Not mandatory for account completion or transfer market access

---

## RELATED DOCUMENTATION

This PRD provides system-level overview and feature specifications. For implementation details, refer to these specialized documents:

| Document | Purpose | Key Contents |
|----------|---------|--------------|
| **game-rules.mdc** | Business rules and validation logic | Player tier limits, transfer rules, contract rules, competition registration, match management, leadership rules, squad fees, profile rules |
| **monetization.mdc** | Payment implementation details | Subscription features, pricing data, payment flows, coin packages, fee calculations |
| **player-valuation.mdc** | Valuation calculation system | Position-specific formulas, calculation algorithms, update triggers |
| **xp.mdc** | XP calculation and progression | XP earning rules, grade thresholds, validation logic, achievement triggers |
| **challenges.mdc** | Challenge feature mechanics | Challenge definitions, verification logic, reward calculations, refresh rules |
| **transfer-market.mdc** | Transfer market implementation | User flows, state transitions, validation rules, fee calculations |
| **discord-integration.mdc** | Discord API integration | Features, technical implementation, API endpoints, channel types, OAuth flow |
| **auth-strategy.mdc** | Authentication Strategy and Flows | Authentication flows (JWT, OAuth, password reset, OTP, email verification)
| **db-schema.mdc** | Database Schema | Complete database schema
| **api-requirements.mdc** | API Requirements and Endpoints | Complete endpoint specifications and RBAC matrix
| **backend-architecture.mdc** | Backend Architecture | Module organization, service patterns, request flow

**Usage Guidelines:**
- Use this PRD for overall system understanding and feature relationships
- Reference specialized docs when implementing specific features
- game-rules.mdc is authoritative for all business logic and validation rules
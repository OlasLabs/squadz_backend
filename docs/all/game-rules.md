# GAME RULES DOCUMENTATION

## DESCRIPTION

Complete business rules for SQUADZ platform: contract validation, roster limits, transfer fees, tier restrictions, match coordination, XP allocation, and leadership permissions. Use for validation logic and business constraints across all feature modules.

---

## DEFINITIONS

| Term | Definition |
|------|------------|
| **CompSquad** | A squad registered for a competition (paid registration fee) |
| **NonCompSquad** | A squad not yet registered for any competition |
| **Squad** | A "CompSquad" or "NonCompSquad" |
| **Free Agent** | Player in Transfer Pool without active CompContract or wanting to leave CompSquad |
| **Transfer Listed** | Player placed in Transfer Pool by CompSquad Captain |
| **CompContract** | Contract to join CompSquad for competition participation |
| **InitContract** | Contract to join NonCompSquad (non-competition) |
| **InitOrCompContract** | An initial contract or competition contract |
| **SquadBank** | Squad's shared coin wallet |
| **Known As name** | Player's chosen display name used throughout the platform (player cards, match facts, ratings, search). Set during sign up and editable in Player Profile |
| **Reg-Ineligible Player** | Player already registered to competition in another squad |
| **Sub-Ineligible Player** | Player at subscription limit for max competitions |
| **Trans-Ineligible Player** | Player ineligible to receive InitOrCompContract |
| **Squad Pass** | One-time 6-coin fee allowing all Sub-Ineligible players to register for competition |

---

## PLAYER SUBSCRIPTION TIERS

### Squad & Competition Limits by Tier

| Tier | Max Squads | Max Competitions | Contract Break Fee |
|------|------------|------------------|-------------------|
| **Basic** | 1 squad | 1 competition | 100% player value |
| **Pro** | 1 squad | 2 competitions | 100% player value |
| **Premium** | 2 squads | 3 competitions | 50% player value |

---

## TRANSFER & PLAYER MOVEMENT RULES

### Squad Membership Rules by Tier

| Rule | Basic | Pro | Premium |
|------|-------|-----|---------|
| Max squads at one time | 1 | 1 | 2 |
| Contract break fee from CompSquad | 100% value → previous SquadBank | 100% value → previous SquadBank | 50% value → previous SquadBank |
| Can rejoin Transfer Pool as Free Agent after breaking CompContract | ✓ | ✓ | ✓ |
| Can rejoin Transfer Pool as Free Agent if signed on 2 CompContracts and wants to break 1 | ✗ | ✗ | ✓ |
| Can join Transfer Pool without breaking contract (no active CompContract) | ✓ | ✓ | ✓ |
| Can join Transfer Pool without breaking contract (has 1 CompContract) | ✗ | ✗ | ✓ |

### Contract Types & Rules

| Contract Type | Signing Fee | Breaking Fee | Who Can Send | Squad Size Limit | Can Captain Remove Player |
|---------------|-------------|--------------|--------------|------------------|---------------------------|
| **InitContract** (NonCompSquad) | Free | Free | Captain (if <14 members) | Max 14 | ✓ Yes |
| **CompContract** (CompSquad) | Varies (see below) | 100% value (Basic/Pro), 50% value (Premium) | Captain (if <14 members) | Max 14 | ✗ No |

### Signing Fees for CompContract

| Player Status | Signing Fee | Credited To |
|---------------|-------------|-------------|
| **Free Agent** | 0 coins | N/A |
| **Transfer Listed** | Player's full value | Previous squad's SquadBank |

### Eligible Players for Receiving Contracts

| Player Status | Can Receive InitContract | Can Receive CompContract |
|---------------|--------------------------|--------------------------|
| In Transfer Pool as Free Agent | ✓ | ✓ |
| In Transfer Pool as Transfer Listed | ✓ | ✓ |
| Requested contract using Squad ID | ✓ | ✓ |
| Not in Transfer Pool | ✗ | ✗ |
| Not requested contract | ✗ | ✗ |

### Contract Acceptance & Squad Changes

| Player Tier | Current Situation | Accepts New InitOrCompContract | Result |
|-------------|-------------------|--------------------------------|--------|
| Basic/Pro | In 1 squad | New offer from another squad | Must leave old squad and join new squad (pay fees if applicable) |
| Premium | In 1 squad | New offer from another squad | Choose: Leave old squad OR join 2nd squad |
| Premium | In 2 squads | New offer from another squad | Choose: Leave one old squad to join new squad |
| Any tier | No squad | New offer | Join new squad directly |

### Transfer Pool Entry & Exit

| Action | Basic | Pro | Premium | Notes |
|--------|-------|-----|---------|-------|
| Join Transfer Pool as Free Agent (no CompContract) | ✓ | ✓ | ✓ | No fees required |
| Join Transfer Pool as Free Agent (1 CompContract) | Must break contract first | Must break contract first | ✓ | Premium can join with 1 active CompContract |
| Join Transfer Pool as Free Agent (2 CompContracts) | N/A | N/A | Must break at least 1 contract | N/A |
| Player on CompContract labeled Free Agent signs new CompContract | Pay player value → old squad | Pay player value → old squad | Pay player value → old squad | Applies when rejoining after contract break |
| Removed from Transfer Pool after CompContract signed | Immediate (notification sent) | Immediate (notification sent) | Immediate (notification sent) | Automatic removal |
| Removed from Transfer Pool after InitContract signed | Asked to confirm | Asked to confirm | Asked to confirm | Manual confirmation required |
| Transfer Listed removed if CompSquad becomes NonCompSquad | Automatic (notification sent) | Automatic (notification sent) | Automatic (notification sent) | Squad status change |

---

## CAPTAIN TRANSFER ACTIONS

### Contract Sending Rules

| Captain Can Send | NonCompSquad Captain | CompSquad Captain | Conditions |
|------------------|----------------------|-------------------|------------|
| InitContract to eligible players | ✓ | ✗ | Squad has <14 members |
| CompContract to eligible players | ✗ | ✓ | CompSquad has <14 members |
| Contract when squad has 14 members | ✗ | ✗ | Hard limit enforced |
| Contract to Trans-Ineligible players | ✗ | ✗ | Player not eligible |
| CompContract even if SquadBank insufficient | N/A | ✓ | Fees payable after player accepts |

### Transfer & Contract Management

| Action | NonCompSquad Captain | CompSquad Captain | Notes |
|--------|----------------------|-------------------|-------|
| Place player on CompContract in Transfer Pool as Transfer Listed | ✗ | ✓ | Only for CompContract players |
| Remove player on InitContract | ✓ | ✓ | Can remove anytime |
| Remove player on CompContract | ✗ | ✗ | Cannot remove |
| Tweak member's CompContract terms | N/A | ✓ | If accepted: new contract; if declined: old remains |
| Accept player request via Squad ID (NonCompSquad) | InitContract only | N/A | |
| Accept player request via Squad ID (CompSquad) | N/A | InitContract or CompContract | |

---

## COMPETITION REGISTRATION RULES

### Captain Eligibility for Competition Registration

| Captain Tier | Can Register Squad for Competition | Must Assign Vice Captain First | Regional Requirement |
|--------------|------------------------------------|---------------------------------|----------------------|
| Basic | ✗ | N/A | N/A |
| Pro | ✓ | ✓ | Captain & Vice Captain in competition region |
| Premium | ✓ | ✓ | Captain & Vice Captain in competition region |

### Player Registration Eligibility

| Rule | All Tiers | Notes |
|------|-----------|-------|
| Cannot be registered in 2 different CompSquads for same competition | ✓ | Prevents multi-squad registration |
| Only players who accept CompContract are registered | ✓ | InitContract players unavailable for selection |
| Players on InitContract occupy squad slot but not registered | ✓ | Take up 1 of 14 slots |

### Registration Fees by Player Status

| Player Tier | Active Competitions | Registration Fee for NEW Competition | Alternative |
|-------------|---------------------|--------------------------------------|-------------|
| **Premium** | Any number | FREE | N/A |
| **Pro** | 1 competition | FREE | N/A |
| **Pro** | 2 competitions (Sub-Ineligible) | 2 coins from SquadBank | Squad Pass (6 coins) |
| **Basic** | 1 competition (Sub-Ineligible) | 2 coins from SquadBank | Squad Pass (6 coins) |

### Squad Pass Details

| Feature | Cost | Benefit |
|---------|------|---------|
| Squad Pass | 6 coins (one-time) | All Sub-Ineligible players in squad registered for new competition |

### Sub-Ineligible Player Rules

| Player Status | Registration Status | Available for Match Selection | Occupies Squad Slot |
|---------------|---------------------|-------------------------------|---------------------|
| Sub-Ineligible (not paid for) | Not registered | ✗ | ✓ |
| Sub-Ineligible (paid for via 2 coins or Squad Pass) | Registered | ✓ | ✓ |

---

## MATCH MANAGEMENT RULES

### Pre-Match Requirements

| Requirement | Captain | Vice Captain | Deadline | Consequence if Not Met |
|-------------|---------|--------------|----------|------------------------|
| Connect Discord | ✓ | ✓ | Before lineup submission | Cannot submit lineup |
| Submit lineup | ✓ | ✓ | 1 hour before match start | Forfeit (unless late fee paid) |
| Late lineup submission (with fee) | ✓ | ✓ | 30 minutes before match start | Pay 2 coins late fee |
| Final lineup deadline | ✓ | ✓ | 30 minutes before match start | Forfeit match |
| Add stream link | Any CompSquad player | Any CompSquad player | 30 minutes before match | N/A |

### Lineup Submission Timeline

| Timeframe | Action Available | Fee Required | Consequence |
|-----------|------------------|--------------|-------------|
| 2+ hours before match | Can start submitting lineup | None | Notification sent when submission opens |
| 1 hour before match | Standard deadline | None | Must submit or forfeit |
| Between 1 hour and 30 min before | Late submission allowed | 2 coins | Must pay to submit |
| Less than 30 min before | Hard deadline passed | N/A | Forfeit match |

### Match Discord Access

| Access Level | When Available | Who Can Access |
|--------------|----------------|----------------|
| Match Discord chats | After BOTH squads submit lineups | Captain & Vice Captain of both squads |

### Post-Match Result Submission

| Match Type | Leg | Submission Deadline | Failure Consequence |
|------------|-----|---------------------|---------------------|
| Any fixture | 1st leg | 1 hour after match start time | Lose 1 point, use opponent's results |
| Any fixture | 2nd leg | 2 hours after match start time | Lose 1 point, use opponent's results |

### Discord Chat Triggers (Non-Submission)

| Competition Type | Scenario | Discord Chat Initiated |
|------------------|----------|------------------------|
| League match | BOTH squads fail to submit after 1 leg | Discord chat 4 (see Match Result Validation doc) |
| Knockout round | ANY squad fails to submit after each leg | Discord chat 3 (see Match Result Validation doc) |

### Player Match Actions

| Action | Who Can Do It | When | Notes |
|--------|---------------|------|-------|
| Add stream link (max 2 per squad) | Any CompSquad player in lineup | 30 min before match time | Max 2 links total for squad |
| Rate squad members | Players in submitted lineup | After match result & disputes confirmed | Uses Known As names |

### Dispute Rules

| Who Can Initiate | Valid Dispute Reasons | Requirements |
|------------------|----------------------|--------------|
| Captain or Vice Captain in confirmed lineup | 1. Inaccurate scores<br>2. Inaccurate player stats<br>3. Game crash/network issues<br>4. Incorrect lineup | Must be for their own match |

---

## LEADERSHIP & SQUAD MANAGEMENT

### Captain Assignment Types

| Assignment Type | Functions Included | Can Fold Squad | Duration | Available To |
|-----------------|-------------------|----------------|----------|--------------|
| **Basic** | Lineup submission, match facilitation, match facts submission | ✗ | Permanent | All Captains |
| **Enhanced (24 hrs)** | Basic + transfers, contract negotiations, player registration, competition registration | ✗ | 24 hours | Assigned by Captain |
| **Enhanced (Full Time)** | All enhanced functions including squad folding/termination | ✓ | Permanent | Assigned by Captain |

### Captain Authority by Squad Type

| Action | NonCompSquad Captain | CompSquad Captain | Notes |
|--------|----------------------|-------------------|-------|
| Assign captaincy to any member | ✓ | Only to member in same region | Regional restriction for CompSquad |
| Assign vice captaincy to any member | ✓ | ✓ | No restrictions |
| Change Vice Captain | ✓ | ✓ | Anytime |
| Remove player on InitContract | ✓ | ✓ | With notification to player |
| Remove player on CompContract | ✗ | ✗ | Cannot remove |
| Tweak member's CompContract | N/A | ✓ | If accepted: new; if declined: old remains |

### Vice Captain Rules

| Scenario | Result | Applies To |
|----------|--------|------------|
| Captain breaks contract | Vice Captain becomes Captain | All squads |
| Captain transfers to another squad | Vice Captain becomes Captain | All squads |
| NonCompSquad formed | Vice Captain auto-assigned to next member after Captain | NonCompSquad only |
| No Vice Captain assigned | Squad marked internally "inactive" | All squads |
| CompSquad registration | Must have Vice Captain assigned | CompSquad only |

### Squad Formation & Termination

| Event | Action | Result |
|-------|--------|--------|
| NonCompSquad formed | Captain auto-assigned to creator | Captain role assigned |
| NonCompSquad formed | Vice Captain auto-assigned to next member | Vice Captain role assigned |
| Last member (Captain) leaves | Squad deletion initiated | Captain must agree to terminate |
| Last member leaves CompSquad | Squad deletion delayed | Termination after competition ends |

### Contract Breaking Winnings

| Scenario | Winnings Recipient | Amount |
|----------|-------------------|--------|
| Player in CompSquad breaks contract | Captain who registered the CompSquad | Player's potential winning % |
| Original Captain broke contract | 2nd Captain (new Captain) | Player's potential winning % |

---

## SQUAD FEES & FINANCIAL RULES

### Required Fees from SquadBank

| Action | Fee | Payment Source | Credited To |
|--------|-----|----------------|-------------|
| Register new player (Basic/Pro in new comp) | 2 coins | SquadBank | Platform |
| Register new player (Premium) | FREE | N/A | N/A |
| Transfer Transfer Listed player | Player value + 2 coins | SquadBank | Player value → previous SquadBank<br>2 coins → platform |
| Transfer Free Agent player | 2 coins only | SquadBank | Platform |
| Squad Pass (all Sub-Ineligible players) | 6 coins (one-time) | SquadBank | Platform |
| Late lineup submission | 2 coins | SquadBank | Platform |

### SquadBank Requirements

| Transaction Type | SquadBank Requirement | Notes |
|------------------|----------------------|-------|
| Transfer Listed player | Must have: Player value + 2 coins | Transaction fails if insufficient |
| Free Agent player | Must have: 2 coins | Transaction fails if insufficient |
| CompContract sent (insufficient balance) | No requirement | Fees payable after player accepts |

---

## SQUAD CONSTRAINTS

### Squad Size & Competition Rules

| Rule | Limit | Notes |
|------|-------|-------|
| Minimum squad size | 5 players | Required for competition |
| Maximum squad size | 14 players | Hard limit enforced |
| Stream links per match | 2 links max | Any CompSquad player can add |
| Same competition registration | Cannot register twice | Squad cannot join competition already in |

---

## PLAYER PROFILE RULES

### Profile Updates by Tier

| Feature | Basic | Pro | Premium |
|---------|-------|-----|---------|
| Update attributes with screenshot images | ✗ | ✓ (max 2 images) | ✓ (max 4 images) |
| Unlock in-game challenges | Pay 1 coin | Pay 1 coin | FREE unlimited |
| Active challenge duration | Until refreshed/accomplished | Until refreshed/accomplished | Until refreshed/accomplished |
| XP reward for accomplished challenge | As specified in XP cursorules doc | As specified in XP cursorules doc |

### Profile Visibility Rules

| Feature | All Players | Notes |
|---------|-------------|-------|
| All active CompContracts visible on profile | ✓ | Public visibility |
| Known As name on player cards | ✓ | Used for match facts validation |
| Known As name on match facts | ✓ | Consistent naming |
| Searchable by Known As name | ✓ | Any player can search |
| Searchable by PSN ID/Gamertag | ✓ | Any player can search |
| Send Contract button visibility | Only for Free Agents & Transfer Listed | Context-sensitive display |

---

## UNIVERSAL RULES (ALL PLAYERS)

| Rule | Description | Applies To |
|------|-------------|------------|
| Can receive, view, accept/decline InitOrCompContract offers | Players can manage incoming contract offers | All eligible players |
| Can request to join Squad using Squad ID | Players can initiate squad join requests | All players |
| Can sign and break InitContracts for free | No fees for NonCompSquad contracts | All players |
| All active CompContracts visible on player profile | Public contract visibility | All players |
| Cannot be registered in 2 different CompSquads for same competition | Prevents duplicate registrations | All players |
| Can search for players using Known As name or PSN ID/Gamertag | Player search functionality | All players |
| Can search for squads using Squad Name | Squad search functionality | All players |
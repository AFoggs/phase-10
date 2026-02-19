# Future Enhancements

A prioritized list of features and improvements to consider for the Phase 10 game.

---

## High Impact - Gameplay Features

### Auto-fill Phase Helper
- **Status:** Stub exists in `PhaseValidation.autoFill()` but not implemented
- **Description:** Suggest valid card groupings to help players complete their phase
- **Implementation:** Algorithm to group by value (sets), then by sequence (runs), then by color
- **Files:** `client/src/components/PhaseBuilder.jsx`, `client/src/utils/phaseDefinitions.js`

### Deck/Discard Count Display
- **Status:** Completed ✅
- **Description:** Shows deck and discard pile card counts with clickable discard history

### Discard Pile History
- **Status:** Completed ✅
- **Description:** Click discard count badge to see last 5 discarded cards

### Rematch / Play Again
- **Status:** Completed ✅
- **Description:** "Play Again" button after game ends, resets game with same players

---

## Medium Impact - UX Improvements

### Hit Preview / Card Suggestions
- **Status:** Completed ✅
- **Description:** Cards that can hit show cyan glow and "HIT" badge during play phase

### Spectator Mode
- **Status:** Not implemented
- **Description:** Allow observers to watch games without being a player
- **Implementation:** Add spectator role to room, send read-only game state
- **Files:** `server/src/rooms/RoomManager.js`, `server/src/socketHandlers.js`

### Game Chat / Emotes
- **Status:** Not implemented
- **Description:** In-game communication between players
- **Implementation:** Quick emote buttons or simple chat with rate limiting
- **Files:** New component `client/src/components/GameChat.jsx`

### Pause on Disconnect
- **Status:** Completed ✅
- **Description:** Game pauses when human player disconnects, resumes on reconnect

### Better Reconnection Support
- **Status:** Completed ✅
- **Description:** Reconnect handler syncs state and resumes paused games

---

## Lower Priority - Polish

### Color Blind Support
- **Status:** Not implemented
- **Description:** Add pattern overlays for card colors (stripes, dots, etc.)
- **Implementation:** Alternative card rendering mode with patterns
- **Files:** `client/src/components/Card.jsx`, `client/src/App.css`

### Keyboard Navigation
- **Status:** Mouse/touch only
- **Description:** Full keyboard control for accessibility
- **Implementation:** Tab navigation, arrow keys for card selection, hotkeys
- **Files:** `client/src/components/PlayerHand.jsx`, `client/src/components/GameBoard.jsx`

### Game Statistics
- **Status:** Not implemented
- **Description:** Track win/loss history, phase completion stats, leaderboards
- **Implementation:** Store stats in localStorage or backend database
- **Files:** New component, requires persistence layer

### Undo Phase Building
- **Status:** Completed ✅
- **Description:** Undo button in phase builder reverts card placements (up to 20 actions)

### Screen Reader Support
- **Status:** Not implemented
- **Description:** Announce cards, turns, and game events for visually impaired users
- **Implementation:** Add ARIA labels, live regions for announcements
- **Files:** All UI components

### High Contrast Mode
- **Status:** Not implemented
- **Description:** Alternative color scheme for better visibility
- **Implementation:** CSS theme toggle, high contrast color palette
- **Files:** `client/src/App.css`, `tailwind.config.js`

---

## Quality of Life

### Hand Management
- [ ] Custom hand grouping by user preference
- [ ] "Select all matching" feature for quick phase building
- [ ] Pinned/favorite cards feature

### Phase Selection Improvements (Choice/Chaos Modes)
- [ ] Show success probability for available phases
- [ ] Indicate which phases other players are attempting
- [ ] Phase difficulty comparison

### Visual Feedback
- [ ] Animation when cards move to hit targets
- [ ] Better phase completion celebration
- [ ] Card dealing animation at round start

### Turn Management
- [ ] Optional turn timer with warning
- [ ] "Hurry up" nudge for slow players
- [ ] Speed settings for CPU turns

---

## Technical Debt

### Code Improvements
- [ ] More detailed phase validation error messages
- [ ] Better error handling with user-friendly messages
- [ ] Unit tests for game logic
- [ ] Integration tests for socket handlers

### Performance
- [ ] Optimize CPU player decision making
- [ ] Reduce unnecessary re-renders in React components
- [ ] Lazy load game components

---

## Completed Features ✅

- [x] All 30 phases with validation
- [x] Skip card rules (can't pick from discard, stacking)
- [x] Deck exhaustion and reshuffle
- [x] Wild card placement in runs
- [x] 3 game modes (Normal, Choice, Chaos)
- [x] CPU players with 3 difficulty levels
- [x] Mobile touch drag-and-drop support
- [x] Random player name generation
- [x] Network/LAN multiplayer
- [x] Audio player (hidden on mobile)
- [x] Draw notifications with card info
- [x] Phase out notifications
- [x] Hit notifications
- [x] Deck/discard count display
- [x] Discard pile history (last 5 cards)
- [x] Rematch / Play Again
- [x] Hit preview (cyan glow on hittable cards)
- [x] Pause on disconnect with auto-resume
- [x] Player reconnection support
- [x] Undo phase building (up to 20 actions)

---

## How to Contribute

When implementing a feature:
1. Check this file for the feature status
2. Update status to "In Progress"
3. Follow existing code patterns
4. Test on both desktop and mobile
5. Update status to "Completed" and move to completed section

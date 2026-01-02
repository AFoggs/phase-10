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
- **Status:** Not implemented
- **Description:** Show players how many cards remain in the draw pile
- **Implementation:** Add deck count to game state, display in `DrawDiscardPiles.jsx`
- **Files:** `server/src/game/Game.js`, `client/src/components/DrawDiscardPiles.jsx`

### Discard Pile History
- **Status:** Only shows top card
- **Description:** Allow players to see recently discarded cards (last 5-10)
- **Implementation:** Track discard history in state, add hover/click to reveal
- **Files:** `server/src/game/Deck.js`, `client/src/components/DrawDiscardPiles.jsx`

### Rematch / Play Again
- **Status:** Not implemented
- **Description:** Quick restart with same players after game ends
- **Implementation:** Add "Play Again" button that resets game state but keeps room/players
- **Files:** `server/src/rooms/RoomManager.js`, `client/src/components/GameBoard.jsx`

---

## Medium Impact - UX Improvements

### Hit Preview / Card Suggestions
- **Status:** Not implemented
- **Description:** Highlight which cards in hand can hit on visible phases
- **Implementation:** Calculate valid hits for each card, add visual indicator
- **Files:** `client/src/components/PlayerHand.jsx`, `server/src/game/phaseLogic.js`

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
- **Status:** Players marked disconnected but game continues
- **Description:** Pause game when human player disconnects, resume on reconnect
- **Implementation:** Add pause state, timeout before auto-forfeit
- **Files:** `server/src/game/Game.js`, `server/src/socketHandlers.js`

### Better Reconnection Support
- **Status:** Limited - players can't fully rejoin mid-game
- **Description:** Allow disconnected players to rejoin and resume their game
- **Implementation:** Store player session tokens, sync full state on reconnect
- **Files:** `server/src/socketHandlers.js`, `client/src/App.jsx`

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
- **Status:** Limited
- **Description:** Easy undo for card placements in phase builder
- **Implementation:** Track action history, add undo button
- **Files:** `client/src/components/GameBoard.jsx`

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

---

## How to Contribute

When implementing a feature:
1. Check this file for the feature status
2. Update status to "In Progress"
3. Follow existing code patterns
4. Test on both desktop and mobile
5. Update status to "Completed" and move to completed section

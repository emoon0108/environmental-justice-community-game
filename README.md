# Common Ground

A multiplayer board game that teaches middle and high school students about environmental justice. Players move around a shared board, face environmental disasters, collect Solution Cards, and learn real facts about how environmental problems affect communities differently.

**Build for Everyone, Leave No One Behind!**

## Play

**Website:** https://emoon0108.github.io/environmental-justice-community-game/

- **Shared device:** Choose **New game**, add 2–6 players, and pick a different character for each. Pass the device between turns.
- **Separate devices:** Choose **Play on separate devices**, create a room, and share the invitation link or six-character code. The host starts after at least two people join.
- **Instructions** are available from the header and the main screen before anyone starts.

### Rules

1. Roll the virtual six-sided die and move that many spaces.
2. The board has 36 spaces:
   - **18 Normal spaces.** 12 have a lightbulb icon and show a learning fact in a pop-up with a **Continue to Game** button. The other 6 are blank: nothing happens and the next player goes. The 12 facts are shuffled onto the lightbulb spaces at the start of every game.
   - **9 Mystery spaces.** Draw a card: a Solution Card (kept until used, no limit) or a Community Organizing Card (an example of collective action).
   - **9 Disaster spaces.** If you hold the matching Solution Card you can use it to stay put (the card is discarded). Otherwise you move back to the closest Normal space behind you.
3. The first player to reach the finish line wins. The end-of-game summary highlights what everyone learned and includes discussion questions.

| Disaster | Matching Solution Card |
| --- | --- |
| Heatwave | AC |
| Air pollution (infrastructure facilities, poor waste management, highways through the city) | Nebulizer |
| Water pollution | Community water bottle distribution |
| Food desert | Stathis Paul comes to the community to build an urban farm |
| Poor top layer soil | Cover crops |
| Cold | Your house is insulated |
| Local deforestation | Community plants 500 trees |
| Lack of technological resources | Local library opens with accessible technology and internet |
| Industrial chemical pollution | Community protests to change regulations |

Simple sound effects play when the die is rolled and as pieces move. They are synthesized in the browser (no audio files) and can be muted with the speaker button.

## Run locally

Requires Node.js 22.13 or newer. There are no application dependencies to install.

```sh
npm run dev
```

Open **http://localhost:4173**. The local preview supports both play modes. Shared-device progress is stored in the browser; online rooms persist in SQLite at `.local/rooms.sqlite`, which is excluded from Git. To play across devices on the same network, open the development computer’s local network address on port 4173. A secure HTTPS deployment is recommended for general use.

```sh
npm run check
npm test
npm run build
```

The dev server rebuilds changed source on the next request. Refresh the browser after an edit. Set `PORT` to use another port.

## Deployment

### GitHub Pages

GitHub Pages publishes the root of the `gh-pages` branch. Its `.nojekyll` marker supports direct static publication without an Actions build runner. Actions is currently disabled for this repository. The optional workflow is available if Actions is enabled later; it checks, tests, builds, and publishes changes from `main`.

```sh
npm run build:pages
npm run deploy:pages
```

The build produces `pages/index.html` with inline CSS, artwork, and JavaScript. The publisher requires the GitHub CLI (`gh`) signed in with repository access; it updates the release branch and requests publication. Run checks and tests before publishing. Relative navigation supports GitHub project paths. Google Fonts is optional; the game falls back to local sans-serif fonts when it is unavailable.

### Online room service

GitHub Pages hosts the interface; a Cloudflare Worker with D1 stores and synchronizes online rooms. The default API origin is `https://environmental-justice-community-game.codex6633440.chatgpt.site`. The backend is independently deployed through Sites; a Pages deployment does not automatically redeploy the Worker.

To point Pages at a different compatible service, set `GAME_API_ORIGIN` during `npm run build:pages`. Update the Worker’s allowed Pages origin when moving the frontend to another account or domain. No API keys or credentials are included in the browser build. `GET /api/version` reports the rules version; the browser checks it before creating or joining a room and asks players to use a shared device if the room service is running an older version.

`npm run build` creates a self-contained Worker at `dist/server/index.js`. `.openai/hosting.json` declares its D1 binding, `DB`. The schema migration lives in `drizzle/0000_rooms.sql`. Apply migrations before running the Worker; the request handler never creates tables. Sites provisions the binding and applies the migration when publishing.

Rooms expire 24 hours after their last change. Player bearer tokens are generated randomly, hashed before storage, and omitted from shared state. The server runs the same rules as the browser and validates every turn, roll, and Solution Card use. Optimistic revision checks prevent concurrent joins or turns from overwriting each other. Room membership is restored from the same browser’s local storage; clearing that storage loses that player’s seat.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/game.js` | Shared rules, board layout, characters, disasters, Solution Cards, Community Organizing Cards, and learning facts |
| `src/app.js` | Board artwork, die, sound effects, pop-ups, local play, and room client |
| `src/styles.css` | Responsive layouts for computers, tablets, and phones; reduced-motion styles |
| `src/index.html` | Accessible page structure |
| `worker/index.js` | Room API, authorization, and D1 persistence |
| `scripts/` | Local development and deployment builds |
| `tests/` | Board layout, rules, full-game, room synchronization, and authorization checks |

## Learning design

The 12 learning facts, 9 disasters, and their matching Solution Cards come from the project PRD. Community Organizing Cards give concrete examples of collective action: cleanups, public hearings, community gardens, data collection, coalitions, and more. The neighborhood on the board is fictional.

Sources for further reading are listed in the game's **Learning resources** dialog, including the EPA on [urban heat islands](https://www.epa.gov/heatislands/learn-about-heat-islands), the [WHO/UNICEF Joint Monitoring Programme](https://washdata.org/) on water and sanitation, [ITU Facts and Figures 2025](https://www.itu.int/itu-d/reports/statistics/facts-figures-2025/), and the [USDA Food Access Research Atlas](https://www.ers.usda.gov/data-products/food-access-research-atlas/).

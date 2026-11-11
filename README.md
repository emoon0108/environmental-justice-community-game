# Common Ground

A cooperative environmental justice board game for middle and high school learners. Explore a shared neighborhood, discuss environmental decisions, and bring every neighbor to the finish line.

## Play

**Website:** https://emoon0108.github.io/environmental-justice-community-game/

- **Shared device:** Start immediately with four neighbors, or choose **New game** to name 2–6 players and select distinct pieces. Pass the device between turns.
- **Online rooms:** Choose **Play with friends**, create a room, and share the invitation link or six-character code. Each player joins from their own device. The host starts after at least two people join.
- Spin 1–10 spaces, answer the card for your space, read the explanation, and pass the turn.
- Reach 100 community points together. Everyone wins when every player reaches Common Ground, even if the optional points goal has not been reached.
- The final summary recognizes each player’s contributions and can be downloaded as a text file.

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

GitHub Pages publishes the root of the `gh-pages` branch. Pushes to `main` run `.github/workflows/pages.yml`: syntax checks, automated tests, a static build, and an update to the published branch. The publisher explicitly requests a Pages build after updating the branch. The initial release can also be built and pushed locally, independently of the Actions runner queue.

```sh
npm run build:pages
```

This produces `pages/index.html` with inline CSS, artwork, and JavaScript. Relative navigation supports GitHub project paths. Google Fonts is optional; the game falls back to local sans-serif fonts when it is unavailable.

### Online room service

GitHub Pages hosts the interface; a Cloudflare Worker with D1 stores and synchronizes online rooms. The default API origin is `https://environmental-justice-community-game.codex6633440.chatgpt.site`. The backend is independently deployed through Sites; a Pages deployment does not automatically redeploy the Worker.

To point Pages at a different compatible service, set `GAME_API_ORIGIN` during `npm run build:pages`. Update the Worker’s allowed Pages origin when moving the frontend to another account or domain. No API keys or credentials are included in the browser build.

`npm run build` creates a self-contained Worker at `dist/server/index.js`. `.openai/hosting.json` declares its D1 binding, `DB`. The schema migration lives in `drizzle/0000_rooms.sql`. Apply migrations before running the Worker; the request handler never creates tables. Sites provisions the binding and applies the migration when publishing.

Rooms expire 24 hours after their last change. Player bearer tokens are generated randomly, hashed before storage, and omitted from shared state. The server validates turns, rolls, answers, and contributions. Optimistic revision checks prevent concurrent joins or turns from overwriting each other. Room membership is restored from the same browser’s local storage; clearing that storage loses that player’s seat.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/game.js` | Shared game rules, six characters, and 24 educational cards |
| `src/app.js` | Board artwork, interface, local play, and room client |
| `src/styles.css` | Responsive layouts and reduced-motion styles |
| `src/index.html` | Accessible page structure |
| `worker/index.js` | Room API, authorization, and D1 persistence |
| `scripts/` | Local development and deployment builds |
| `tests/` | Game completion, scoring, room synchronization, and authorization checks |

## Learning design

The deck contains eight knowledge, eight challenge, and eight community action cards. Each question includes a plain-language explanation and a link to its learning source. Cards are sampled without repeats within a category until that deck is exhausted.

The neighborhood and scenarios are fictional. Community points and the impact indicators are learning devices, not real environmental measurements. The game encourages discussion of structural inequalities and community leadership without assigning disadvantages to characters based on identity.

Sources include EPA resources on [environmental justice and public participation](https://www.epa.gov/sites/default/files/2015-02/documents/ips-final-report.pdf), [green infrastructure](https://www.epa.gov/green-infrastructure/benefits-green-infrastructure), and [trees and urban heat](https://www.epa.gov/heatislands/benefits-trees-and-vegetation).

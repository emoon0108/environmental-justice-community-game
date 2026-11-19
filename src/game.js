// Shared rules for the Environmental Justice board game. The browser and the
// online room Worker both run these functions, so every move is validated the
// same way in shared-device and online play.

export const VERSION = 2;
export const SPACES = 36;          // typed spaces on the board (1–36)
export const FINISH = SPACES + 1;  // the finish line just past space 36
export const DIE_SIDES = 6;
export const CALL_TO_ACTION = 'Build for Everyone, Leave No One Behind!';

export const CHARACTERS = [
  { id: 'leaf', name: 'The Grower', color: '#2f7a5f', light: '#dcefe4', icon: 'leaf' },
  { id: 'water', name: 'The Protector', color: '#3f74c4', light: '#e0eafb', icon: 'drop' },
  { id: 'sun', name: 'The Optimist', color: '#b07a12', light: '#fcefd0', icon: 'sun' },
  { id: 'flower', name: 'The Connector', color: '#b2557a', light: '#f8e1ea', icon: 'flower' },
  { id: 'bird', name: 'The Advocate', color: '#6d5bb0', light: '#ebe6f8', icon: 'bird' },
  { id: 'sprout', name: 'The Builder', color: '#b45a32', light: '#f8e5da', icon: 'sprout' }
];

export const SPACE_TYPES = {
  normal: { name: 'Normal space', plural: 'Normal spaces', count: 18 },
  mystery: { name: 'Mystery space', plural: 'Mystery spaces', count: 9 },
  disaster: { name: 'Disaster space', plural: 'Disaster spaces', count: 9 }
};

// Each Disaster Space has exactly one matching Solution Card.
export const DISASTERS = [
  { id: 'heatwave', name: 'Heatwave', icon: 'thermometer', solution: 'ac',
    text: 'Extreme heat settles over the neighborhood. Homes without air conditioning and streets without shade become dangerous, especially for older adults and people with health conditions.' },
  { id: 'air', name: 'Air pollution', icon: 'smog', solution: 'nebulizer',
    detail: 'From infrastructure facilities, poor waste management, and highways through the city',
    text: 'Highways cut through the neighborhood, and nearby facilities and poorly managed waste fill the air with pollution. Breathing gets harder, especially for people with asthma.' },
  { id: 'water', name: 'Water pollution', icon: 'drop', solution: 'water-bottles',
    text: 'The neighborhood’s water is contaminated and unsafe to drink. Families need clean water right away while the source is fixed.' },
  { id: 'food', name: 'Food desert', icon: 'basket', solution: 'urban-farm',
    text: 'The nearest supermarket is miles away. Without a car or a store nearby, getting fresh, healthy food is hard.' },
  { id: 'soil', name: 'Poor top layer soil', icon: 'soil', solution: 'cover-crops',
    text: 'The top layer of soil is worn out and washing away. Gardens and farms struggle to grow healthy crops.' },
  { id: 'cold', name: 'Cold', icon: 'snowflake', solution: 'insulation',
    text: 'A cold snap hits. Homes without good insulation lose heat quickly, leaving families with freezing rooms or high energy bills.' },
  { id: 'deforestation', name: 'Local deforestation', icon: 'stump', solution: 'trees',
    text: 'Nearby trees are cut down. The neighborhood loses shade, cleaner air, and homes for wildlife.' },
  { id: 'tech', name: 'Lack of technological resources', icon: 'wifi-off', solution: 'library',
    text: 'Many households don’t have reliable internet or a computer, which makes homework, job applications, and staying informed much harder.' },
  { id: 'chemical', name: 'Industrial chemical pollution', icon: 'factory', solution: 'protest',
    text: 'A nearby industrial site releases harmful chemicals into the air, water, and soil around homes and schools.' }
];

export const SOLUTIONS = [
  { id: 'ac', name: 'AC', short: 'AC', disaster: 'heatwave', icon: 'fan',
    text: 'Air conditioning keeps your home cool and safe during extreme heat.' },
  { id: 'nebulizer', name: 'Nebulizer', short: 'Nebulizer', disaster: 'air', icon: 'lungs',
    text: 'A nebulizer turns asthma medicine into a mist that is easy to breathe in, helping people breathe more easily on bad air days.' },
  { id: 'water-bottles', name: 'Community water bottle distribution', short: 'Water bottle distribution', disaster: 'water', icon: 'bottle',
    text: 'Neighbors and local groups hand out clean bottled water so every family has safe water to drink.' },
  { id: 'urban-farm', name: 'Stathis Paul comes to the community to build an urban farm', short: 'Urban farm', disaster: 'food', icon: 'sprout',
    text: 'The new urban farm grows fresh fruits and vegetables right in the neighborhood, so healthy food is close to home.' },
  { id: 'cover-crops', name: 'Cover crops', short: 'Cover crops', disaster: 'soil', icon: 'wheat',
    text: 'Planting cover crops protects the soil from washing away and adds nutrients back, so the ground can grow healthy food again.' },
  { id: 'insulation', name: 'Your house is insulated', short: 'Insulated house', disaster: 'cold', icon: 'house',
    text: 'Insulation keeps warmth inside, so your home stays warm and energy bills stay lower.' },
  { id: 'trees', name: 'Community plants 500 trees', short: '500 trees', disaster: 'deforestation', icon: 'tree',
    text: 'Neighbors work together to bring back shade, cleaner air, and wildlife habitat.' },
  { id: 'library', name: 'Local library opens with accessible technology and internet', short: 'Library tech access', disaster: 'tech', icon: 'library',
    text: 'Free computers, internet access, and staff ready to help are now available to everyone in the neighborhood.' },
  { id: 'protest', name: 'Community protests to change regulations', short: 'Protest for regulations', disaster: 'chemical', icon: 'megaphone',
    text: 'Residents organize, speak up, and protest until leaders pass stronger rules that limit industrial pollution.' }
];

export const ORGANIZING = [
  { id: 'o1', title: 'Neighborhood cleanup', text: 'Neighbors organize a cleanup day to clear trash and illegal dumping from a vacant lot, then ask the city for regular pickup.', why: 'Working together shows leaders that residents care and that the neighborhood needs better services.' },
  { id: 'o2', title: 'Speak up at a public hearing', text: 'Residents attend a public hearing about a proposed facility and explain how it would affect their health and families.', why: 'Decision-makers need to hear from the people who will live with the results.' },
  { id: 'o3', title: 'Grow a community garden', text: 'Neighbors turn an empty lot into a community garden where everyone can grow and share fresh vegetables.', why: 'Shared gardens bring fresh food closer and bring neighbors together.' },
  { id: 'o4', title: 'Check on your neighbors', text: 'During a heat wave, volunteers call and visit older neighbors and let them know where the nearest cooling center is.', why: 'Simple check-ins can save lives when the weather turns dangerous.' },
  { id: 'o5', title: 'Collect the data', text: 'Students and residents use air quality sensors to measure pollution near a highway and share the results with local officials.', why: 'Community-collected data can show that a problem exists and push leaders to act.' },
  { id: 'o6', title: 'Share the technology', text: 'A community group starts a device-lending program and free digital skills classes for families without computers.', why: 'Access to technology opens doors to school, jobs, and important information.' },
  { id: 'o7', title: 'Information for everyone', text: 'Volunteers translate public notices and meeting materials into the languages spoken in the neighborhood.', why: 'Everyone deserves to understand the decisions that affect their home.' },
  { id: 'o8', title: 'Build a coalition', text: 'Schools, faith groups, tenant associations, and local businesses join forces to campaign for cleaner air.', why: 'Many groups speaking together are much harder to ignore.' },
  { id: 'o9', title: 'Stock a community fridge', text: 'Neighbors keep a community fridge and pantry stocked so anyone can take free food or leave some for others.', why: 'Mutual aid helps families meet their needs today while longer-term solutions are built.' },
  { id: 'o10', title: 'Plant and care for trees', text: 'A youth group plants trees on the hottest blocks and sets up a watering schedule to keep them healthy.', why: 'Trees cool streets and clean the air, but only if someone keeps caring for them.' },
  { id: 'o11', title: 'Start a green club', text: 'Students start an environmental club that runs a recycling and composting program at their school.', why: 'Young people can lead change in their schools and communities.' },
  { id: 'o12', title: 'Contact your representatives', text: 'Residents write letters and call their local representatives to ask for safe drinking water and lead pipe replacement.', why: 'Elected officials respond when many people ask for the same change.' }
];

export const FACTS = [
  { id: 'f1', topic: 'The digital divide', text: 'About 2.2 billion people around the world were offline in 2025. This digital divide shows why affordable internet and digital education matter.' },
  { id: 'f2', topic: 'Love Canal', text: 'During the 1940s and 1950s, over 21,000 tons of hazardous chemical waste were dumped at Love Canal in Niagara Falls, New York. Homes and a school were later built near the contaminated site.' },
  { id: 'f3', topic: 'Safe drinking water', text: 'About 2.1 billion people lack access to safely managed drinking water, and 106 million people drink directly from untreated surface water, such as rivers and lakes.' },
  { id: 'f4', topic: 'Our call to action', text: '“Build for Everyone, Leave No One Behind!” This game’s call to action shows why equal opportunities matter for marginalized communities, through innovation, accessible technology, and sustainable infrastructure.' },
  { id: 'f5', topic: 'Growing food locally', text: 'The MSU-Detroit Partnership for Food, Learning and Innovation (DPFLI) has grown and donated over 2,000 pounds of fresh food directly to local families and food pantries.' },
  { id: 'f6', topic: 'Grocery access', text: 'New Mexico is one of the states with the highest rates of limited grocery access. About 31.7% of residents live in areas with low access to supermarkets.' },
  { id: 'f7', topic: 'The 1995 Chicago heat wave', text: 'In July 1995, a heat wave in Chicago brought temperatures as high as 106°F and caused about 739 deaths. Low-income communities, especially elderly and Black residents, were hit hardest because many lacked air conditioning and adequate assistance.' },
  { id: 'f8', topic: 'The Dust Bowl', text: 'In the 1930s, severe drought and poor farming practices caused massive dust storms across the Great Plains, known as the Dust Bowl. Thousands of families, especially low-income farmers, lost their livelihoods and migrated.' },
  { id: 'f9', topic: 'Urban heat islands', text: 'Cities can be up to 7°F hotter during the day than surrounding areas because roads, buildings, and pavement absorb heat.' },
  { id: 'f10', topic: 'Sanitation', text: 'About 3.6 billion people, nearly half of the world’s population, lack access to safely managed sanitation in their homes.' },
  { id: 'f11', topic: 'Healthy soil', text: 'Earthworms create underground tunnels that allow water and air to move through soil. Their activity helps improve soil structure and nutrient cycling.' },
  { id: 'f12', topic: 'Defining environmental justice', text: 'The U.S. Environmental Protection Agency defines environmental justice as the “fair treatment and meaningful involvement of all people regardless of race, color, national origin, or income with respect to the development, implementation, and enforcement of environmental laws, regulations, and policies.”' }
];

// Board layout for spaces 1–36: N = Normal, M = Mystery, D = Disaster.
// Every Disaster Space has a Normal Space behind it to move back to.
const LAYOUT = 'NNMD' + 'NMND' + 'NNDM' + 'NMND' + 'MNDN' + 'NMND' + 'NDMN' + 'MNND' + 'NMDN';
const BLANK_SPACES = [2, 10, 15, 20, 28, 31];
const DISASTER_ORDER = ['heatwave', 'water', 'food', 'air', 'soil', 'cold', 'deforestation', 'tech', 'chemical'];
export const BOARD = (() => {
  const board = [{ index: 0, type: 'start' }];
  let disaster = 0;
  [...LAYOUT].forEach((code, i) => {
    const index = i + 1;
    if (code === 'N') board.push({ index, type: 'normal', fact: !BLANK_SPACES.includes(index) });
    else if (code === 'M') board.push({ index, type: 'mystery' });
    else board.push({ index, type: 'disaster', disaster: DISASTER_ORDER[disaster++] });
  });
  board.push({ index: FINISH, type: 'finish' });
  return board;
})();
export const FACT_SPACES = BOARD.filter(s => s.type === 'normal' && s.fact).map(s => s.index);

export const disasterById = id => DISASTERS.find(d => d.id === id);
export const solutionById = id => SOLUTIONS.find(s => s.id === id);
export const organizingById = id => ORGANIZING.find(o => o.id === id);
export const factById = id => FACTS.find(f => f.id === id);
export function factAt(game, index) {
  const slot = FACT_SPACES.indexOf(index);
  return slot < 0 ? null : factById(game.factOrder[slot]);
}
// The closest Normal Space behind a position, or the start if there is none.
export function previousNormal(index) {
  for (let i = index - 1; i >= 1; i--) if (BOARD[i].type === 'normal') return i;
  return 0;
}

export function randomInt(max) {
  const data = new Uint32Array(1); const limit = 4294967296 - 4294967296 % max;
  do { crypto.getRandomValues(data); } while (data[0] >= limit);
  return data[0] % max;
}
export function shuffle(items, rng = randomInt) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = rng(i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

export function makePlayer(name, character, id = crypto.randomUUID()) {
  if (!CHARACTERS.some(c => c.id === character)) throw new Error('Choose a character.');
  name = String(name || '').trim().replace(/[<>\x00-\x1f]/g, '').slice(0, 24);
  if (!name) throw new Error('Enter your name.');
  return { id, name, character, position: 0, cards: [], facts: [], used: 0, collected: 0, organizing: 0, setbacks: 0 };
}
export function newGame(players, mode = 'local', rng = randomInt) {
  return {
    version: VERSION, mode, status: mode === 'online' ? 'lobby' : players.length ? 'playing' : 'setup',
    players, host: players[0]?.id, turn: 0, round: 1, phase: 'roll', lastRoll: null,
    event: null, move: null, moveSeq: 0, winner: null,
    factOrder: shuffle(FACTS.map(f => f.id), rng), organizingDrawn: [],
    history: [{ text: 'A new game begins. ' + CALL_TO_ACTION, type: 'start' }], revision: 0
  };
}
export function activePlayer(game) { return game.players[game.turn]; }
export function log(game, text, type) { game.history.unshift({ text, type }); game.history = game.history.slice(0, 80); }

function nextTurn(game) {
  game.turn = (game.turn + 1) % game.players.length;
  if (game.turn === 0) game.round++;
  game.phase = 'roll'; game.event = null;
}
function recordMove(game, player, from, stops) {
  game.moveSeq = (game.moveSeq || 0) + 1;
  game.move = { seq: game.moveSeq, player: player.id, from, stops };
}
function moveBack(game, player, from) {
  const back = previousNormal(from);
  player.position = back; player.setbacks++;
  return back;
}
function drawOrganizing(game, rng) {
  let available = ORGANIZING.filter(o => !game.organizingDrawn.includes(o.id));
  if (!available.length) { game.organizingDrawn = []; available = ORGANIZING; }
  const card = available[rng(available.length)];
  game.organizingDrawn.push(card.id);
  return card;
}

export function takeAction(original, playerId, action, data = {}, rng = randomInt) {
  const game = structuredClone(original);
  const player = game.players.find(p => p.id === playerId);
  if (!player) throw new Error('You are not a player in this game.');
  if (action === 'start') {
    if (game.host !== playerId) throw new Error('Only the host can start the game.');
    if (game.status !== 'lobby' || game.players.length < 2) throw new Error('At least two players are needed.');
    game.status = 'playing';
    log(game, player.name + ' started the game. ' + game.players[0].name + ' rolls first.', 'start');
  } else {
    if (game.status !== 'playing') throw new Error('This game is not in progress.');
    if (activePlayer(game)?.id !== playerId) throw new Error('It is another player’s turn.');
    const event = game.event;
    if (action === 'roll') {
      if (game.phase !== 'roll') throw new Error('Finish your current turn first.');
      const roll = rng(DIE_SIDES) + 1, from = player.position, landed = Math.min(FINISH, from + roll);
      player.position = landed; game.lastRoll = roll;
      recordMove(game, player, from, [landed]);
      game.move.roll = roll;
      const space = BOARD[landed];
      if (space.type === 'finish') {
        game.status = 'complete'; game.winner = player.id; game.phase = 'event'; game.event = { type: 'finish' };
        log(game, player.name + ' rolled ' + roll + ' and reached the finish line first!', 'finish');
      } else if (space.type === 'normal' && !space.fact) {
        log(game, player.name + ' rolled ' + roll + ' and landed on blank space ' + landed + '.', 'blank');
        nextTurn(game);
      } else if (space.type === 'normal') {
        const fact = factAt(game, landed);
        if (!player.facts.includes(fact.id)) player.facts.push(fact.id);
        game.phase = 'event'; game.event = { type: 'fact', space: landed, fact: fact.id };
        log(game, player.name + ' rolled ' + roll + ' and found a learning fact: ' + fact.topic + '.', 'fact');
      } else if (space.type === 'mystery') {
        game.phase = 'event';
        if (rng(2) === 0) {
          const card = SOLUTIONS[rng(SOLUTIONS.length)];
          player.cards.push(card.id); player.collected++;
          game.event = { type: 'solution', space: landed, card: card.id };
          log(game, player.name + ' rolled ' + roll + ' and drew the ' + card.short + ' Solution Card.', 'solution');
        } else {
          const card = drawOrganizing(game, rng);
          player.organizing++;
          game.event = { type: 'organizing', space: landed, card: card.id };
          log(game, player.name + ' rolled ' + roll + ' and drew a Community Organizing Card: ' + card.title + '.', 'organizing');
        }
      } else {
        const disaster = disasterById(space.disaster), solution = solutionById(disaster.solution);
        game.phase = 'event';
        if (player.cards.includes(solution.id)) {
          game.event = { type: 'disaster', space: landed, disaster: disaster.id, outcome: 'choose' };
          log(game, player.name + ' rolled ' + roll + ' and landed on ' + disaster.name + ', holding the ' + solution.short + ' card.', 'disaster');
        } else {
          const back = moveBack(game, player, landed);
          game.move.stops.push(back);
          game.event = { type: 'disaster', space: landed, disaster: disaster.id, outcome: 'moved', backTo: back };
          log(game, player.name + ' rolled ' + roll + ', hit ' + disaster.name + ' without the ' + solution.short + ' card, and moved back to ' + (back ? 'space ' + back : 'the start') + '.', 'disaster');
        }
      }
    } else if (action === 'use-card' || action === 'move-back') {
      if (game.phase !== 'event' || event?.type !== 'disaster' || event.outcome !== 'choose') throw new Error('There is no disaster to respond to.');
      const disaster = disasterById(event.disaster), solution = solutionById(disaster.solution);
      if (action === 'use-card') {
        player.cards.splice(player.cards.indexOf(solution.id), 1); player.used++;
        event.outcome = 'used';
        log(game, player.name + ' used the ' + solution.short + ' card to stay safe from ' + disaster.name + '.', 'used');
      } else {
        const back = moveBack(game, player, event.space);
        recordMove(game, player, event.space, [back]);
        event.outcome = 'moved'; event.backTo = back;
        log(game, player.name + ' kept the ' + solution.short + ' card and moved back to ' + (back ? 'space ' + back : 'the start') + '.', 'disaster');
      }
    } else if (action === 'continue') {
      if (game.phase !== 'event') throw new Error('Roll the die to take your turn.');
      if (event?.type === 'disaster' && event.outcome === 'choose') throw new Error('Choose whether to use your Solution Card.');
      nextTurn(game);
    } else throw new Error('Unknown game action.');
  }
  game.revision++;
  return game;
}

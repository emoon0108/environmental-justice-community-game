export const FINISH = 36;
export const CHARACTERS = [
  { id: 'leaf', name: 'The Grower', color: '#347c68', light: '#e0eee5', icon: 'leaf' },
  { id: 'water', name: 'The Protector', color: '#4e80c8', light: '#e4edfa', icon: 'drop' },
  { id: 'sun', name: 'The Optimist', color: '#bb872d', light: '#fcf0d3', icon: 'sun' },
  { id: 'flower', name: 'The Connector', color: '#b76d83', light: '#f7e4eb', icon: 'flower' },
  { id: 'bird', name: 'The Advocate', color: '#7e70ad', light: '#ece7f6', icon: 'bird' },
  { id: 'sprout', name: 'The Builder', color: '#b66c49', light: '#f7e9dd', icon: 'sprout' }
];
export const CATEGORIES = {
  knowledge: { name: 'Knowledge', short: 'Learn something new', color: '#4d7ebc', light: '#e7eff9', icon: 'book' },
  challenge: { name: 'Challenge', short: 'Think it through', color: '#bd8250', light: '#fbefdf', icon: 'bolt' },
  action: { name: 'Community action', short: 'Make a difference', color: '#4e8974', light: '#e6f1e9', icon: 'people' }
};
const gi = 'https://www.epa.gov/green-infrastructure/benefits-green-infrastructure';
const heat = 'https://www.epa.gov/heatislands/benefits-trees-and-vegetation';
const ej = 'https://www.epa.gov/sites/default/files/2015-02/documents/ips-final-report.pdf';
const waterReport = 'https://www.cdc.gov/drinking-water/about/how-to-read-drinking-water-quality-reports.html';
export const CARDS = [
  { id:'k1', type:'knowledge', topic:'Environmental justice', title:'A fair place to call home', question:'What is the central idea of environmental justice?', options:['Everyone deserves a healthy environment and a voice in decisions.','Every neighborhood must look exactly the same.','Only scientists should make environmental decisions.'], answer:0, explanation:'Environmental justice connects fair protection from environmental harms with meaningful involvement in decisions. Income, race, and where someone lives should not determine whose health matters.', domain:'air', source:ej },
  { id:'k2', type:'knowledge', topic:'Urban heat', title:'The shade makes a difference', question:'Why can a neighborhood with fewer trees get hotter?', options:['Trees prevent all weather changes.','Pavement absorbs heat, and fewer trees means less cooling shade.','Tall buildings always make air cooler.'], answer:1, explanation:'Roads and buildings absorb heat. Trees cool neighborhoods through shade and by releasing water vapor. Unequal tree cover can mean unequal exposure to heat.', domain:'green', source:heat },
  { id:'k3', type:'knowledge', topic:'Clean water', title:'Follow the rain', question:'How can a rain garden help a neighborhood?', options:['It makes rain stop falling.','It replaces the need for drinking-water testing.','It absorbs runoff and helps filter stormwater.'], answer:2, explanation:'Rain gardens use plants and soil to capture rainfall where it lands. They can reduce runoff and filter some pollutants before that water reaches rivers and streams.', domain:'water', source:gi },
  { id:'k4', type:'knowledge', topic:'Community voice', title:'A seat at the table', question:'Which is an example of meaningful community involvement?', options:['Residents help shape a plan before it is approved.','Residents hear about a project after construction.','Only people who own property can speak.'], answer:0, explanation:'Meaningful involvement gives affected residents a real opportunity to influence decisions. Listening early and removing barriers to participation helps communities shape their own future.', domain:'air', source:ej },
  { id:'k5', type:'knowledge', topic:'Green spaces', title:'More than a pretty park', question:'What is one environmental benefit of neighborhood trees?', options:['They make all air pollution disappear.','They provide shade and can help improve local air quality.','They stop every flood.'], answer:1, explanation:'Trees offer shade, capture some air pollutants, and absorb rainwater. Their benefits depend on local conditions, careful planning, and ongoing maintenance.', domain:'green', source:heat },
  { id:'k6', type:'knowledge', topic:'Equity', title:'Different needs. Shared care.', question:'A city has funding for cooling projects. What approach best supports equity?', options:['Spend the same amount on every street, regardless of need.','Fund only the neighborhoods that ask first.','Prioritize places facing the greatest heat and the fewest resources.'], answer:2, explanation:'Equity considers different needs and existing burdens. Directing resources to the people facing the greatest barriers can help close gaps in environmental protection.', domain:'green', source:ej },
  { id:'k7', type:'knowledge', topic:'Stormwater', title:'A street that soaks it in', question:'Why might a community replace some pavement with planted areas?', options:['So more rain can soak into the ground.','To make runoff flow faster into homes.','To eliminate the need for any drainage planning.'], answer:0, explanation:'Planted areas can absorb and slow stormwater. Well-designed green infrastructure works alongside other systems to reduce runoff and improve neighborhood resilience.', domain:'water', source:gi },
  { id:'k8', type:'knowledge', topic:'Environmental burdens', title:'Looking at the whole picture', question:'Why should planners consider multiple pollution sources together?', options:['Only the newest source matters.','People can be exposed to several environmental burdens at once.','All neighborhoods have identical exposures.'], answer:1, explanation:'A community may face traffic pollution, industrial activity, and limited green space at the same time. Considering the whole picture helps decision-makers understand unequal burdens.', domain:'air', source:ej },
  { id:'c1', type:'challenge', topic:'Community planning', title:'Whose park is it, anyway?', question:'The city is planning a new park. Nearby renters have not been included. What would you do first?', options:['Organize an accessible meeting so renters can shape the plan.','Approve the design now and ask for feedback later.','Let only the largest donors decide.'], answer:0, explanation:'Residents who will use a space should help design it. Accessible meetings, language support, and early input can help more neighbors have a say.', domain:'green', source:ej },
  { id:'c2', type:'challenge', topic:'Flood resilience', title:'When the rain comes', question:'One block floods repeatedly. Neighbors want long-term change. Where should the community begin?', options:['Assume every street has the same needs.','Document residents’ experiences and work together on drainage priorities.','Ask each household to solve flooding alone.'], answer:1, explanation:'Community knowledge helps identify where flooding happens and who is affected. Combining that knowledge with technical support can guide fairer infrastructure investments.', domain:'water', source:gi },
  { id:'c3', type:'challenge', topic:'Public participation', title:'The meeting nobody can attend', question:'A hearing about a nearby project is scheduled during working hours. How could participation improve?', options:['Cancel all public discussion.','Count silence as agreement.','Offer multiple meeting times, accessible locations, and ways to comment.'], answer:2, explanation:'Being invited is not the same as being able to participate. Flexible times, accessible spaces, and several ways to provide input reduce barriers to having a voice.', domain:'air', source:ej },
  { id:'c4', type:'challenge', topic:'Heat resilience', title:'A cooler walk to school', question:'Students cross a hot, unshaded street each day. Which proposal addresses the shared problem?', options:['Work with residents and the city to add and maintain shade along the route.','Tell everyone to avoid going outside forever.','Plant trees only in an already shaded park.'], answer:0, explanation:'Shade along everyday walking routes can help reduce heat exposure. Planning with residents helps put cooling projects where people need them.', domain:'green', source:heat },
  { id:'c5', type:'challenge', topic:'Shared resources', title:'A grant, a choice', question:'Your neighborhood receives funding for green infrastructure. What should guide the decision?', options:['Choose the most expensive option automatically.','Combine community priorities, local conditions, and a maintenance plan.','Pick a project without asking residents.'], answer:1, explanation:'Green infrastructure needs to fit a place and its people. Community priorities and long-term care help projects deliver benefits that last.', domain:'water', source:gi },
  { id:'c6', type:'challenge', topic:'Environmental fairness', title:'A new project next door', question:'A new facility is proposed near a neighborhood that already faces heavy traffic. What should the review include?', options:['Only the appearance of the building.','Only benefits to people living far away.','Existing environmental burdens and the voices of affected residents.'], answer:2, explanation:'Fair decisions consider the burdens a community already carries. People who may be affected should have a meaningful role in the review.', domain:'air', source:ej },
  { id:'c7', type:'challenge', topic:'Neighborhood care', title:'Plant today. Care tomorrow.', question:'A tree-planting project is ready to launch. What helps it succeed over time?', options:['Choose suitable trees with residents and plan for watering and maintenance.','Plant any tree and never return.','Measure success only by the launch-day photo.'], answer:0, explanation:'Trees need care and appropriate placement. A maintenance plan and resident participation help trees thrive and provide lasting neighborhood benefits.', domain:'green', source:heat },
  { id:'c8', type:'challenge', topic:'Accessible information', title:'Information everyone can use', question:'A city shares a technical report in only one language. How could your group help?', options:['Keep the report within a small committee.','Advocate for plain-language summaries and translations.','Assume everyone understands the technical terms.'], answer:1, explanation:'Useful information must be accessible. Clear language, translations, and accessible formats help more people participate in decisions affecting their neighborhood.', domain:'air', source:ej },
  { id:'a1', type:'action', topic:'Collective action', title:'Small garden. Shared impact.', question:'Your block is creating a rain garden. How would you make the project a community effort?', options:['Invite neighbors to help choose the location and plan its care.','Choose the location without asking anyone.','Rely on one volunteer for every task.'], answer:0, explanation:'A shared plan can spread the work and reflect local priorities. Rain gardens can reduce runoff, while collaboration helps the project last.', domain:'water', source:gi },
  { id:'a2', type:'action', topic:'Community voice', title:'Our neighborhood, our say', question:'Your group wants a more inclusive planning process. What is a useful action?', options:['Speak for residents without listening.','Gather residents’ priorities and present them together at a public meeting.','Wait until the final decision to start talking.'], answer:1, explanation:'Listening, organizing, and sharing collective priorities can help residents influence decisions. Community members bring expertise about their own everyday experiences.', domain:'air', source:ej },
  { id:'a3', type:'action', topic:'Cooling together', title:'Grow the canopy', question:'Which tree project best serves neighbors facing the most heat?', options:['Add trees only to streets with many mature trees.','Plant without planning for care.','Work with residents to plant and maintain trees on unshaded streets.'], answer:2, explanation:'Putting trees where shade is scarce can help address unequal heat exposure. Resident input and ongoing care are essential parts of the work.', domain:'green', source:heat },
  { id:'a4', type:'action', topic:'Learning together', title:'Turn knowledge into a toolkit', question:'Your class learned about environmental justice. How could you share what you learned?', options:['Create an accessible guide with local voices and opportunities to participate.','Use technical jargon without explaining it.','Share information only with people already involved.'], answer:0, explanation:'Clear, accessible education helps more people understand local issues. Including community perspectives connects learning with meaningful participation.', domain:'air', source:ej },
  { id:'a5', type:'action', topic:'Water stewardship', title:'A map made by neighbors', question:'Your group is mapping places where rainwater collects. What makes the map more useful?', options:['Record only streets you personally visit.','Invite residents from different parts of the neighborhood to contribute.','Leave out areas with the most flooding.'], answer:1, explanation:'Residents see things that broad maps may miss. Including many experiences can help identify needs and guide conversations about green infrastructure.', domain:'water', source:gi },
  { id:'a6', type:'action', topic:'Lasting change', title:'Keep the good growing', question:'The community has a new green space. What is a helpful next step?', options:['Stop checking whether people can use it.','Close it to everyone who did not volunteer.','Agree on shared care and regularly ask residents what is working.'], answer:2, explanation:'Environmental projects benefit from ongoing care and feedback. A space should remain welcoming, useful, and responsive to the people it serves.', domain:'green', source:gi },
  { id:'a7', type:'action', topic:'Collaboration', title:'Better, together', question:'Neighbors, students, and local planners are tackling runoff. What can each group bring?', options:['Different kinds of knowledge that strengthen a shared plan.','Exactly the same experience and priorities.','A reason to exclude everyone else.'], answer:0, explanation:'Community experience and technical knowledge can complement each other. Collaboration helps create solutions that fit both the place and the people.', domain:'water', source:gi },
  { id:'a8', type:'action', topic:'Shared learning', title:'Listen, then lead', question:'You want to help a neighborhood affected by pollution. What is a thoughtful first step?', options:['Arrive with a complete plan and refuse changes.','Listen to residents and support the priorities they identify.','Assume the community has no expertise.'], answer:1, explanation:'People living with environmental challenges have valuable expertise. Supporting community-led priorities respects that knowledge and strengthens collective action.', domain:'air', source:ej },
  { id:'k9', type:'knowledge', topic:'Drinking-water contamination', title:'What’s in the water?', question:'What can a community drinking-water quality report help residents understand?', options:['Which contaminants were tested for and whether standards were exceeded.','The safety of every private well in the country.','Whether a river is safe to swim in.'], answer:0, explanation:'Community water reports describe tested contaminants, detected levels, and violations. Accessible results help residents ask informed questions about their water supply.', domain:'water', source:waterReport },
  { id:'c9', type:'challenge', topic:'Clean water & accountability', title:'A report raises questions', question:'A drinking-water report lists a violation. Neighbors are concerned. What supports an informed community response?', options:['Assume the report applies to every water supply.','Ask the water utility and local health officials to explain the results and response.','Share a rumor before checking the report.'], answer:1, explanation:'Reports include information about violations and follow-up. Questions about a particular supply belong with the water utility or local health department, alongside current official notices.', domain:'water', source:waterReport },
  { id:'a9', type:'action', topic:'Water information for everyone', title:'Clear information. Shared confidence.', question:'Your class wants to help neighbors understand their drinking-water report. What could you do?', options:['Remove information about violations to avoid questions.','Offer treatment advice without qualified guidance.','Help residents find the report and gather questions for the water provider.'], answer:2, explanation:'Helping people locate reports and prepare questions supports informed participation. Water providers and public health officials can explain local results and guidance.', domain:'water', source:waterReport }
];
export function categoryAt(position) { return ['knowledge', 'action', 'knowledge', 'challenge', 'action', 'challenge'][position % 6]; }
export function makePlayer(name, character, id = crypto.randomUUID()) {
  if (!CHARACTERS.some(c => c.id === character)) throw new Error('Choose a character.');
  name = String(name || '').trim().replace(/[<>\x00-\x1f]/g, '').slice(0, 24);
  if (!name) throw new Error('Enter your name.');
  return { id, name, character, position:0, points:0, answered:0, correct:0 };
}
export function newGame(players, mode = 'local') {
  return { version:1, mode, status:mode === 'online' ? 'lobby' : 'playing', players, host:players[0]?.id, turn:0, round:1, phase:'spin', lastSpin:null, card:null, feedback:null, drawn:[], community:0, health:{air:20,water:20,green:20}, history:[{text:'A new chapter starts here. Your community is ready.',type:'start'}], revision:0 };
}
export function randomInt(max) {
  const data = new Uint32Array(1); const limit = 4294967296 - 4294967296 % max;
  do { crypto.getRandomValues(data); } while(data[0] >= limit);
  return data[0] % max;
}
export function activePlayer(game) { return game.players[game.turn]; }
export function takeAction(original, playerId, action, data = {}, rng = randomInt) {
  const game = structuredClone(original);
  const player = game.players.find(p => p.id === playerId);
  if (!player) throw new Error('You are not a player in this game.');
  if (action === 'start') {
    if (game.host !== playerId) throw new Error('Only the host can start the game.');
    if (game.status !== 'lobby' || game.players.length < 2) throw new Error('At least two players are needed.');
    game.status = 'playing';
  } else {
    if (game.status !== 'playing') throw new Error('This game is not in progress.');
    if (activePlayer(game)?.id !== playerId) throw new Error('It is another player’s turn.');
    if (action === 'spin') {
      if (game.phase !== 'spin') throw new Error('Finish your current turn first.');
      const roll = rng(10) + 1;
      player.position = Math.min(FINISH, player.position + roll);
      game.lastSpin = roll;
      if (player.position === FINISH) {
        game.phase = 'feedback';
        game.card = null;
        game.feedback = { finished:true, points:0, explanation:'You made it to Common Ground! Cheer on your neighbors as they make their way here.' };
        log(game, player.name + ' reached Common Ground.', 'finish');
      } else {
        const type = categoryAt(player.position);
        let available = CARDS.filter(c => c.type === type && !game.drawn.includes(c.id));
        if (!available.length) {
          game.drawn = game.drawn.filter(id => !CARDS.some(c => c.type === type && c.id === id));
          available = CARDS.filter(c => c.type === type);
        }
        const card = available[rng(available.length)];
        game.drawn.push(card.id); game.card = card.id; game.phase = 'card'; game.feedback = null;
        log(game, player.name + ' moved ' + roll + ' spaces to ' + CATEGORIES[type].name.toLowerCase() + '.', type);
      }
    } else if (action === 'answer') {
      if (game.phase !== 'card') throw new Error('There is no question to answer.');
      const card = CARDS.find(c => c.id === game.card);
      if (!Number.isInteger(data.answer) || data.answer < 0 || data.answer >= card.options.length) throw new Error('Choose an answer.');
      const correct = data.answer === card.answer;
      const points = correct ? ({knowledge:5,challenge:8,action:10}[card.type]) : 2;
      player.points += points; player.answered++; player.correct += Number(correct);
      game.community += points;
      game.health[card.domain] = Math.min(100, game.health[card.domain] + (correct ? 9 : 3));
      game.feedback = { correct, selected:data.answer, points, explanation:card.explanation };
      game.phase = 'feedback';
      log(game, player.name + ' contributed ' + points + ' community points.', card.type);
    } else if (action === 'next') {
      if (game.phase !== 'feedback') throw new Error('Complete your card before continuing.');
      if (game.players.every(p => p.position === FINISH)) {
        game.status = 'complete';
        log(game, 'Everyone reached Common Ground. Look what you built together.', 'finish');
      } else {
        const before = game.turn;
        do { game.turn = (game.turn + 1) % game.players.length; } while(game.players[game.turn].position === FINISH);
        if (game.turn <= before) game.round++;
        game.phase = 'spin'; game.card = null; game.feedback = null;
      }
    } else throw new Error('Unknown game action.');
  }
  game.revision++;
  return game;
}
export function log(game, text, type) { game.history.unshift({text,type}); game.history = game.history.slice(0,80); }

import React, { useCallback, useMemo, useState } from 'react';
import {
  GAME_CONFIG,
  GYM_LEADERS,
  ITEMS,
  MOVES,
  POKEMON_SPECIES,
  applyLevelUp,
  calculateDamage,
  calculateXpGain,
  checkLevelUp,
  generateRandomPokemon,
  getRandomMove,
  getTypeEffectiveness,
  initializePokemon,
  selectRandomItems,
} from './game-data';

const STARTERS = ['bulbasaur', 'charmander', 'squirtle', 'pikachu', 'eevee', 'riolu'];
const FALLBACK_STARTERS = ['bulbasaur', 'charmander', 'squirtle'];

const TYPE_COLORS = {
  normal: '#8b8f98',
  fire: '#ef6f3e',
  water: '#3f8cff',
  electric: '#f3bd2f',
  grass: '#43ad67',
  ice: '#66c7d7',
  fighting: '#c35a4a',
  poison: '#a865c9',
  ground: '#c99c55',
  flying: '#7aa0e8',
  psychic: '#ee6294',
  bug: '#92a83a',
  rock: '#a89058',
  ghost: '#6861a8',
  dragon: '#5d73d8',
  dark: '#5e5560',
  steel: '#8ba1b4',
  fairy: '#df83c6',
};

const REWARD_LIBRARY = [
  {
    id: 'campfire',
    name: 'Campfire Rest',
    description: 'Restore 45% of max HP before the next fight.',
    kind: 'heal',
  },
  {
    id: 'training',
    name: 'Clean Rep',
    description: 'Gain one level and refill HP.',
    kind: 'level',
  },
  {
    id: 'focus',
    name: 'Focus Lens',
    description: 'Permanent 10% boost to attack and special attack.',
    kind: 'stats',
  },
  {
    id: 'guard',
    name: 'Guard Notes',
    description: 'Permanent 12% boost to defense and special defense.',
    kind: 'guard',
  },
  {
    id: 'snack',
    name: 'Pocket Snack',
    description: 'Heal to full now.',
    kind: 'full-heal',
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function sanitizeSpeciesName(species = '') {
  return species.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSpriteUrl(pokemon, back = false) {
  if (!pokemon?.name) return '';
  const suffix = back ? '-b' : '';
  return `${process.env.PUBLIC_URL}/assets/Sprites/pokemon/${sanitizeSpeciesName(pokemon.name)}${suffix}.gif`;
}

function parseLegacyFlashcards(text = '') {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const divider = line.includes('::') ? '::' : line.includes('|') ? '|' : null;
      if (!divider) return null;
      const [front, back] = line.split(divider).map((part) => part.trim());
      if (!front || !back) return null;
      return { id: `legacy-${index}-${front}`, front, back };
    })
    .filter(Boolean);
}

function flattenFlashcards(studyZoneState) {
  const deckValues = Object.values(studyZoneState?.cardData || {});
  const deckCards = deckValues.flatMap((value) => (Array.isArray(value) ? value : []));
  const legacyCards = parseLegacyFlashcards(studyZoneState?.flashcardsText);

  return [...deckCards, ...legacyCards]
    .map((card, index) => ({
      id: card.id || `${card.front || 'card'}-${index}`,
      front: String(card.front || '').trim(),
      back: String(card.back || '').trim(),
    }))
    .filter((card) => card.front && card.back);
}

function makeQuestion(cards) {
  if (!cards.length) return null;

  const card = cards[Math.floor(Math.random() * cards.length)];
  const wrongAnswers = shuffle(
    cards
      .filter((candidate) => candidate.back !== card.back)
      .map((candidate) => candidate.back)
      .filter((answer, index, answers) => answers.indexOf(answer) === index)
  ).slice(0, 3);

  return {
    card,
    choices: shuffle([card.back, ...wrongAnswers]),
  };
}

function makePokemon(speciesId, level) {
  const pokemon = initializePokemon(speciesId, level);
  if (!pokemon) return generateRandomPokemon(level, level + 1);
  return pokemon;
}

function makeEnemy(wave) {
  const isBoss = wave > 0 && wave % GAME_CONFIG.WAVES_PER_GYM_LEADER === 0;

  if (isBoss) {
    const leader = GYM_LEADERS[((wave / GAME_CONFIG.WAVES_PER_GYM_LEADER) - 1) % GYM_LEADERS.length];
    const speciesId = leader.pokemon.find((id) => POKEMON_SPECIES[id]) || 'rhydon';
    const boss = makePokemon(speciesId, Math.max(leader.level, 7 + wave));
    return {
      ...boss,
      name: `${leader.name}'s ${boss.name}`,
      leaderName: leader.name,
      isBoss: true,
    };
  }

  return generateRandomPokemon(4 + wave, 7 + wave);
}

function getStarterOptions() {
  const available = STARTERS.filter((id) => POKEMON_SPECIES[id]);
  return available.length >= 3 ? available : FALLBACK_STARTERS;
}

function formatEffectiveness(multiplier) {
  if (multiplier >= 2) return 'Super effective';
  if (multiplier <= 0.5) return 'Resisted';
  return 'Solid hit';
}

function addLog(existing, entry) {
  return [entry, ...existing].slice(0, 6);
}

function typeStyle(type) {
  return {
    backgroundColor: TYPE_COLORS[type] || TYPE_COLORS.normal,
    color: type === 'electric' ? '#1f2937' : '#ffffff',
  };
}

const HealthBar = ({ current, max }) => {
  const percent = max > 0 ? clamp((current / max) * 100, 0, 100) : 0;
  const color = percent > 55 ? '#22c55e' : percent > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950/70 ring-1 ring-white/10">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
};

const TypePills = ({ types = [] }) => (
  <div className="flex flex-wrap gap-1.5">
    {types.map((type) => (
      <span
        key={type}
        className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
        style={typeStyle(type)}
      >
        {type}
      </span>
    ))}
  </div>
);

const PokemonPanel = ({ pokemon, side, active }) => {
  if (!pokemon) return null;
  const isPlayer = side === 'player';

  return (
    <section
      className={`relative min-h-[260px] overflow-hidden rounded-lg border bg-slate-950/55 p-4 shadow-xl ${
        active ? 'border-cyan-300/70 shadow-cyan-950/40' : 'border-white/10'
      }`}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {isPlayer ? 'Your partner' : pokemon.isBoss ? 'Boss wave' : 'Encounter'}
          </div>
          <h3 className="mt-1 text-xl font-black text-white">{pokemon.name}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <span>Lv. {pokemon.level}</span>
            <span className="text-slate-600">/</span>
            <span>{pokemon.currentHp}/{pokemon.maxHp} HP</span>
          </div>
        </div>
        <TypePills types={pokemon.type} />
      </div>

      <div className="relative z-10 mt-4">
        <HealthBar current={pokemon.currentHp} max={pokemon.maxHp} />
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 top-24 flex items-end justify-center rounded bg-gradient-to-t from-slate-900/70 to-slate-900/10">
        <div className="absolute bottom-4 h-10 w-44 rounded-[50%] bg-black/35 blur-sm" />
        <img
          src={getSpriteUrl(pokemon, isPlayer)}
          alt=""
          className={`relative z-10 max-h-40 max-w-[70%] object-contain drop-shadow-2xl ${
            isPlayer ? 'scale-[1.35]' : 'scale-[1.2]'
          }`}
          style={{ imageRendering: 'pixelated' }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </section>
  );
};

const MoveButton = ({ move, disabled, onClick }) => {
  if (!move) return null;

  const isStatus = move.category === 'status';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group min-h-[92px] rounded-lg border border-white/10 bg-slate-950/65 p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-black text-white">{move.name}</span>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
          style={typeStyle(move.type)}
        >
          {move.type}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <span>Power: {isStatus ? 'Utility' : move.power}</span>
        <span>Accuracy: {move.accuracy || 100}</span>
      </div>
    </button>
  );
};

const RewardButton = ({ reward, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-lg border border-white/10 bg-slate-950/75 p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-slate-900"
  >
    <div className="text-base font-black text-white">{reward.name}</div>
    <p className="mt-2 text-sm leading-6 text-slate-300">{reward.description}</p>
  </button>
);

const EmptyState = ({ cardCount }) => (
  <div className="rounded-lg border border-amber-300/30 bg-amber-950/20 p-6 text-center">
    <h3 className="text-2xl font-black text-white">Flashcard Rogue needs a deck</h3>
    <p className="mx-auto mt-3 max-w-2xl text-slate-300">
      Add cards in the Flashcard Deck tab, then come back here. Rogue uses your
      card fronts as prompts and card backs as answers.
    </p>
    <div className="mt-5 inline-flex rounded bg-slate-950/70 px-4 py-2 text-sm font-bold text-amber-200">
      Cards ready: {cardCount}
    </div>
  </div>
);

const RunSummary = ({ run, onRestart }) => (
  <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6 text-center">
    <div className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Run complete</div>
    <h3 className="mt-2 text-3xl font-black text-white">Score {run.score}</h3>
    <p className="mt-3 text-slate-300">
      You cleared {Math.max(0, run.wave - 1)} wave{run.wave === 2 ? '' : 's'} and answered
      {run.correctAnswers}/{Math.max(1, run.totalAnswers)} questions correctly.
    </p>
    <button
      type="button"
      onClick={onRestart}
      className="mt-6 rounded-lg bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
    >
      Start a new run
    </button>
  </div>
);

const FlashcardRogue = ({ studyZoneState = {} }) => {
  const cards = useMemo(() => flattenFlashcards(studyZoneState), [studyZoneState]);
  const starterOptions = useMemo(getStarterOptions, []);
  const [screen, setScreen] = useState('menu');
  const [run, setRun] = useState({
    wave: 1,
    score: 0,
    player: null,
    enemy: null,
    log: [],
    pendingMove: null,
    question: null,
    answering: false,
    rewardOptions: [],
    correctAnswers: 0,
    totalAnswers: 0,
    streak: 0,
  });

  const startRun = useCallback((starterId) => {
    const player = makePokemon(starterId, 5);
    const enemy = makeEnemy(1);

    setRun({
      wave: 1,
      score: 0,
      player,
      enemy,
      log: [`${player.name} stepped into the first room.`],
      pendingMove: null,
      question: null,
      answering: false,
      rewardOptions: [],
      correctAnswers: 0,
      totalAnswers: 0,
      streak: 0,
    });
    setScreen('battle');
  }, []);

  const restartToMenu = useCallback(() => {
    setScreen('menu');
    setRun((previous) => ({
      ...previous,
      pendingMove: null,
      question: null,
      answering: false,
      rewardOptions: [],
    }));
  }, []);

  const selectMove = useCallback((moveId) => {
    const move = MOVES[moveId];
    const question = makeQuestion(cards);

    if (!move || !question) return;

    setRun((previous) => ({
      ...previous,
      pendingMove: move,
      question,
      answering: true,
      log: addLog(previous.log, `Answer to use ${move.name}.`),
    }));
  }, [cards]);

  const finishVictory = useCallback((baseRun, defeatedEnemy) => {
    const player = { ...baseRun.player };
    const xpGain = calculateXpGain(defeatedEnemy);
    player.exp += xpGain;

    const levelData = checkLevelUp(player);
    const log = addLog(
      baseRun.log,
      `${defeatedEnemy.name} fell. ${player.name} gained ${xpGain} XP.`
    );

    if (levelData.leveled) {
      applyLevelUp(player, levelData.newLevel);
      log.unshift(`${player.name} reached level ${levelData.newLevel}.`);
    }

    const itemRewardIds = selectRandomItems(1);
    const itemReward = itemRewardIds[0] && ITEMS[itemRewardIds[0]]
      ? {
          id: `item-${itemRewardIds[0]}`,
          name: ITEMS[itemRewardIds[0]].name,
          description: ITEMS[itemRewardIds[0]].description,
          kind: 'item',
          itemId: itemRewardIds[0],
        }
      : null;

    setRun({
      ...baseRun,
      player,
      score: baseRun.score + defeatedEnemy.level * (defeatedEnemy.isBoss ? 60 : 25),
      pendingMove: null,
      question: null,
      answering: false,
      rewardOptions: shuffle([...REWARD_LIBRARY, itemReward].filter(Boolean)).slice(0, 3),
      log,
    });
    setScreen('reward');
  }, []);

  const enemyTurn = useCallback((baseRun, playerAfterAttack, enemyAfterAttack, log) => {
    if (enemyAfterAttack.currentHp <= 0) {
      finishVictory({ ...baseRun, player: playerAfterAttack, enemy: enemyAfterAttack, log }, enemyAfterAttack);
      return;
    }

    const enemyMove = getRandomMove(enemyAfterAttack) || MOVES.tackle;
    const effectiveness = getTypeEffectiveness(enemyMove.type, playerAfterAttack.type);
    const incoming = calculateDamage(enemyAfterAttack, playerAfterAttack, enemyMove, effectiveness, false);
    const player = {
      ...playerAfterAttack,
      currentHp: clamp(playerAfterAttack.currentHp - incoming, 0, playerAfterAttack.maxHp),
    };
    const nextLog = addLog(
      log,
      `${enemyAfterAttack.name} used ${enemyMove.name} for ${incoming} damage.`
    );

    if (player.currentHp <= 0) {
      setRun({
        ...baseRun,
        player,
        enemy: enemyAfterAttack,
        pendingMove: null,
        question: null,
        answering: false,
        log: addLog(nextLog, `${player.name} fainted.`),
      });
      setScreen('gameover');
      return;
    }

    setRun({
      ...baseRun,
      player,
      enemy: enemyAfterAttack,
      pendingMove: null,
      question: null,
      answering: false,
      log: nextLog,
    });
  }, [finishVictory]);

  const answerQuestion = useCallback((choice) => {
    if (!run.answering || !run.pendingMove || !run.question) return;

    const isCorrect = choice === run.question.card.back;
    const player = { ...run.player };
    const enemy = { ...run.enemy };
    const move = run.pendingMove;
    let log = run.log;

    if (isCorrect) {
      if (move.effect === 'heal') {
        const healed = Math.ceil(player.maxHp * (move.healAmount || 0.35));
        player.currentHp = clamp(player.currentHp + healed, 0, player.maxHp);
        log = addLog(log, `${player.name} used ${move.name} and healed ${healed} HP.`);
      } else if (move.category === 'status') {
        player.stats = {
          ...player.stats,
          atk: Math.ceil(player.stats.atk * 1.06),
          spa: Math.ceil(player.stats.spa * 1.06),
        };
        log = addLog(log, `${move.name} sharpened your next attacks.`);
      } else {
        const effectiveness = getTypeEffectiveness(move.type, enemy.type);
        const damage = calculateDamage(player, enemy, move, effectiveness, true);
        enemy.currentHp = clamp(enemy.currentHp - damage, 0, enemy.maxHp);
        log = addLog(log, `${move.name}: ${damage} damage. ${formatEffectiveness(effectiveness)}.`);
      }
    } else {
      log = addLog(log, `Missed recall. The answer was "${run.question.card.back}".`);
    }

    const baseRun = {
      ...run,
      player,
      enemy,
      log,
      totalAnswers: run.totalAnswers + 1,
      correctAnswers: run.correctAnswers + (isCorrect ? 1 : 0),
      streak: isCorrect ? run.streak + 1 : 0,
    };

    enemyTurn(baseRun, player, enemy, log);
  }, [enemyTurn, run]);

  const chooseReward = useCallback((reward) => {
    const nextWave = run.wave + 1;
    const player = {
      ...run.player,
      stats: { ...run.player.stats },
    };
    let log = run.log;

    if (reward.kind === 'heal') {
      const healed = Math.ceil(player.maxHp * 0.45);
      player.currentHp = clamp(player.currentHp + healed, 0, player.maxHp);
      log = addLog(log, `${reward.name}: restored ${healed} HP.`);
    } else if (reward.kind === 'level') {
      applyLevelUp(player, player.level + 1);
      log = addLog(log, `${reward.name}: ${player.name} reached level ${player.level}.`);
    } else if (reward.kind === 'stats') {
      player.stats.atk = Math.ceil(player.stats.atk * 1.1);
      player.stats.spa = Math.ceil(player.stats.spa * 1.1);
      log = addLog(log, `${reward.name}: attack stats increased.`);
    } else if (reward.kind === 'guard') {
      player.stats.def = Math.ceil(player.stats.def * 1.12);
      player.stats.spd = Math.ceil(player.stats.spd * 1.12);
      log = addLog(log, `${reward.name}: defenses increased.`);
    } else if (reward.kind === 'full-heal') {
      player.currentHp = player.maxHp;
      log = addLog(log, `${reward.name}: fully restored.`);
    } else if (reward.kind === 'item') {
      player.heldItem = reward.itemId;
      log = addLog(log, `${player.name} equipped ${reward.name}.`);
    }

    const enemy = makeEnemy(nextWave);
    setRun({
      ...run,
      wave: nextWave,
      player,
      enemy,
      pendingMove: null,
      question: null,
      answering: false,
      rewardOptions: [],
      log: addLog(log, `Wave ${nextWave}: ${enemy.name} appeared.`),
    });
    setScreen('battle');
  }, [run]);

  const accuracy = run.totalAnswers ? Math.round((run.correctAnswers / run.totalAnswers) * 100) : 0;
  const playerMoves = run.player?.moves?.map((moveId) => MOVES[moveId]).filter(Boolean) || [];
  const hasCards = cards.length > 0;

  return (
    <div className="flashcard-rogue relative isolate w-full overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950 text-slate-100 shadow-2xl">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 25% 15%, rgba(34,211,238,0.18), transparent 28%), radial-gradient(circle at 78% 22%, rgba(245,158,11,0.14), transparent 26%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.98))',
        }}
      />
      <div className="relative p-4 sm:p-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Flashcard Rogue</p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Recall-powered dungeon battles</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs sm:min-w-[420px]">
            <div className="rounded bg-slate-900/80 p-3">
              <div className="text-slate-400">Cards</div>
              <div className="text-lg font-black text-white">{cards.length}</div>
            </div>
            <div className="rounded bg-slate-900/80 p-3">
              <div className="text-slate-400">Wave</div>
              <div className="text-lg font-black text-white">{run.wave}</div>
            </div>
            <div className="rounded bg-slate-900/80 p-3">
              <div className="text-slate-400">Score</div>
              <div className="text-lg font-black text-white">{run.score}</div>
            </div>
            <div className="rounded bg-slate-900/80 p-3">
              <div className="text-slate-400">Recall</div>
              <div className="text-lg font-black text-white">{accuracy}%</div>
            </div>
          </div>
        </header>

        <main className="mt-6">
          {!hasCards && <EmptyState cardCount={cards.length} />}

          {hasCards && screen === 'menu' && (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
                <h3 className="text-xl font-black text-white">Pick a starter</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Every attack asks a card. Correct answers land harder, wrong answers
                  give the enemy a turn. Bosses appear every five waves.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {starterOptions.map((id) => {
                    const starter = makePokemon(id, 5);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => startRun(id)}
                        className="rounded-lg border border-white/10 bg-slate-950/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getSpriteUrl(starter)}
                            alt=""
                            className="h-14 w-14 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div>
                            <div className="font-black text-white">{starter.name}</div>
                            <TypePills types={starter.type} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
                <h3 className="text-xl font-black text-white">Run loop</h3>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  {[
                    ['Answer', 'Use card recall to activate moves.'],
                    ['Fight', 'Moves use type matchups and your current stats.'],
                    ['Draft', 'Choose a reward after each clear.'],
                    ['Scale', 'Boss waves test whether your deck knowledge holds.'],
                  ].map(([label, text]) => (
                    <div key={label} className="rounded border border-white/10 bg-slate-950/55 p-3">
                      <div className="font-black text-cyan-200">{label}</div>
                      <div className="mt-1">{text}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {hasCards && screen === 'battle' && run.player && run.enemy && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <PokemonPanel pokemon={run.player} side="player" active={!run.answering} />
                  <PokemonPanel pokemon={run.enemy} side="enemy" active={run.answering} />
                </div>

                <section className="rounded-lg border border-white/10 bg-slate-900/65 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-white">Moves</h3>
                    <div className="text-sm text-slate-400">
                      Streak: <span className="font-black text-cyan-200">{run.streak}</span>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {playerMoves.map((move) => (
                      <MoveButton
                        key={move.id}
                        move={move}
                        disabled={run.answering}
                        onClick={() => selectMove(move.id)}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-5">
                <section className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                  <h3 className="text-lg font-black text-white">Question</h3>
                  {run.answering && run.question ? (
                    <div className="mt-4">
                      <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-4 text-lg font-black leading-7 text-white">
                        {run.question.card.front}
                      </div>
                      <div className="mt-4 grid gap-2">
                        {run.question.choices.map((choice, index) => (
                          <button
                            key={`${choice}-${index}`}
                            type="button"
                            onClick={() => answerQuestion(choice)}
                            className="rounded-lg border border-white/10 bg-slate-950/75 px-4 py-3 text-left text-sm font-bold text-white transition hover:border-cyan-300/70 hover:bg-slate-900"
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Choose a move to draw a card. The better your recall, the longer
                      the run survives.
                    </p>
                  )}
                </section>

                <section className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                  <h3 className="text-lg font-black text-white">Battle log</h3>
                  <div className="mt-3 space-y-2">
                    {run.log.map((entry, index) => (
                      <div key={`${entry}-${index}`} className="rounded bg-slate-950/55 px-3 py-2 text-sm text-slate-300">
                        {entry}
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          )}

          {hasCards && screen === 'reward' && (
            <section className="rounded-lg border border-amber-300/30 bg-amber-950/15 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Room cleared</p>
                  <h3 className="mt-1 text-2xl font-black text-white">Choose one reward</h3>
                </div>
                <div className="text-sm text-slate-300">Next wave: {run.wave + 1}</div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {run.rewardOptions.map((reward) => (
                  <RewardButton key={reward.id} reward={reward} onClick={() => chooseReward(reward)} />
                ))}
              </div>
            </section>
          )}

          {hasCards && screen === 'gameover' && (
            <RunSummary run={run} onRestart={restartToMenu} />
          )}
        </main>
      </div>
    </div>
  );
};

export default FlashcardRogue;

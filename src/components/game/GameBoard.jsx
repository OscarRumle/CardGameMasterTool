import { useState, useEffect } from 'react';
import { endTurn, playCard, useHeroPower, useHeroAttack, declareAttackers, resolveCombat } from '../../utils/gameEngine';
import { aiTakeTurn } from '../../utils/simpleAI';

function GameBoard({ gameState, onStateChange, onGameOver }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAttackers, setSelectedAttackers] = useState([]);

  const playerState = gameState.player;
  const aiState = gameState.ai;
  const isPlayerTurn = gameState.currentPlayer === 'player';

  // AI takes turn automatically when it's AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !gameState.gameOver) {
      // Add a small delay so the user can see the turn change
      const timer = setTimeout(() => {
        console.log('AI is thinking...');
        const newState = aiTakeTurn(gameState);
        onStateChange(newState);

        // Check for game over
        if (newState.gameOver) {
          onGameOver();
        }
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, onStateChange, onGameOver]);

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handlePlayCard = (card) => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = playCard(gameState, 'player', card);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
      setSelectedCard(null);
    }
  };

  const handleHeroPower = () => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = useHeroPower(gameState, 'player');

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
    }
  };

  const handleHeroAttack = () => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = useHeroAttack(gameState, 'player');

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);

      // Check for game over
      if (result.state.gameOver) {
        onGameOver();
      }
    }
  };

  const handleEndTurn = () => {
    const newState = endTurn(gameState);
    onStateChange(newState);
  };

  const handleToggleAttacker = (minionId) => {
    if (!isPlayerTurn || gameState.combat.active) return;

    setSelectedAttackers(prev => {
      if (prev.includes(minionId)) {
        return prev.filter(id => id !== minionId);
      } else {
        return [...prev, minionId];
      }
    });
  };

  const handleDeclareAttack = () => {
    if (selectedAttackers.length === 0) {
      showError('Select at least one minion to attack');
      return;
    }

    const result = declareAttackers(gameState, 'player', selectedAttackers);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
      setSelectedAttackers([]);
    }
  };

  const handleResolveCombat = () => {
    const result = resolveCombat(gameState);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);

      // Check for game over
      if (result.state.gameOver) {
        onGameOver();
      }
    }
  };

  return (
    <div className="w-full h-screen flex bg-gradient-to-b from-zinc-900 to-black overflow-hidden">
      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-pulse">
          {errorMessage}
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Section - AI/Opponent */}
        <div className="border-b-2 border-zinc-700 bg-zinc-900/50 p-4">
          <div className="max-w-7xl mx-auto">
            <OpponentArea state={aiState} />
          </div>
        </div>

        {/* Middle Section - Shop */}
        <div className="border-b-2 border-amber-600/30 bg-gradient-to-r from-amber-900/10 to-orange-900/10 p-3">
          <div className="max-w-7xl mx-auto">
            <ShopArea shop={gameState.shop} roundNumber={gameState.roundNumber} />
          </div>
        </div>

        {/* Bottom Section - Player */}
        <div className="flex-1 bg-zinc-900/50 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <PlayerArea
              state={playerState}
              isPlayerTurn={isPlayerTurn}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              onPlayCard={handlePlayCard}
              onHeroPower={handleHeroPower}
              onHeroAttack={handleHeroAttack}
              selectedAttackers={selectedAttackers}
              onToggleAttacker={handleToggleAttacker}
              combatActive={gameState.combat.active}
            />
          </div>
        </div>

        {/* Turn Control */}
        <div className="border-t-2 border-zinc-700 bg-zinc-950 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="text-amber-500 font-bold">
                ROUND {gameState.roundNumber} | TURN {gameState.turnNumber}
              </div>
              <div className={`font-bold ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
                {isPlayerTurn ? '● YOUR TURN' : '○ AI TURN'}
              </div>
              <div className="text-zinc-400">
                Phase: <span className="text-white uppercase">{gameState.phase}</span>
              </div>
              {gameState.combat.active && (
                <div className="text-red-500 font-bold animate-pulse">
                  ⚔️ COMBAT ACTIVE
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {gameState.combat.active && isPlayerTurn && (
                <button
                  onClick={handleResolveCombat}
                  className="px-6 py-3 font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 hover:scale-105 transition-all"
                >
                  RESOLVE COMBAT
                </button>
              )}

              {!gameState.combat.active && isPlayerTurn && selectedAttackers.length > 0 && (
                <button
                  onClick={handleDeclareAttack}
                  className="px-6 py-3 font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-500 hover:scale-105 transition-all"
                >
                  ATTACK ({selectedAttackers.length})
                </button>
              )}

              <button
                onClick={handleEndTurn}
                disabled={!isPlayerTurn || gameState.combat.active}
                className={`px-8 py-3 font-bold rounded-lg transition-all
                  ${isPlayerTurn && !gameState.combat.active
                    ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }`}
              >
                END TURN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Action Log */}
      <div className="w-80 border-l-2 border-zinc-700 bg-zinc-950 flex flex-col">
        <ActionLog log={gameState.actionLog} />
      </div>
    </div>
  );
}

// Opponent Area Component
function OpponentArea({ state }) {
  return (
    <div className="space-y-3">
      {/* AI Hero Info */}
      <div className="flex items-center justify-between bg-red-900/20 border-2 border-red-800 rounded-lg p-3">
        <div>
          <div className="text-red-400 font-bold text-lg">{state.hero.name} (AI)</div>
          <div className="text-sm text-zinc-400">
            Cards in hand: {state.zones.hand.length} | Deck: {state.zones.deck.length}
          </div>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-xs text-zinc-400">Health</div>
            <div className="text-xl font-bold text-red-400">
              {state.hero.currentHealth}/{state.hero.maxHealth}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Mana</div>
            <div className="text-xl font-bold text-blue-400">
              {state.hero.currentMana}/{state.hero.maxMana}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Gold</div>
            <div className="text-xl font-bold text-amber-400">{state.hero.gold}</div>
          </div>
        </div>
      </div>

      {/* AI Battlefield */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 min-h-[120px]">
        <div className="text-xs text-zinc-500 mb-2">OPPONENT BATTLEFIELD</div>
        <div className="flex gap-2 flex-wrap">
          {state.zones.battlefield.length === 0 ? (
            <div className="text-zinc-600 text-sm italic">No minions</div>
          ) : (
            state.zones.battlefield.map((minion) => (
              <MinionCard key={minion.instanceId} minion={minion} isOpponent={true} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Player Area Component
function PlayerArea({ state, isPlayerTurn, selectedCard, onSelectCard, onPlayCard, onHeroPower, onHeroAttack, selectedAttackers, onToggleAttacker, combatActive }) {
  return (
    <div className="space-y-3">
      {/* Player Battlefield */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 min-h-[120px]">
        <div className="text-xs text-zinc-500 mb-2">
          YOUR BATTLEFIELD
          {!combatActive && isPlayerTurn && state.zones.battlefield.length > 0 && (
            <span className="ml-2 text-amber-500">(Click minions to select attackers)</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {state.zones.battlefield.length === 0 ? (
            <div className="text-zinc-600 text-sm italic">No minions</div>
          ) : (
            state.zones.battlefield.map((minion) => (
              <MinionCard
                key={minion.instanceId}
                minion={minion}
                isOpponent={false}
                isSelected={selectedAttackers.includes(minion.instanceId)}
                onClick={() => onToggleAttacker(minion.instanceId)}
                clickable={!combatActive && isPlayerTurn}
              />
            ))
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div className="bg-zinc-800/50 border-2 border-amber-600/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-amber-500 font-bold">YOUR HAND ({state.zones.hand.length})</div>
          {selectedCard && (
            <button
              onClick={() => onPlayCard(selectedCard)}
              disabled={!isPlayerTurn || state.hero.currentMana < selectedCard.manaCost}
              className={`px-4 py-1 text-xs font-bold rounded-lg transition
                ${isPlayerTurn && state.hero.currentMana >= selectedCard.manaCost
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
            >
              PLAY {selectedCard.name.toUpperCase()}
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {state.zones.hand.length === 0 ? (
            <div className="text-zinc-600 text-sm italic">No cards in hand</div>
          ) : (
            state.zones.hand.map((card) => (
              <HandCard
                key={card.instanceId}
                card={card}
                isSelected={selectedCard?.instanceId === card.instanceId}
                onSelect={() => onSelectCard(card)}
                onPlay={() => onPlayCard(card)}
                canPlay={isPlayerTurn && state.hero.currentMana >= card.manaCost}
              />
            ))
          )}
        </div>
      </div>

      {/* Player Hero Info */}
      <div className="bg-green-900/20 border-2 border-green-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-green-400 font-bold text-xl">{state.hero.name} (YOU)</div>
            <div className="text-sm text-zinc-400 mt-1">
              {state.hero.leveled ? (
                <span className="text-amber-400">⭐ LEVELED UP</span>
              ) : (
                <span>Level Progress: {state.hero.levelProgress} | {state.hero.levelCondition}</span>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-xs text-zinc-400">Health</div>
              <div className="text-2xl font-bold text-red-400">
                {state.hero.currentHealth}/{state.hero.maxHealth}
              </div>
              {state.hero.currentArmor > 0 && (
                <div className="text-sm text-blue-400">+{state.hero.currentArmor} armor</div>
              )}
            </div>

            <div className="text-center">
              <div className="text-xs text-zinc-400">Mana</div>
              <div className="text-2xl font-bold text-blue-400">
                {state.hero.currentMana}/{state.hero.maxMana}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-zinc-400">Gold</div>
              <div className="text-2xl font-bold text-amber-400">{state.hero.gold}</div>
            </div>

            {state.hero.classResource?.type !== 'none' && (
              <div className="text-center">
                <div className="text-xs text-zinc-400">{state.hero.classResource.type}</div>
                <div className="text-2xl font-bold text-purple-400">
                  {typeof state.hero.classResource.value === 'boolean'
                    ? state.hero.classResource.value ? 'YES' : 'NO'
                    : state.hero.classResource.value}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Abilities */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onHeroPower}
            disabled={state.hero.abilitiesUsedThisTurn.heroPower || !isPlayerTurn}
            className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-bold transition
              ${state.hero.abilitiesUsedThisTurn.heroPower || !isPlayerTurn
                ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                : 'bg-purple-900/30 border-purple-600 text-purple-300 hover:bg-purple-800/50 cursor-pointer'
              }`}
          >
            {state.hero.abilities.heroPower.name} ({state.hero.abilities.heroPower.cost} mana)
            <div className="text-xs opacity-75">{state.hero.abilities.heroPower.description}</div>
          </button>

          <button
            onClick={onHeroAttack}
            disabled={state.hero.abilitiesUsedThisTurn.attack || !isPlayerTurn}
            className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-bold transition
              ${state.hero.abilitiesUsedThisTurn.attack || !isPlayerTurn
                ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                : 'bg-red-900/30 border-red-600 text-red-300 hover:bg-red-800/50 cursor-pointer'
              }`}
          >
            {state.hero.abilities.attack.name}
            <div className="text-xs opacity-75">{state.hero.abilities.attack.description}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Shop Area Component
function ShopArea({ shop, roundNumber }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-amber-500 font-bold text-sm">
        SHOP (Tier: {shop.currentTier.toUpperCase()})
      </div>
      <div className="flex gap-2 flex-1">
        {shop.market.map((item) => (
          <ShopCard key={item.instanceId} item={item} />
        ))}
      </div>
      <div className="text-xs text-zinc-500">
        Next refresh: Round {roundNumber < 5 ? 5 : 9}
      </div>
    </div>
  );
}

// Minion Card Component
function MinionCard({ minion, isOpponent, isSelected = false, onClick = null, clickable = false }) {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`relative w-24 h-28 rounded-lg border-2 p-2 text-xs transition-all
        ${minion.tapped ? 'opacity-50 rotate-90' : ''}
        ${isOpponent ? 'bg-red-900/30 border-red-700' : 'bg-green-900/30 border-green-700'}
        ${minion.summoningSickness ? 'border-yellow-500' : ''}
        ${isSelected ? 'border-orange-500 border-4 shadow-lg shadow-orange-500/50 scale-110' : ''}
        ${clickable ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
      `}
    >
      <div className="font-bold text-white truncate">{minion.name}</div>
      <div className="text-[10px] text-zinc-400 truncate mt-1">{minion.effect}</div>

      {/* Stats */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between">
        <div className="bg-red-600 text-white rounded px-1.5 py-0.5 font-bold text-xs">
          {minion.attack}
        </div>
        <div className="bg-green-600 text-white rounded px-1.5 py-0.5 font-bold text-xs">
          {minion.currentHealth}/{minion.health}
        </div>
      </div>

      {/* Mana Cost */}
      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
        {minion.manaCost}
      </div>

      {minion.summoningSickness && (
        <div className="absolute top-0 right-0 text-yellow-500 text-xs">💤</div>
      )}
    </div>
  );
}

// Hand Card Component
function HandCard({ card, isSelected, onSelect, onPlay, canPlay }) {
  return (
    <div
      onClick={onSelect}
      onDoubleClick={() => canPlay && onPlay()}
      className={`relative w-32 h-40 rounded-lg border-2 p-2 cursor-pointer transition-all
        ${isSelected ? 'border-amber-500 -translate-y-2 shadow-lg shadow-amber-500/50' : 'border-zinc-600'}
        ${canPlay ? 'hover:border-amber-400 hover:-translate-y-1' : 'opacity-50'}
        bg-zinc-800
      `}
    >
      {/* Card Type Badge */}
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded mb-1
        ${card.cardType === 'minion' ? 'bg-green-700 text-white' : 'bg-purple-700 text-white'}
      `}>
        {card.cardType.toUpperCase()}
      </div>

      {/* Card Name */}
      <div className="font-bold text-white text-sm truncate">{card.name}</div>

      {/* Effect */}
      <div className="text-[10px] text-zinc-300 mt-2 line-clamp-4">{card.effect}</div>

      {/* Stats for Minions */}
      {card.cardType === 'minion' && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          <div className="bg-red-600 text-white rounded px-2 py-1 font-bold text-sm">
            {card.attack}
          </div>
          <div className="bg-green-600 text-white rounded px-2 py-1 font-bold text-sm">
            {card.health}
          </div>
        </div>
      )}

      {/* Mana Cost */}
      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
        {card.manaCost}
      </div>

      {!canPlay && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <div className="text-red-400 font-bold text-xs">NOT ENOUGH MANA</div>
        </div>
      )}
    </div>
  );
}

// Shop Card Component
function ShopCard({ item }) {
  return (
    <div className="relative w-24 h-24 rounded-lg border-2 border-amber-600 bg-amber-900/20 p-2 text-xs hover:bg-amber-800/30 transition cursor-pointer">
      <div className="font-bold text-amber-300 truncate">{item.name}</div>
      <div className="text-[10px] text-zinc-400 truncate mt-1">{item.slot}</div>
      <div className="text-[9px] text-zinc-500 line-clamp-2 mt-1">{item.effect}</div>

      {/* Cost */}
      <div className="absolute bottom-1 right-1 bg-amber-600 text-black rounded px-1.5 py-0.5 font-bold text-xs">
        {item.cost}g
      </div>

      {/* Tier Badge */}
      <div className="absolute -top-1 -left-1 bg-zinc-700 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
        T{item.tier}
      </div>
    </div>
  );
}

// Action Log Component
function ActionLog({ log }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-700">
        <h3 className="text-amber-500 font-bold">ACTION LOG</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {log.slice().reverse().map((entry, idx) => (
          <div key={idx} className="text-sm border-l-2 border-zinc-700 pl-3 py-1">
            <div className="text-zinc-400 text-xs">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-white">{entry.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameBoard;

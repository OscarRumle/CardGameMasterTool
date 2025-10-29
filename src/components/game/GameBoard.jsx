import { useState, useEffect } from 'react';
import { endTurn, playCard, useHeroPower, useHeroAttack, declareAttackers, resolveCombat, purchaseEquipment, rerollShop, declareBlocker, unassignBlocker, confirmBlockers, skipBlocking, setDamageOrder, confirmDamageOrders, raiseMinion, sacrificeMinion, retrieveFromEchoZone, GAME_CONSTANTS } from '../../utils/gameEngine';
import { aiTakeTurn } from '../../utils/simpleAI';

function GameBoard({ gameState, onStateChange, onGameOver }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAttackers, setSelectedAttackers] = useState([]);
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [targetAttacker, setTargetAttacker] = useState(null);
  const [damageOrders, setDamageOrders] = useState({}); // {attackerId: [blockerId1, blockerId2, ...]}
  const [shopExpanded, setShopExpanded] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false);
  const [animatingAttackers, setAnimatingAttackers] = useState(new Set());
  const [animatingDefenders, setAnimatingDefenders] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverBattlefield, setDragOverBattlefield] = useState(false);

  // Create a single shared AudioContext
  const [audioContext] = useState(() => {
    try {
      return new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  });

  // Sound effects using Web Audio API
  const playSound = (soundType) => {
    if (!audioContext) return;

    try {
      console.log(`Playing sound: ${soundType}`);
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      if (soundType === 'whoosh') {
        // Whoosh - descending sweep
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        oscillator.connect(gainNode);
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (soundType === 'impact') {
        // Impact - short burst with noise
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);
        oscillator.connect(gainNode);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } else if (soundType === 'block') {
        // Block - metallic clang
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        oscillator1.type = 'square';
        oscillator2.type = 'square';
        oscillator1.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.15);
        oscillator2.stop(audioContext.currentTime + 0.15);
      }
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  };

  const playerState = gameState.player;
  const aiState = gameState.ai;
  const isPlayerTurn = gameState.currentPlayer === 'player';

  // AI takes turn automatically when it's AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !gameState.gameOver) {
      // Use constant for AI turn delay
      const timer = setTimeout(() => {
        console.log('AI is thinking...');
        const newState = aiTakeTurn(gameState);
        onStateChange(newState);

        // Check for game over
        if (newState.gameOver) {
          onGameOver();
        }
      }, GAME_CONSTANTS.AI_TURN_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, onStateChange, onGameOver]);

  // AI blocks automatically when player attacks (during player's turn)
  useEffect(() => {
    if (gameState.combat.active &&
        gameState.combat.phase === 'blocking' &&
        isPlayerTurn &&
        !gameState.gameOver) {
      // AI is defending, trigger blocking logic
      const timer = setTimeout(() => {
        console.log('AI is making blocking decisions...');

        // Get available blockers (untapped minions)
        let availableBlockers = gameState.ai.zones.battlefield.filter(minion => !minion.tapped);

        // Sort attackers by attack power (block biggest threats)
        const sortedAttackers = [...gameState.combat.attackers].sort((a, b) => (b.attack || 0) - (a.attack || 0));

        let newState = gameState;

        // Assign blockers to biggest attackers
        for (const attacker of sortedAttackers) {
          if (availableBlockers.length === 0) break;

          const attackerDamage = attacker.attack || 0;

          // Find a suitable blocker
          const blocker = availableBlockers.find(minion => {
            const minionHealth = minion.currentHealth || minion.health;
            return minionHealth > attackerDamage || minionHealth <= attackerDamage;
          });

          if (blocker) {
            const blockResult = declareBlocker(newState, 'ai', blocker.instanceId, attacker.instanceId);
            if (!blockResult.error) {
              newState = blockResult.state;
              console.log(`AI blocked ${attacker.name} with ${blocker.name}`);
              availableBlockers = availableBlockers.filter(m => m.instanceId !== blocker.instanceId);
            }
          }
        }

        // Confirm blockers
        const confirmResult = confirmBlockers(newState, 'ai');
        if (!confirmResult.error) {
          newState = confirmResult.state;
          console.log('AI confirmed blockers');
          onStateChange(newState);

          // Check for game over
          if (newState.gameOver) {
            onGameOver();
          }
        } else {
          console.log(`AI confirm blockers failed: ${confirmResult.error}`);
          onStateChange(newState);
        }
      }, 1000); // Short delay for AI blocking

      return () => clearTimeout(timer);
    }
  }, [gameState.combat.active, gameState.combat.phase, isPlayerTurn, gameState, onStateChange, onGameOver]);

  // AI sets damage order automatically when player multi-blocks (during AI's turn)
  useEffect(() => {
    if (gameState.combat.active &&
        gameState.combat.phase === 'damage_order' &&
        !isPlayerTurn &&
        !gameState.gameOver) {
      // AI is attacking and needs to set damage order
      const timer = setTimeout(() => {
        console.log('AI is setting damage orders...');

        let newState = gameState;

        // For each attacker with multiple blockers, set damage order
        for (const attacker of gameState.combat.attackers) {
          const blockers = gameState.combat.blockers[attacker.instanceId] || [];

          if (blockers.length > 1) {
            // Order by lowest health first (kill as many as possible)
            const orderedBlockers = [...blockers].sort((a, b) =>
              (a.currentHealth || a.health) - (b.currentHealth || b.health)
            );
            const orderedIds = orderedBlockers.map(b => b.instanceId);

            const orderResult = setDamageOrder(newState, 'ai', attacker.instanceId, orderedIds);
            if (!orderResult.error) {
              newState = orderResult.state;
              console.log(`AI set damage order for ${attacker.name}`);
            }
          }
        }

        // Confirm all damage orders
        const confirmResult = confirmDamageOrders(newState, 'ai');
        if (!confirmResult.error) {
          newState = confirmResult.state;
          console.log('AI confirmed damage orders');
          onStateChange(newState);

          // Check for game over
          if (newState.gameOver) {
            onGameOver();
          }
        } else {
          console.log(`AI confirm damage orders failed: ${confirmResult.error}`);
          onStateChange(newState);
        }
      }, 1000); // Short delay for AI damage order

      return () => clearTimeout(timer);
    }
  }, [gameState.combat.active, gameState.combat.phase, isPlayerTurn, gameState, onStateChange, onGameOver]);

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), GAME_CONSTANTS.ERROR_MESSAGE_DURATION_MS);
  };

  // Drag and drop handlers for cards
  const handleCardDragStart = (card) => {
    if (!isPlayerTurn || playerState.hero.currentMana < card.manaCost) {
      return;
    }
    setDraggedCard(card);
    setHoveredCard(null);
  };

  const handleCardDragEnd = () => {
    setDraggedCard(null);
    setDragOverBattlefield(false);
  };

  const handleBattlefieldDragEnter = (e) => {
    if (draggedCard) {
      e.preventDefault();
      setDragOverBattlefield(true);
    }
  };

  const handleBattlefieldDragOver = (e) => {
    if (draggedCard) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleBattlefieldDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedCard) {
      handlePlayCard(draggedCard);
    }
    setDragOverBattlefield(false);
    setDraggedCard(null);
  };

  const handleBattlefieldDragLeave = (e) => {
    // Only set to false if we're actually leaving the battlefield
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setDragOverBattlefield(false);
    }
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
    console.log('=== RESOLVE COMBAT TRIGGERED ===');

    // Trigger animations before resolving combat
    const attackerIds = new Set(gameState.combat.attackers.map(a => a.instanceId));
    const defenderIds = new Set();

    // Collect all defenders (blockers)
    Object.values(gameState.combat.blockers).forEach(blockers => {
      blockers.forEach(b => defenderIds.add(b.instanceId));
    });

    console.log('Attackers:', Array.from(attackerIds));
    console.log('Defenders:', Array.from(defenderIds));

    setAnimatingAttackers(attackerIds);
    setAnimatingDefenders(defenderIds);

    // Play whoosh sound for attackers
    playSound('whoosh');

    // Trigger impact and block sounds mid-animation
    setTimeout(() => {
      playSound('impact');
      if (defenderIds.size > 0) {
        playSound('block');
      }
    }, 300);

    // Wait for animations to complete before resolving
    setTimeout(() => {
      console.log('Resolving combat damage...');
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

      // Clear animations
      console.log('Clearing animations');
      setAnimatingAttackers(new Set());
      setAnimatingDefenders(new Set());
    }, 650);
  };

  const handlePurchaseEquipment = (equipmentId) => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = purchaseEquipment(gameState, 'player', equipmentId);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
    }
  };

  const handleBlockerSelect = (minionId) => {
    // If in blocking phase and it's opponent's turn (being attacked)
    if (gameState.combat.active && gameState.combat.phase === 'blocking' && !isPlayerTurn) {
      setSelectedBlocker(minionId);
      setTargetAttacker(null); // Reset attacker selection
    }
  };

  const handleAttackerSelect = (attackerId) => {
    // If we have a blocker selected, assign the block
    if (selectedBlocker && gameState.combat.active && gameState.combat.phase === 'blocking') {
      const result = declareBlocker(gameState, 'player', selectedBlocker, attackerId);

      if (result.error) {
        showError(result.error);
      } else {
        onStateChange(result.state);
        setSelectedBlocker(null);
        setTargetAttacker(null);
      }
    }
  };

  const handleConfirmBlockers = () => {
    const result = confirmBlockers(gameState, 'player');

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
      setSelectedBlocker(null);
      setTargetAttacker(null);

      // Check for game over
      if (result.state.gameOver) {
        onGameOver();
      }
    }
  };

  const handleSkipBlocking = () => {
    const result = skipBlocking(gameState, 'player');

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
      setSelectedBlocker(null);
      setTargetAttacker(null);

      // Check for game over
      if (result.state.gameOver) {
        onGameOver();
      }
    }
  };

  const handleUnassignBlocker = (blockerId) => {
    const result = unassignBlocker(gameState, 'player', blockerId);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
    }
  };

  const handleSetDamageOrder = (attackerId, orderedBlockerIds) => {
    const result = setDamageOrder(gameState, 'player', attackerId, orderedBlockerIds);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
      // Update local state
      setDamageOrders(prev => ({
        ...prev,
        [attackerId]: orderedBlockerIds
      }));
    }
  };

  const handleConfirmDamageOrders = () => {
    const result = confirmDamageOrders(gameState, 'player');

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
      setDamageOrders({});

      // Check for game over
      if (result.state.gameOver) {
        onGameOver();
      }
    }
  };

  const handleRaiseMinion = (minionId) => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = raiseMinion(gameState, 'player', minionId);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
    }
  };

  const handleSacrificeMinion = (minionId) => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = sacrificeMinion(gameState, 'player', minionId);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
    }
  };

  const handleRetrieveFromEchoZone = (spellId) => {
    if (!isPlayerTurn) {
      showError('Not your turn!');
      return;
    }

    const result = retrieveFromEchoZone(gameState, 'player', spellId);

    if (result.error) {
      showError(result.error);
    } else {
      onStateChange(result.state);
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

      {/* Left Sidebar - Shop */}
      <div className={`border-r-2 border-zinc-700 bg-zinc-950 flex flex-col transition-all duration-300 ${shopExpanded ? 'w-96' : 'w-16'}`}>
        <div className="p-2 border-b border-zinc-700 flex items-center justify-between">
          <button
            onClick={() => setShopExpanded(!shopExpanded)}
            className="p-2 hover:bg-zinc-800 rounded transition-all"
            title={shopExpanded ? 'Collapse Shop' : 'Expand Shop'}
          >
            <span className="text-amber-500 text-xl">{shopExpanded ? '◀' : '▶'}</span>
          </button>
          {shopExpanded && <h3 className="text-amber-500 font-bold">SHOP</h3>}
        </div>
        {shopExpanded && (
          <div className="flex-1 overflow-y-auto p-3">
            <ShopArea
              shop={gameState.shop}
              roundNumber={gameState.roundNumber}
              playerGold={playerState.hero.gold}
              isPlayerTurn={isPlayerTurn}
              onPurchase={handlePurchaseEquipment}
              compact={false}
            />
          </div>
        )}
        {!shopExpanded && (
          <div className="flex-1 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap text-amber-500 font-bold text-sm">
              SHOP
            </div>
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Section - Turn Info */}
        <div className="border-b-2 border-zinc-700 bg-zinc-950 p-3">
          <div className="flex gap-4 items-center justify-center">
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
                ⚔️ {
                  gameState.combat.phase === 'blocking' ? 'BLOCKING PHASE' :
                  gameState.combat.phase === 'damage_order' ? 'ASSIGN DAMAGE ORDER' :
                  gameState.combat.phase === 'resolving' ? 'RESOLVING COMBAT' :
                  'COMBAT ACTIVE'
                }
              </div>
            )}
          </div>
        </div>

        {/* Main Battlefield Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Player Hero Panel - Left Side */}
          <div className="w-72 border-r-2 border-zinc-700 bg-zinc-900/50 p-3 overflow-y-auto">
            <HeroPanel
              state={playerState}
              isPlayer={true}
              isPlayerTurn={isPlayerTurn}
              onHeroPower={handleHeroPower}
              onHeroAttack={handleHeroAttack}
            />
          </div>

          {/* Center Battlefield - Split vertically */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
            {/* Opponent Battlefield - Top Half */}
            <div className="flex-1 flex flex-col justify-end p-4 pb-2 overflow-y-auto">
              <OpponentArea
                state={aiState}
                combat={gameState.combat}
                isPlayerTurn={isPlayerTurn}
                selectedBlocker={selectedBlocker}
                onAttackerSelect={handleAttackerSelect}
                animatingAttackers={animatingAttackers}
                animatingDefenders={animatingDefenders}
              />
            </div>

            {/* Center Divider Line */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent shadow-lg shadow-amber-500/50" />

            {/* Combat Phase UI - Centered */}
            {gameState.combat.active && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                {gameState.combat.phase === 'blocking' && !isPlayerTurn && (
                  <BlockerAssignmentsUI
                    combat={gameState.combat}
                    onUnassign={handleUnassignBlocker}
                  />
                )}
                {gameState.combat.phase === 'damage_order' && isPlayerTurn && (
                  <DamageOrderUI
                    combat={gameState.combat}
                    damageOrders={damageOrders}
                    onSetOrder={handleSetDamageOrder}
                  />
                )}
              </div>
            )}

            {/* Player Battlefield - Bottom Half */}
            <div className="flex-1 flex flex-col justify-start p-4 pt-2 overflow-y-auto pb-32">
              <PlayerArea
                state={playerState}
                isPlayerTurn={isPlayerTurn}
                selectedCard={selectedCard}
                onSelectCard={setSelectedCard}
                onPlayCard={handlePlayCard}
                selectedAttackers={selectedAttackers}
                onToggleAttacker={handleToggleAttacker}
                combatActive={gameState.combat.active}
                combatPhase={gameState.combat.phase}
                selectedBlocker={selectedBlocker}
                onBlockerSelect={handleBlockerSelect}
                onRaiseMinion={handleRaiseMinion}
                onSacrificeMinion={handleSacrificeMinion}
                animatingAttackers={animatingAttackers}
                animatingDefenders={animatingDefenders}
                onBattlefieldDragEnter={handleBattlefieldDragEnter}
                onBattlefieldDragOver={handleBattlefieldDragOver}
                onBattlefieldDrop={handleBattlefieldDrop}
                onBattlefieldDragLeave={handleBattlefieldDragLeave}
                isDragOver={dragOverBattlefield}
              />
            </div>
          </div>

          {/* MTG Arena-style Hand at Bottom - Fixed Position */}
          <PlayerHandMTG
            hand={playerState.zones.hand}
            isPlayerTurn={isPlayerTurn}
            currentMana={playerState.hero.currentMana}
            hoveredCard={hoveredCard}
            onHover={setHoveredCard}
            onDragStart={handleCardDragStart}
            onDragEnd={handleCardDragEnd}
            draggedCard={draggedCard}
          />

          {/* Opponent Hero Panel - Right Side */}
          <div className="w-72 border-l-2 border-zinc-700 bg-zinc-900/50 p-3 overflow-y-auto">
            <HeroPanel
              state={aiState}
              isPlayer={false}
              isPlayerTurn={isPlayerTurn}
            />
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="border-t-2 border-zinc-700 bg-zinc-950 p-4">
          <div className="flex justify-center gap-2">
            {/* Blocking phase - defender assigns blockers */}
            {gameState.combat.active && gameState.combat.phase === 'blocking' && !isPlayerTurn && (
              <>
                <button
                  onClick={handleSkipBlocking}
                  className="px-6 py-3 font-bold rounded-lg bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all"
                >
                  NO BLOCKS
                </button>
                <button
                  onClick={handleConfirmBlockers}
                  className="px-6 py-3 font-bold rounded-lg bg-green-600 text-white hover:bg-green-500 hover:scale-105 transition-all"
                >
                  DONE BLOCKING
                </button>
              </>
            )}

            {/* Damage order phase - attacker assigns order */}
            {gameState.combat.active && gameState.combat.phase === 'damage_order' && isPlayerTurn && (
              <button
                onClick={handleConfirmDamageOrders}
                className="px-6 py-3 font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 hover:scale-105 transition-all animate-pulse"
              >
                CONFIRM DAMAGE ORDER
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

            {/* Debug Test Button - Remove after testing */}
            <button
              onClick={() => {
                console.log('TEST BUTTON CLICKED');
                // Test animations
                const testAttackers = new Set(['test-attacker']);
                const testDefenders = new Set(['test-defender']);
                setAnimatingAttackers(testAttackers);
                setAnimatingDefenders(testDefenders);

                // Test sounds
                playSound('whoosh');
                setTimeout(() => playSound('impact'), 300);
                setTimeout(() => playSound('block'), 400);

                // Clear after animation
                setTimeout(() => {
                  setAnimatingAttackers(new Set());
                  setAnimatingDefenders(new Set());
                }, 1000);
              }}
              className="px-4 py-2 text-xs font-bold rounded bg-purple-600 text-white hover:bg-purple-500"
              title="Test animations and sounds"
            >
              TEST ANIM/SFX
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Action Log */}
      <div className={`border-l-2 border-zinc-700 bg-zinc-950 flex flex-col transition-all duration-300 ${logExpanded ? 'w-80' : 'w-12'}`}>
        <div className="p-2 border-b border-zinc-700 flex items-center justify-between">
          <button
            onClick={() => setLogExpanded(!logExpanded)}
            className="p-2 hover:bg-zinc-800 rounded transition-all"
            title={logExpanded ? 'Collapse Log' : 'Expand Log'}
          >
            <span className="text-blue-400 text-xl">{logExpanded ? '▶' : '◀'}</span>
          </button>
        </div>
        {logExpanded && (
          <div className="flex-1 overflow-y-auto">
            <ActionLog log={gameState.actionLog} />
          </div>
        )}
        {!logExpanded && (
          <div className="flex-1 flex items-center justify-center">
            <div className="transform rotate-90 whitespace-nowrap text-blue-400 font-bold text-sm">
              LOG
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hero Panel Component (for both player and opponent)
function HeroPanel({ state, isPlayer, isPlayerTurn, onHeroPower, onHeroAttack }) {
  return (
    <div className="space-y-3">
      {/* Hero Name */}
      <div className={`border-2 rounded-lg p-3 ${isPlayer ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-800'}`}>
        <div className={`font-bold text-xl ${isPlayer ? 'text-green-400' : 'text-red-400'}`}>
          {state.hero.name} {isPlayer ? '(YOU)' : '(AI)'}
        </div>
        {isPlayer && (
          <div className="text-sm text-zinc-400 mt-1">
            {state.hero.leveled ? (
              <span className="text-amber-400">⭐ LEVELED UP</span>
            ) : (
              <span>Level: {state.hero.levelProgress} | {state.hero.levelCondition}</span>
            )}
          </div>
        )}
        {!isPlayer && (
          <div className="text-sm text-zinc-400 mt-1">
            Cards: {state.zones.hand.length} | Deck: {state.zones.deck.length}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          <div className="text-xs text-zinc-400">Health</div>
          <div className="text-2xl font-bold text-red-400">
            {state.hero.currentHealth}/{state.hero.maxHealth}
          </div>
          {state.hero.currentArmor > 0 && (
            <div className="text-sm text-blue-400">+{state.hero.currentArmor} armor</div>
          )}
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          <div className="text-xs text-zinc-400">Mana</div>
          <div className="text-2xl font-bold text-blue-400">
            {state.hero.currentMana}/{state.hero.maxMana}
          </div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          <div className="text-xs text-zinc-400">Gold</div>
          <div className="text-2xl font-bold text-amber-400">{state.hero.gold}</div>
        </div>

        {state.hero.classResource?.type !== 'none' && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
            <div className="text-xs text-zinc-400">{state.hero.classResource.type}</div>
            <div className="text-2xl font-bold text-purple-400">
              {typeof state.hero.classResource.value === 'boolean'
                ? state.hero.classResource.value ? 'YES' : 'NO'
                : state.hero.classResource.value}
            </div>
          </div>
        )}
      </div>

      {/* Equipment Display (Player only) */}
      {isPlayer && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          <div className="text-xs text-zinc-400 mb-2 font-bold">EQUIPMENT</div>
          <div className="space-y-1">
            {Object.entries(state.hero.equipment).map(([slot, item]) => (
              <div key={slot} className="text-xs">
                {item ? (
                  <div className="bg-amber-900/30 border border-amber-600 rounded px-2 py-1" title={item.effect}>
                    <div className="text-amber-400 font-bold">{slot.toUpperCase()}</div>
                    <div className="text-zinc-300 truncate">{item.name}</div>
                  </div>
                ) : (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1 opacity-50">
                    <div className="text-zinc-500 font-bold">{slot.toUpperCase()}</div>
                    <div className="text-zinc-600">Empty</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Abilities (Player only) */}
      {isPlayer && onHeroPower && onHeroAttack && (
        <div className="space-y-2">
          <button
            onClick={onHeroPower}
            disabled={state.hero.abilitiesUsedThisTurn.heroPower || !isPlayerTurn}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-bold transition
              ${state.hero.abilitiesUsedThisTurn.heroPower || !isPlayerTurn
                ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                : 'bg-purple-900/30 border-purple-600 text-purple-300 hover:bg-purple-800/50 cursor-pointer'
              }`}
          >
            {state.hero.abilities.heroPower.name}
            <div className="text-xs opacity-75">({state.hero.abilities.heroPower.cost} mana)</div>
            <div className="text-xs opacity-75">{state.hero.abilities.heroPower.description}</div>
          </button>

          <button
            onClick={onHeroAttack}
            disabled={state.hero.abilitiesUsedThisTurn.attack || !isPlayerTurn}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-bold transition
              ${state.hero.abilitiesUsedThisTurn.attack || !isPlayerTurn
                ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                : 'bg-red-900/30 border-red-600 text-red-300 hover:bg-red-800/50 cursor-pointer'
              }`}
          >
            {state.hero.abilities.attack.name}
            <div className="text-xs opacity-75">{state.hero.abilities.attack.description}</div>
          </button>
        </div>
      )}
    </div>
  );
}

// Opponent Area Component
function OpponentArea({ state, combat, isPlayerTurn, selectedBlocker, onAttackerSelect, animatingAttackers, animatingDefenders }) {
  const inBlockingPhase = combat.active && combat.phase === 'blocking' && !isPlayerTurn;

  return (
    <div className="space-y-3">

      {/* Attackers Display (during blocking phase) */}
      {inBlockingPhase && combat.attackers.length > 0 && (
        <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-3 mb-2">
          <div className="text-xs text-red-400 font-bold mb-2 text-center">
            ATTACKING YOU ({combat.attackers.length})
            {selectedBlocker && <span className="ml-2 text-amber-400 text-[10px]">Click to block</span>}
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {combat.attackers.map((attacker) => {
              const blockers = combat.blockers[attacker.instanceId] || [];
              const blockCount = blockers.length;
              return (
                <div key={attacker.instanceId} className="relative">
                  <MinionCard
                    minion={attacker}
                    isOpponent={true}
                    onClick={() => selectedBlocker && onAttackerSelect(attacker.instanceId)}
                    clickable={selectedBlocker !== null}
                    isAttacking={animatingAttackers.has(attacker.instanceId)}
                  />
                  {blockCount > 0 && (
                    <div className="absolute -bottom-2 left-0 right-0 text-center">
                      <div className={`${blockCount > 1 ? 'bg-purple-600' : 'bg-blue-600'} text-white text-[8px] font-bold px-1 py-0.5 rounded`}>
                        {blockCount === 1 ? 'BLOCKED' : `BLOCKED x${blockCount}`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Battlefield */}
      <div className="w-full h-full flex flex-col">
        <div className="text-xs text-zinc-500/70 mb-2 text-center">OPPONENT BATTLEFIELD</div>
        <div className="flex-1 flex gap-4 flex-wrap content-center justify-center">
          {state.zones.battlefield.length === 0 ? (
            <div className="text-zinc-600 text-sm italic">No minions</div>
          ) : (
            state.zones.battlefield.map((minion) => (
              <MinionCard
                key={minion.instanceId}
                minion={minion}
                isOpponent={true}
                isAttacking={animatingAttackers.has(minion.instanceId)}
                isDefending={animatingDefenders.has(minion.instanceId)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// MTG Arena-style Hand Component
function PlayerHandMTG({ hand, isPlayerTurn, currentMana, hoveredCard, onHover, onDragStart, onDragEnd, draggedCard }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 z-40 pointer-events-none">
      <div className="relative h-full flex items-end justify-center">
        {hand.map((card, index) => {
          const canPlay = isPlayerTurn && currentMana >= card.manaCost;
          const isHovered = hoveredCard?.instanceId === card.instanceId;
          const isDragging = draggedCard?.instanceId === card.instanceId;
          const totalCards = hand.length;
          const centerIndex = (totalCards - 1) / 2;

          // Calculate position with slight fan effect
          const offsetFromCenter = index - centerIndex;
          const horizontalSpacing = 60; // pixels between cards
          const xOffset = offsetFromCenter * horizontalSpacing;

          // Slight rotation for fan effect
          const rotation = offsetFromCenter * 2;

          // Vertical position - hovered cards raise up
          const yOffset = isHovered ? -250 : 0;

          return (
            <div
              key={card.instanceId}
              className="absolute pointer-events-auto"
              draggable={canPlay}
              style={{
                transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg)`,
                transformOrigin: 'bottom center',
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: isHovered ? 1000 : 100 + index,
              }}
              onMouseEnter={() => !isDragging && onHover(card)}
              onMouseLeave={() => !isDragging && onHover(null)}
              onDragStart={(e) => {
                if (canPlay) {
                  onDragStart(card);
                  // Make drag image transparent
                  const img = new Image();
                  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                  e.dataTransfer.setDragImage(img, 0, 0);
                }
              }}
              onDragEnd={onDragEnd}
            >
              <div style={{
                clipPath: isHovered ? 'none' : 'inset(0 0 70% 0)',
                transition: 'clip-path 0.3s ease',
                opacity: isDragging ? 0.3 : 1,
              }}>
                <MTGCard
                  card={card}
                  canPlay={canPlay}
                  isHovered={isHovered}
                  isDragging={isDragging}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Card Preview - Enlarged */}
      {hoveredCard && !draggedCard && (
        <div className="fixed left-1/2 bottom-32 -translate-x-1/2 pointer-events-none z-[1001]"
          style={{
            transform: 'translateX(-50%) scale(1.2)',
          }}
        >
          <MTGCard
            card={hoveredCard}
            canPlay={isPlayerTurn && currentMana >= hoveredCard.manaCost}
            isHovered={true}
          />
        </div>
      )}
    </div>
  );
}

// Player Area Component
function PlayerArea({ state, isPlayerTurn, selectedCard, onSelectCard, onPlayCard, selectedAttackers, onToggleAttacker, combatActive, combatPhase, selectedBlocker, onBlockerSelect, onRaiseMinion, onSacrificeMinion, animatingAttackers, animatingDefenders, onBattlefieldDragOver, onBattlefieldDrop, onBattlefieldDragEnter, onBattlefieldDragLeave, isDragOver }) {
  const inBlockingPhase = combatActive && combatPhase === 'blocking' && !isPlayerTurn;
  const isNecromancer = state.hero.name.toLowerCase() === 'necromancer';

  return (
    <div className="space-y-3">
      {/* Necromancer Graveyard */}
      {isNecromancer && state.zones.graveyard.length > 0 && (
        <div className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4">
          <div className="text-sm text-purple-400 font-bold mb-3">
            GRAVEYARD ({state.zones.graveyard.length})
            {isPlayerTurn && <span className="ml-2 text-amber-500 text-xs">(Click to Raise)</span>}
          </div>
          <div className="flex gap-3 flex-wrap max-h-40 overflow-y-auto">
            {state.zones.graveyard.map((minion) => (
              <div key={minion.instanceId} className="relative">
                <MinionCard
                  minion={minion}
                  isOpponent={false}
                  onClick={() => isPlayerTurn && onRaiseMinion(minion.instanceId)}
                  clickable={isPlayerTurn}
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Battlefield - with drag and drop target */}
      <div
        className={`w-full h-full flex flex-col transition-all
          ${isDragOver ? 'bg-green-900/20 shadow-[inset_0_0_50px_rgba(34,197,94,0.3)]' : ''}
        `}
        onDragEnter={onBattlefieldDragEnter}
        onDragOver={onBattlefieldDragOver}
        onDrop={onBattlefieldDrop}
        onDragLeave={onBattlefieldDragLeave}
      >
        <div className="text-xs text-zinc-500/70 mb-2 text-center">
          YOUR BATTLEFIELD
          {!combatActive && isPlayerTurn && state.zones.battlefield.length > 0 && (
            <span className="ml-2 text-amber-500 text-[10px]">(Click to attack)</span>
          )}
          {inBlockingPhase && state.zones.battlefield.length > 0 && (
            <span className="ml-2 text-blue-400 text-[10px]">(Click to block)</span>
          )}
          {isDragOver && (
            <span className="ml-2 text-green-400 text-xs font-bold">(Drop to play)</span>
          )}
        </div>
        <div className="flex-1 flex gap-4 flex-wrap content-center justify-center">
          {state.zones.battlefield.length === 0 ? (
            <div className="text-zinc-600 text-sm italic">No minions</div>
          ) : (
            state.zones.battlefield.map((minion) => {
              const isAttacker = selectedAttackers.includes(minion.instanceId);
              const isBlockerSelected = selectedBlocker === minion.instanceId;

              return (
                <div key={minion.instanceId} className="relative">
                  <MinionCard
                    minion={minion}
                    isOpponent={false}
                    isSelected={isAttacker || isBlockerSelected}
                    onClick={() => {
                      if (inBlockingPhase) {
                        onBlockerSelect(minion.instanceId);
                      } else if (!combatActive && isPlayerTurn) {
                        onToggleAttacker(minion.instanceId);
                      }
                    }}
                    clickable={(!combatActive && isPlayerTurn) || inBlockingPhase}
                    isAttacking={animatingAttackers.has(minion.instanceId)}
                    isDefending={animatingDefenders.has(minion.instanceId)}
                  />
                  {/* Necromancer Sacrifice Button */}
                  {isNecromancer && isPlayerTurn && !combatActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSacrificeMinion(minion.instanceId);
                      }}
                      className="absolute bottom-1 left-1 right-1 bg-purple-600 text-white text-[8px] font-bold py-0.5 rounded hover:bg-purple-500 transition"
                      title="Sacrifice for +1 mana"
                    >
                      SACRIFICE
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

// Shop Area Component
function ShopArea({ shop, roundNumber, playerGold, isPlayerTurn, onPurchase, compact = true }) {
  return (
    <div className="space-y-3">
      <div className="text-amber-500 font-bold text-sm">
        Tier: {shop.currentTier.toUpperCase()}
      </div>
      <div className="space-y-2">
        {shop.market.map((item) => (
          <ShopCard
            key={item.instanceId}
            item={item}
            canAfford={playerGold >= item.cost}
            isPlayerTurn={isPlayerTurn}
            onClick={() => onPurchase(item.instanceId)}
            compact={compact}
          />
        ))}
      </div>
      <div className="text-xs text-zinc-500">
        Next refresh: Round {roundNumber < 5 ? 5 : roundNumber < 8 ? 8 : '-'}
      </div>
    </div>
  );
}

// Minion Card Component
function MinionCard({ minion, isOpponent, isSelected = false, onClick = null, clickable = false, isAttacking = false, isDefending = false }) {
  // Determine which animation to apply
  let animationClass = '';
  if (isAttacking) {
    animationClass = isOpponent ? 'animate-attack-lunge-down' : 'animate-attack-lunge';
    console.log(`Minion ${minion.name} (${minion.instanceId}) is attacking! Class: ${animationClass}`);
  } else if (isDefending) {
    animationClass = 'animate-hit-impact animate-block-recoil';
    console.log(`Minion ${minion.name} (${minion.instanceId}) is defending! Class: ${animationClass}`);
  }

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`relative w-32 h-40 rounded-lg border-2 p-2 text-sm
        ${!isAttacking && !isDefending ? 'transition-all' : ''}
        ${minion.tapped ? 'opacity-50 rotate-90' : ''}
        ${isOpponent ? 'bg-red-900/30 border-red-700' : 'bg-green-900/30 border-green-700'}
        ${minion.summoningSickness ? 'border-yellow-500' : ''}
        ${isSelected ? 'border-orange-500 border-4 shadow-lg shadow-orange-500/50 scale-110' : ''}
        ${clickable ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        ${animationClass}
        ${isAttacking ? 'z-50' : ''}
      `}
    >
      <div className="font-bold text-white truncate text-sm">{minion.name}</div>
      <div className="text-xs text-zinc-400 line-clamp-2 mt-1">{minion.effect}</div>

      {/* Stats */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
        <div className="bg-red-600 text-white rounded px-2 py-1 font-bold text-sm">
          {minion.attack}
        </div>
        <div className="bg-green-600 text-white rounded px-2 py-1 font-bold text-sm">
          {minion.currentHealth}/{minion.health}
        </div>
      </div>

      {/* Mana Cost */}
      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
        {minion.manaCost}
      </div>

      {minion.summoningSickness && (
        <div className="absolute top-0 right-0 text-yellow-500 text-sm">💤</div>
      )}
    </div>
  );
}

// MTG Arena-style Card Component
function MTGCard({ card, canPlay, isHovered = false, isDragging = false, style = {} }) {
  const isMinion = card.cardType === 'minion';
  const isSpell = card.cardType === 'spell';

  // Frame colors based on card type
  const frameColor = isMinion ? 'from-green-900 to-green-950' : 'from-purple-900 to-purple-950';
  const borderColor = isMinion ? 'border-green-700' : 'border-purple-700';

  return (
    <div
      style={style}
      className={`relative w-52 h-72 rounded-xl overflow-hidden border-4 ${borderColor}
        transition-all duration-200 select-none
        ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
        ${!canPlay ? 'opacity-60' : ''}
        ${isHovered ? 'shadow-2xl shadow-amber-500/50' : 'shadow-xl'}
      `}
    >
      {/* Card Frame Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${frameColor}`} />

      {/* Mana Cost Circle - Top Left */}
      <div className="absolute top-2 left-2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-4 border-blue-300 flex items-center justify-center z-10 shadow-lg">
        <span className="text-white font-bold text-2xl">{card.manaCost}</span>
      </div>

      {/* Card Art Area */}
      <div className="relative h-32 mt-2 mx-2 rounded-lg overflow-hidden border-2 border-black/50">
        <div className={`absolute inset-0 bg-gradient-to-br ${isMinion ? 'from-green-600 to-green-800' : 'from-purple-600 to-purple-800'} opacity-40`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-30">
            {isMinion ? '⚔️' : '✨'}
          </div>
        </div>
      </div>

      {/* Card Name Banner */}
      <div className="relative mt-2 mx-2 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-2 border-amber-600/50 rounded-lg px-3 py-1.5">
        <div className="font-bold text-amber-100 text-base truncate">{card.name}</div>
      </div>

      {/* Card Type */}
      <div className="mx-2 mt-1">
        <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${isMinion ? 'bg-green-700 text-green-100' : 'bg-purple-700 text-purple-100'}`}>
          {card.cardType.toUpperCase()}
        </div>
      </div>

      {/* Text Box */}
      <div className="relative mx-2 mt-2 bg-zinc-900/90 border-2 border-zinc-700 rounded-lg p-2 h-20 overflow-hidden">
        <div className="text-zinc-200 text-xs leading-snug">
          {card.effect}
        </div>
      </div>

      {/* Stats for Minions - Bottom */}
      {isMinion && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          {/* Attack */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-900 transform rotate-45 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-2xl z-10">{card.attack}</span>
            </div>
          </div>

          {/* Health */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 border-4 border-green-900 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-2xl z-10">{card.health}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cannot Play Overlay */}
      {!canPlay && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-red-400 font-bold text-sm px-4 py-2 bg-black/50 rounded-lg border-2 border-red-500">
            NOT ENOUGH MANA
          </div>
        </div>
      )}
    </div>
  );
}

// Shop Card Component
function ShopCard({ item, canAfford, isPlayerTurn, onClick, compact = true }) {
  const canPurchase = isPlayerTurn && canAfford;

  return (
    <div
      onClick={canPurchase ? onClick : undefined}
      className={`relative w-full rounded-lg border-2 p-3 text-xs transition
        ${canPurchase
          ? 'border-amber-600 bg-amber-900/20 hover:bg-amber-800/30 hover:scale-105 cursor-pointer'
          : 'border-zinc-700 bg-zinc-900/30 opacity-50 cursor-not-allowed'
        }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`font-bold ${canPurchase ? 'text-amber-300' : 'text-zinc-500'}`}>
          {item.name}
        </div>
        {/* Tier Badge */}
        <div className="bg-zinc-700 text-amber-400 rounded-full w-6 h-6 flex items-center justify-center font-bold text-[10px]">
          T{item.tier}
        </div>
      </div>

      <div className="text-[10px] text-zinc-400 mb-1">{item.slot}</div>
      <div className="text-[10px] text-zinc-300 mb-2">{item.effect}</div>

      {/* Cost */}
      <div className="flex items-center justify-between">
        <div className={`rounded px-2 py-1 font-bold text-xs
          ${canAfford ? 'bg-amber-600 text-black' : 'bg-red-600 text-white'}
        `}>
          {item.cost} GOLD
        </div>
        {!canAfford && (
          <div className="text-red-400 font-bold text-[9px]">NOT ENOUGH GOLD</div>
        )}
      </div>
    </div>
  );
}

// Blocker Assignments UI - Shows current blocker assignments with ability to unassign
function BlockerAssignmentsUI({ combat, onUnassign }) {
  const hasAssignments = Object.keys(combat.blockers).some(attackerId => combat.blockers[attackerId].length > 0);

  if (!hasAssignments) return null;

  return (
    <div className="bg-blue-900/30 border-2 border-blue-600 rounded-lg p-3 mb-3">
      <div className="text-xs text-blue-400 font-bold mb-2">
        YOUR BLOCKER ASSIGNMENTS (Click X to remove)
      </div>
      <div className="space-y-2">
        {combat.attackers.map((attacker) => {
          const blockers = combat.blockers[attacker.instanceId] || [];
          if (blockers.length === 0) return null;

          return (
            <div key={attacker.instanceId} className="flex items-center gap-2 bg-zinc-800/50 rounded p-2">
              <div className="text-white text-sm font-bold min-w-[100px]">
                {attacker.name} ({attacker.attack}/{attacker.currentHealth})
              </div>
              <div className="text-zinc-400 text-sm">blocked by:</div>
              <div className="flex gap-1 flex-wrap">
                {blockers.map((blocker) => (
                  <div key={blocker.instanceId} className="bg-green-700 text-white text-xs rounded px-2 py-1 flex items-center gap-1">
                    {blocker.name} ({blocker.attack}/{blocker.currentHealth})
                    <button
                      onClick={() => onUnassign(blocker.instanceId)}
                      className="ml-1 text-red-400 hover:text-red-300 font-bold"
                      title="Remove this blocker"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Damage Order UI - Allows attacker to set damage order for multi-blocked attackers
function DamageOrderUI({ combat, damageOrders, onSetOrder }) {
  const [localOrders, setLocalOrders] = useState({});

  // Find attackers with multiple blockers
  const multiBlockedAttackers = combat.attackers.filter(attacker => {
    const blockers = combat.blockers[attacker.instanceId] || [];
    return blockers.length > 1;
  });

  if (multiBlockedAttackers.length === 0) return null;

  const handleMoveBlocker = (attackerId, blockerIndex, direction) => {
    const blockers = combat.blockers[attackerId] || [];
    const currentOrder = localOrders[attackerId] || blockers.map(b => b.instanceId);

    const newOrder = [...currentOrder];
    const targetIndex = blockerIndex + direction;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    // Swap
    [newOrder[blockerIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[blockerIndex]];

    setLocalOrders(prev => ({ ...prev, [attackerId]: newOrder }));
  };

  const handleConfirmOrder = (attackerId) => {
    const blockers = combat.blockers[attackerId] || [];
    const order = localOrders[attackerId] || blockers.map(b => b.instanceId);
    onSetOrder(attackerId, order);
  };

  return (
    <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-3 mb-3">
      <div className="text-xs text-red-400 font-bold mb-2">
        ASSIGN DAMAGE ORDER (Set order for blockers - damage must be lethal to first before damaging next)
      </div>
      <div className="space-y-3">
        {multiBlockedAttackers.map((attacker) => {
          const blockers = combat.blockers[attacker.instanceId] || [];
          const currentOrder = localOrders[attacker.instanceId] || blockers.map(b => b.instanceId);
          const orderedBlockers = currentOrder.map(id => blockers.find(b => b.instanceId === id)).filter(Boolean);
          const isSet = damageOrders[attacker.instanceId] && damageOrders[attacker.instanceId].length > 0;

          return (
            <div key={attacker.instanceId} className="bg-zinc-800/50 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-sm font-bold">
                  {attacker.name} ({attacker.attack} damage) blocked by {blockers.length} minions:
                </div>
                <button
                  onClick={() => handleConfirmOrder(attacker.instanceId)}
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    isSet
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 text-black hover:bg-amber-500'
                  }`}
                >
                  {isSet ? '✓ SET' : 'CONFIRM ORDER'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-zinc-400 text-xs">Damage order:</div>
                <div className="flex gap-2">
                  {orderedBlockers.map((blocker, index) => (
                    <div key={blocker.instanceId} className="flex items-center gap-1">
                      <div className="bg-green-700 text-white text-xs rounded px-2 py-1">
                        #{index + 1}: {blocker.name} ({blocker.currentHealth} HP)
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveBlocker(attacker.instanceId, index, -1)}
                          disabled={index === 0}
                          className="text-white text-xs hover:text-amber-400 disabled:text-zinc-600 disabled:cursor-not-allowed"
                          title="Move earlier"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveBlocker(attacker.instanceId, index, 1)}
                          disabled={index === orderedBlockers.length - 1}
                          className="text-white text-xs hover:text-amber-400 disabled:text-zinc-600 disabled:cursor-not-allowed"
                          title="Move later"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Action Log Component
function ActionLog({ log }) {
  return (
    <div className="p-4 space-y-2">
      <h3 className="text-blue-400 font-bold mb-3">ACTION LOG</h3>
      {log.slice().reverse().map((entry, idx) => (
        <div key={idx} className="text-sm border-l-2 border-zinc-700 pl-3 py-1">
          <div className="text-zinc-400 text-xs">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </div>
          <div className="text-white">{entry.message}</div>
        </div>
      ))}
    </div>
  );
}

export default GameBoard;

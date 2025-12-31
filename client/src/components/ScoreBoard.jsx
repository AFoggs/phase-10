import React from 'react';
import { formatScore } from '../utils/cardHelpers';

function ScoreBoard({
  players,
  playerId,
  final = false
}) {
  // Sort by score (lowest first for normal game, or by phase completion)
  const sortedPlayers = [...(players || [])].sort((a, b) => {
    // First by phase (higher is better)
    if (b.currentPhase !== a.currentPhase) {
      return b.currentPhase - a.currentPhase;
    }
    // Then by score (lower is better)
    return a.score - b.score;
  });

  return (
    <div className="bg-gray-800 rounded-xl p-6 min-w-[300px]">
      <h2 className="text-xl font-bold mb-4 text-center">
        {final ? 'Final Scores' : 'Scoreboard'}
      </h2>

      <table className="w-full">
        <thead>
          <tr className="text-gray-400 text-sm border-b border-gray-700">
            <th className="text-left pb-2">Rank</th>
            <th className="text-left pb-2">Player</th>
            <th className="text-center pb-2">Phase</th>
            <th className="text-right pb-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => {
            const isYou = player.id === playerId;
            const isWinner = final && index === 0;

            return (
              <tr
                key={player.id}
                className={`
                  border-b border-gray-700/50
                  ${isYou ? 'bg-accent-gold/10' : ''}
                  ${isWinner ? 'text-accent-gold' : ''}
                `}
              >
                <td className="py-3">
                  <span className={`
                    w-6 h-6 inline-flex items-center justify-center rounded-full text-sm font-bold
                    ${index === 0 ? 'bg-accent-gold text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' :
                          'bg-gray-600 text-white'}
                  `}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {isYou && <span className="text-accent-gold text-xs">(You)</span>}
                    {player.isComputer && <span className="text-purple-400 text-xs">CPU</span>}
                    {isWinner && <span className="ml-2">👑</span>}
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className="phase-badge">
                    {player.currentPhase}
                  </span>
                  {player.completedPhaseThisRound && (
                    <span className="text-green-500 ml-1">✓</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <span className={`font-bold ${isWinner ? 'text-accent-gold' : ''}`}>
                    {formatScore(player.score)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
        <p className="mb-1">Lower score is better!</p>
        <p>Cards in hand: 1-9 = 5pts, 10-12 = 10pts, Wild/Skip = 25pts</p>
      </div>
    </div>
  );
}

// Mini score display for in-game
export function MiniScoreBoard({ players, playerId, currentPlayerId }) {
  return (
    <div className="flex flex-wrap gap-4">
      {players?.map(player => (
        <div
          key={player.id}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${player.id === currentPlayerId ? 'bg-accent-gold/20 ring-2 ring-accent-gold' : 'bg-white/5'}
            ${player.id === playerId ? 'border border-accent-gold/50' : ''}
          `}
        >
          <span className="font-medium text-sm">
            {player.name}
            {player.id === playerId && ' (You)'}
          </span>
          <span className="phase-badge text-xs">P{player.currentPhase}</span>
          <span className="score-badge text-xs">{player.score}</span>
        </div>
      ))}
    </div>
  );
}

export default ScoreBoard;

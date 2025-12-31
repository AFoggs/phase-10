import React from 'react';
import { MiniCard } from './Card';
import { canHitOnPhase } from '../utils/cardHelpers';

function PhaseDisplay({
  phaseNumber,
  phaseInfo,
  completed = false,
  laidDownPhase = null,
  canHit = false,
  selectedCard = null,
  onHit = null
}) {
  if (!phaseInfo) {
    return null;
  }

  // Check if selected card can hit on a specific group
  const canHitGroup = (group, groupIdx) => {
    if (!selectedCard || !phaseInfo) return false;
    const groupType = phaseInfo.requirements[groupIdx];
    if (!groupType) return false;
    const result = canHitOnPhase(selectedCard, group, groupType);
    return result.canHit;
  };

  // Check if any group can be hit
  const hasValidHit = laidDownPhase?.some((group, idx) => canHitGroup(group, idx));

  return (
    <div className="bg-white/5 rounded-xl p-6 w-full max-w-2xl">
      {/* Phase header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="phase-badge">Phase {phaseNumber}</span>
            {completed && (
              <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-medium">
                Completed!
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold mt-2">{phaseInfo.name}</h2>
          <p className="text-sm text-gray-400 mt-1">{phaseInfo.description}</p>
        </div>
      </div>

      {/* Requirements or laid down phase */}
      {laidDownPhase ? (
        <div className="space-y-4">
          <h3 className="text-sm text-gray-400">
            Your completed phase:
            {canHit && selectedCard && hasValidHit && (
              <span className="ml-2 text-accent-gold">(Click + to hit your card here)</span>
            )}
          </h3>
          <div className="flex flex-wrap gap-4">
            {laidDownPhase.map((group, groupIdx) => {
              const groupCanHit = canHit && selectedCard && onHit && canHitGroup(group, groupIdx);
              return (
                <div key={groupIdx} className="phase-group">
                  <div className="text-xs text-gray-400 mb-2">
                    {phaseInfo.requirements[groupIdx]?.label || `Group ${groupIdx + 1}`}
                  </div>
                  <div className="flex gap-1 items-center">
                    {group.map(card => (
                      <MiniCard key={card.id} card={card} />
                    ))}
                    {/* Hit button for own phase - only show if card can actually hit this group */}
                    {groupCanHit && (
                      <button
                        onClick={() => onHit(groupIdx)}
                        className="w-6 h-8 border-2 border-dashed border-green-400 rounded flex items-center justify-center text-green-400 text-xs hover:bg-green-400/20 transition-colors ml-1"
                        title="Hit your card here"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm text-gray-400">Requirements:</h3>
          <div className="flex flex-wrap gap-4">
            {phaseInfo.requirements.map((req, idx) => (
              <RequirementDisplay
                key={idx}
                requirement={req}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Display a single requirement
function RequirementDisplay({ requirement, index }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'set':
      case 'colorSet':
        return '⚫⚫⚫';
      case 'run':
      case 'colorRun':
      case 'oddRun':
      case 'evenRun':
      case 'oddColorRun':
      case 'evenColorRun':
        return '➡️';
      case 'color':
        return '🎨';
      default:
        return '📋';
    }
  };

  const getTypeDescription = (type, count) => {
    switch (type) {
      case 'set':
        return `${count} cards of the same number`;
      case 'run':
        return `${count} consecutive numbers`;
      case 'color':
        return `${count} cards of the same color`;
      case 'colorRun':
        return `${count} consecutive numbers, same color`;
      case 'oddRun':
        return `${count} consecutive odd numbers`;
      case 'evenRun':
        return `${count} consecutive even numbers`;
      case 'oddColorRun':
        return `${count} consecutive odd numbers, same color`;
      case 'evenColorRun':
        return `${count} consecutive even numbers, same color`;
      case 'colorSet':
        return `${count} matching numbers, same color`;
      default:
        return `${count} cards`;
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 min-w-[140px]">
      <div className="text-2xl mb-2">{getTypeIcon(requirement.type)}</div>
      <div className="font-medium">{requirement.label}</div>
      <div className="text-xs text-gray-400 mt-1">
        {getTypeDescription(requirement.type, requirement.count)}
      </div>
    </div>
  );
}

// Compact phase display for other uses
export function CompactPhaseDisplay({ phaseNumber, completed }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Phase</span>
      <span className={`
        font-bold
        ${completed ? 'text-green-500' : 'text-white'}
      `}>
        {phaseNumber}
      </span>
      {completed && <span className="text-green-500 text-sm">✓</span>}
    </div>
  );
}

export default PhaseDisplay;

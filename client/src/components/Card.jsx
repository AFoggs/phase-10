import React from 'react';
import { useDrag } from 'react-dnd';
import { getCardBgClass, getCardTextColor, formatCard } from '../utils/cardHelpers';

export const ItemTypes = {
  CARD: 'card'
};

function Card({
  card,
  index = 0,
  selected = false,
  highlighted = false,
  onClick,
  draggable = true,
  small = false,
  faceDown = false,
  disabled = false,
  style = {}
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { card, index },
    canDrag: draggable && !disabled && !faceDown,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [card, index, draggable, disabled, faceDown]);

  const baseSize = small ? 'w-12 h-16' : 'w-16 h-24 sm:w-20 sm:h-28';
  const fontSize = small ? 'text-lg' : 'text-2xl sm:text-3xl';

  // Card back design
  if (faceDown) {
    return (
      <div
        className={`
          ${baseSize}
          bg-gradient-to-br from-indigo-800 to-purple-900
          rounded-lg
          border-2 border-indigo-400
          flex items-center justify-center
          shadow-lg
        `}
        style={style}
      >
        <div className="text-indigo-400 text-lg font-bold opacity-50">
          P10
        </div>
      </div>
    );
  }

  const bgClass = getCardBgClass(card);
  const textClass = getCardTextColor(card);
  const displayValue = formatCard(card);

  return (
    <div
      ref={draggable ? drag : null}
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseSize}
        ${bgClass}
        ${textClass}
        rounded-lg
        border-2
        ${selected ? 'border-accent-gold ring-2 ring-accent-gold' : highlighted ? 'border-green-400 ring-2 ring-green-400 shadow-[0_0_15px_rgba(74,222,128,0.6)]' : 'border-white/30'}
        flex flex-col items-center justify-center
        shadow-lg
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        card-container
      `}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : draggable ? 'grab' : 'default'
      }}
    >
      {card.type === 'wild' ? (
        <>
          <span className={`${fontSize} font-bold`}>W</span>
          <span className="text-xs mt-1">WILD</span>
        </>
      ) : card.type === 'skip' ? (
        <>
          <span className={`${fontSize} font-bold`}>X</span>
          <span className="text-xs mt-1">SKIP</span>
        </>
      ) : (
        <>
          <span className={`${fontSize} font-bold`}>{displayValue}</span>
          {!small && (
            <div
              className={`
                w-3 h-3 rounded-full mt-1
                ${card.color === 'yellow' ? 'border border-gray-400' : ''}
              `}
              style={{ backgroundColor: 'currentColor', opacity: 0.5 }}
            />
          )}
        </>
      )}

      {/* Corner numbers */}
      {card.type === 'number' && !small && (
        <>
          <span className="absolute top-1 left-2 text-xs font-bold opacity-75">
            {displayValue}
          </span>
          <span className="absolute bottom-1 right-2 text-xs font-bold opacity-75 rotate-180">
            {displayValue}
          </span>
        </>
      )}
    </div>
  );
}

// Card placeholder for empty slots
export function CardPlaceholder({ small = false, label = '' }) {
  const size = small ? 'w-12 h-16' : 'w-16 h-24 sm:w-20 sm:h-28';

  return (
    <div
      className={`
        ${size}
        border-2 border-dashed border-white/30
        rounded-lg
        flex items-center justify-center
        text-white/30 text-xs text-center
        p-1
      `}
    >
      {label}
    </div>
  );
}

// Mini card for display in player info
export function MiniCard({ card }) {
  const bgClass = getCardBgClass(card);
  const textClass = getCardTextColor(card);

  return (
    <div
      className={`
        w-6 h-8
        ${bgClass}
        ${textClass}
        rounded
        flex items-center justify-center
        text-xs font-bold
        border border-white/30
      `}
    >
      {card.type === 'wild' ? 'W' : card.type === 'skip' ? 'X' : card.value}
    </div>
  );
}

export default Card;

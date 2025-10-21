import { memo } from 'react';
import AutoSizeEffectText from './AutoSizeEffectText';
import { applyKeywordBolding } from '../../utils/customization';

const ClassCard = memo(({ card, customization, textSettings, keywords }) => {
  const type = card['Card Type']?.toLowerCase();
  const color = customization[type]?.color || customization.minion?.color || '#000';
  const isMinion = card['Card Type'] === 'Minion';
  const effectHTML = applyKeywordBolding(card.Effect || '', keywords);

  return (
    <div style={{
      width: '63mm',
      height: '88mm',
      backgroundColor: '#fff',
      border: '2px solid #000',
      borderRadius: '3mm',
      boxSizing: 'border-box',
      fontFamily: customization.font,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `3px solid ${color}`,
        padding: '1.5mm 2mm',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: `${textSettings.cardNameSize}pt`,
          fontWeight: 'bold',
          color: '#000',
          margin: 0,
          lineHeight: 1,
          flex: 1
        }}>{card['Card Name']}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1mm', marginLeft: '2mm' }}>
          <span style={{ fontSize: '13pt', lineHeight: 1 }}>◆</span>
          <span style={{ fontSize: `${textSettings.costSize}pt`, fontWeight: 'bold' }}>{card['Mana Cost'] || 0}</span>
        </div>
      </div>

      {/* Image */}
      <div style={{
        flex: '0 0 25%',
        margin: '1.5mm 2mm',
        border: '1px solid #D1D5DB',
        borderRadius: '2mm',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ fontSize: '24pt', color: '#D1D5DB' }}>
          {card['Card Type'] === 'Minion' && '⚔'}
          {card['Card Type'] === 'Spell' && '◆'}
          {card['Card Type'] === 'Upgrade' && '⬆'}
          {card['Card Type'] === 'Ultimate' && '▲'}
        </div>
      </div>

      {/* Type line */}
      <div style={{
        padding: '1mm 2mm',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB'
      }}>
        <h2 style={{ fontSize: '7pt', fontWeight: 'bold', color: '#000', margin: 0, lineHeight: 1.2 }}>
          {card['Card Type']}
          {card['Upgrade Slot'] && <span style={{ fontStyle: 'italic', marginLeft: '3px', fontWeight: 'normal' }}>— {card['Upgrade Slot']}</span>}
        </h2>
      </div>

      {/* Effect text */}
      <AutoSizeEffectText
        text={effectHTML}
        standardSize={textSettings.standardEffectSize}
        minSize={textSettings.minEffectSize}
      />

      {/* Stats corner box */}
      {isMinion && (
        <div style={{
          position: 'absolute',
          bottom: '2mm',
          right: '2mm',
          backgroundColor: '#fff',
          border: '2px solid #000',
          borderRadius: '2mm',
          padding: '1.5mm 3mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '11pt',
            fontWeight: 'bold',
            color: '#000',
            lineHeight: 1
          }}>
            {card.Attack}/{card.Health}
          </span>
        </div>
      )}

      {/* Bounty/Copies in bottom left corner */}
      {(isMinion && card.Bounty) || card.Copies ? (
        <div style={{
          position: 'absolute',
          bottom: '2mm',
          left: '2mm',
          display: 'flex',
          gap: '2mm',
          alignItems: 'center'
        }}>
          {isMinion && card.Bounty && (
            <div style={{
              backgroundColor: '#fff',
              border: '1.5px solid #000',
              padding: '1mm 2mm',
              borderRadius: '1.5mm',
              fontSize: '9pt',
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              💰 {card.Bounty}
            </div>
          )}
          {card.Copies && (
            <div style={{
              backgroundColor: '#fff',
              border: '1.5px solid #000',
              padding: '1mm 2mm',
              borderRadius: '1.5mm',
              fontSize: '9pt',
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              ×{card.Copies}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
});

ClassCard.displayName = 'ClassCard';

export default ClassCard;

import { memo } from 'react';
import AutoSizeEffectText from './AutoSizeEffectText';
import { applyKeywordBolding } from '../../utils/customization';

const EquipmentCard = memo(({ card, customization, textSettings, keywords }) => {
  const slot = card.Slot?.toLowerCase();
  const category = card.Category?.toLowerCase();
  const color = customization[slot]?.color || customization[category]?.color || customization.weapon?.color || '#000';
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
        }}>{card['Item Name']}</h1>
      </div>

      {/* Tier stars */}
      {card.Tier && (
        <div style={{
          padding: '0.5mm 0',
          textAlign: 'center',
          borderBottom: '1px solid #E5E7EB',
          fontSize: '8pt'
        }}>
          {[...Array(card.Tier)].map((_, i) => (
            <span key={i} style={{ color, marginRight: '0.5px' }}>★</span>
          ))}
        </div>
      )}

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
          {card.Slot === 'Weapon' && '⚔'}
          {card.Slot === 'Chest' && '🛡'}
          {card.Slot === 'Jewelry' && '💍'}
          {card.Slot === 'Relic' && '◆'}
          {card.Category === 'Consumable' && '🧪'}
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
          Equipment — {card.Slot || card.Category}
          {card['Relic Type'] && <span style={{ fontStyle: 'italic', marginLeft: '3px', fontWeight: 'normal' }}>({card['Relic Type']})</span>}
        </h2>
      </div>

      {/* Effect text */}
      <AutoSizeEffectText
        text={effectHTML}
        standardSize={textSettings.standardEffectSize}
        minSize={textSettings.minEffectSize}
      />

      {/* Cost in bottom left corner */}
      <div style={{
        position: 'absolute',
        bottom: '2mm',
        left: '2mm',
        backgroundColor: '#fff',
        border: '1.5px solid #000',
        padding: '1mm 2mm',
        borderRadius: '1.5mm',
        fontSize: '9pt',
        fontWeight: 'bold',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '1mm'
      }}>
        <span>💰 {card.Cost}g</span>
      </div>

      {/* Tier/Phase info in bottom right */}
      {(card.Tier || card['Shop Phase']) && (
        <div style={{
          position: 'absolute',
          bottom: '2mm',
          right: '2mm',
          backgroundColor: '#fff',
          border: '1.5px solid #000',
          borderRadius: '1.5mm',
          padding: '1mm 2mm',
          fontSize: '7pt',
          fontWeight: 'bold',
          lineHeight: 1.2
        }}>
          {card.Tier && <span>T{card.Tier}</span>}
          {card.Tier && card['Shop Phase'] && <span> • </span>}
          {card['Shop Phase'] && <span>{card['Shop Phase']}</span>}
        </div>
      )}
    </div>
  );
});

EquipmentCard.displayName = 'EquipmentCard';

export default EquipmentCard;

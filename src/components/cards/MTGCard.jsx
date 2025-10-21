import { memo } from 'react';
import ClassCard from './ClassCard';
import EquipmentCard from './EquipmentCard';

const MTGCard = memo(({ card, customization, textSettings, keywords }) => {
  const isEquipment = card['Item Name'] !== undefined;
  return isEquipment ? (
    <EquipmentCard card={card} customization={customization} textSettings={textSettings} keywords={keywords} />
  ) : (
    <ClassCard card={card} customization={customization} textSettings={textSettings} keywords={keywords} />
  );
});

MTGCard.displayName = 'MTGCard';

export default MTGCard;

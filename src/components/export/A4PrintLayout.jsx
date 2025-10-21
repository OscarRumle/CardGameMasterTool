import { memo } from 'react';
import MTGCard from '../cards/MTGCard';

const A4PrintLayout = memo(({ deck, textSettings, keywords, easyPrintMode = false }) => {
  const cardsPerPage = 9;
  const pages = [];
  const cards = deck.cards || [];

  for (let i = 0; i < cards.length; i += cardsPerPage) {
    pages.push(cards.slice(i, i + cardsPerPage));
  }

  if (easyPrintMode) {
    // Easy Print Mode - tight layout for easy cutting
    return (
      <div>
        {pages.map((pageCards, pageIdx) => (
          <div key={pageIdx} style={{
            width: '210mm',
            height: '297mm',
            position: 'relative',
            pageBreakAfter: 'always',
            margin: '0 auto',
            background: '#fff',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 63mm)',
              gridTemplateRows: 'repeat(3, 88mm)',
              gap: '1px'
            }}>
              {pageCards.map((card) => (
                <div key={card.id}>
                  <MTGCard card={card} customization={deck.customization} textSettings={textSettings} keywords={keywords} />
                </div>
              ))}
            </div>

            <div style={{
              position: 'absolute',
              bottom: '5mm',
              right: '10mm',
              fontSize: '10pt',
              color: '#666'
            }}>
              Page {pageIdx + 1} of {pages.length}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Normal mode with cut guides
  return (
    <div>
      {pages.map((pageCards, pageIdx) => (
        <div key={pageIdx} style={{
          width: '210mm',
          height: '297mm',
          position: 'relative',
          pageBreakAfter: 'always',
          margin: '0 auto',
          background: '#fff',
          padding: '10.5mm 10.5mm 16.5mm 10.5mm',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 63mm)',
            gridTemplateRows: 'repeat(3, 88mm)',
            gap: '2mm',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none'
            }}>
              <div style={{ position: 'absolute', left: '65mm', top: '-5mm', bottom: '-5mm', width: '1px', borderLeft: '1px dashed #CCC' }} />
              <div style={{ position: 'absolute', left: '130mm', top: '-5mm', bottom: '-5mm', width: '1px', borderLeft: '1px dashed #CCC' }} />
              <div style={{ position: 'absolute', top: '90mm', left: '-5mm', right: '-5mm', height: '1px', borderTop: '1px dashed #CCC' }} />
              <div style={{ position: 'absolute', top: '180mm', left: '-5mm', right: '-5mm', height: '1px', borderTop: '1px dashed #CCC' }} />
            </div>

            {pageCards.map((card) => (
              <div key={card.id}>
                <MTGCard card={card} customization={deck.customization} textSettings={textSettings} keywords={keywords} />
              </div>
            ))}
          </div>

          <div style={{
            position: 'absolute',
            bottom: '5mm',
            right: '10mm',
            fontSize: '10pt',
            color: '#666'
          }}>
            Page {pageIdx + 1} of {pages.length}
          </div>
        </div>
      ))}
    </div>
  );
});

A4PrintLayout.displayName = 'A4PrintLayout';

export default A4PrintLayout;

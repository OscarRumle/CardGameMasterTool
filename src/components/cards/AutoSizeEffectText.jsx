import { useEffect, useRef, useState, memo } from 'react';

const AutoSizeEffectText = memo(({ text, standardSize, minSize }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(standardSize);
  const [lineHeight, setLineHeight] = useState(1.3);
  const safeText = text || '';

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !safeText) return;

    const container = containerRef.current;
    const textElement = textRef.current;

    let currentSize = standardSize;
    let currentLineHeight = 1.3;

    const fitText = () => {
      // Set initial values
      setFontSize(currentSize);
      setLineHeight(currentLineHeight);

      // Multiple RAF to ensure paint is done
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Force reflow
            void textElement.offsetHeight;

            const containerHeight = container.clientHeight;
            const textHeight = textElement.scrollHeight;

            // If text overflows
            if (textHeight > containerHeight && currentSize > minSize) {
              // Try reducing font size first
              if (currentSize > minSize + 1) {
                currentSize -= 1;
                fitText();
              }
              // If we're near minimum, try tightening line height
              else if (currentLineHeight > 1.1) {
                currentLineHeight -= 0.05;
                fitText();
              }
              // Last resort: go to absolute minimum
              else if (currentSize > minSize) {
                currentSize = minSize;
                currentLineHeight = 1.1;
                fitText();
              }
            }
          });
        });
      });
    };

    fitText();
  }, [safeText, standardSize, minSize]);

  return (
    <div ref={containerRef} style={{
      flex: 1,
      margin: '1.5mm 2mm 1mm 2mm',
      padding: '1mm 1.5mm',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <p ref={textRef} style={{
        margin: 0,
        fontSize: `${fontSize}pt`,
        color: '#000',
        lineHeight: lineHeight,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
        width: '100%'
      }} dangerouslySetInnerHTML={{ __html: safeText }} />
    </div>
  );
});

AutoSizeEffectText.displayName = 'AutoSizeEffectText';

export default AutoSizeEffectText;

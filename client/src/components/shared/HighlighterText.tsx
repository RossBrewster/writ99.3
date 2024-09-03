import React, { useState, useRef, useCallback, useMemo } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';

interface HighlightableStringProps {
  text: string;
}

interface Highlight {
  id: string;
  start: number;
  end: number;
}

interface ProcessedHighlight extends Highlight {
  depth: number;
}

export const HighlighterText: React.FC<HighlightableStringProps> = ({ text }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  const handleHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !textRef.current) return;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(textRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    const end = start + range.toString().length;

    if (start !== end) {
      const newHighlight: Highlight = {
        id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        start,
        end
      };
      setHighlights(prevHighlights => [...prevHighlights, newHighlight]);
    }

    selection.removeAllRanges();
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prevHighlights => prevHighlights.filter(h => h.id !== id));
  }, []);

  const processHighlights = useCallback((highlights: Highlight[]): ProcessedHighlight[] => {
    const events: Array<{ position: number; type: 'start' | 'end'; highlight: Highlight }> = [];
    highlights.forEach(h => {
      events.push({ position: h.start, type: 'start', highlight: h });
      events.push({ position: h.end, type: 'end', highlight: h });
    });
    events.sort((a, b) => a.position - b.position || (a.type === 'start' ? -1 : 1));

    const processedHighlights: ProcessedHighlight[] = [];
    let stack: Highlight[] = [];
    let lastPosition = 0;

    events.forEach(event => {
      if (event.position > lastPosition) {
        if (stack.length > 0) {
          const activeHighlights = [...stack];
          const id = activeHighlights.map(h => h.id).join('-');
          processedHighlights.push({
            id: `processed-${id}-${lastPosition}-${event.position}`,
            start: lastPosition,
            end: event.position,
            depth: stack.length
          });
        }
        lastPosition = event.position;
      }

      if (event.type === 'start') {
        stack.push(event.highlight);
      } else {
        stack = stack.filter(h => h.id !== event.highlight.id);
      }
    });

    return processedHighlights;
  }, []);


  const processedHighlights = useMemo(() => processHighlights(highlights), [highlights, processHighlights]);

  const renderText = useCallback(() => {
    let lastIndex = 0;
    const result: React.ReactNode[] = [];

    processedHighlights.forEach((highlight) => {
      if (highlight.start > lastIndex) {
        result.push(text.slice(lastIndex, highlight.start));
      }
      result.push(
        <ContextMenu.Root key={highlight.id}>
          <ContextMenu.Trigger asChild>
            <span 
              className="relative"
              style={{
                backgroundColor: `rgba(255, 255, 0, ${0.2 + (highlight.depth * 0.1)})`,
                zIndex: highlight.depth
              }}
            >
              {text.slice(highlight.start, highlight.end)}
            </span>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content className="min-w-[220px] bg-white rounded-md overflow-hidden p-1 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
              <ContextMenu.Item 
                className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
                onClick={() => removeHighlight(highlight.id.split('-')[1])}
              >
                Remove Highlight
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      );
      lastIndex = highlight.end;
    });

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  }, [text, processedHighlights, removeHighlight]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div ref={textRef} className="inline-block whitespace-pre-wrap">
          {renderText()}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[220px] bg-white rounded-md overflow-hidden p-1 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
          <ContextMenu.Item 
            className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
            onClick={handleHighlight}
          >
            Highlight Selection
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
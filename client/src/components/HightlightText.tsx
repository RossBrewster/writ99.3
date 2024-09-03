import React, { useState, useCallback, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

const sampleText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. This is a test sentence to demonstrate how we handle multiple instances of the same word. The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. This is a test sentence to demonstrate how we handle multiple instances of the same word.";

const colorOptions = [
  '#ffff00', '#90EE90', '#ADD8E6', '#FFA07A', '#cecef6', '#FFB6C1',
];

interface Highlight {
  id: number;
  text: string;
  color: string;
  startIndex: number;
  endIndex: number;
}

interface TempHighlight {
  startIndex: number;
  endIndex: number;
}

interface HighlightTextProps {
  minHighlightLength?: number;
  maxHighlights?: number;
}

const HighlightText: React.FC<HighlightTextProps> = ({ 
  minHighlightLength = 3, 
  maxHighlights = 10 
}) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [tempHighlights, setTempHighlights] = useState<TempHighlight[]>([]);

  useEffect(() => {
    if (minHighlightLength < 1) {
      showTemporaryError('minHighlightLength must be at least 1');
    } else if (maxHighlights < 1) {
      showTemporaryError('maxHighlights must be at least 1');
    }
  }, [minHighlightLength, maxHighlights]);

  const showTemporaryError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }, []);

  const handleTextSelection = useCallback(() => {
    try {
      const selection = window.getSelection();
      if (!selection) {
        throw new Error('No text selected');
      }

      const text = selection.toString().trim();
      if (text.length < minHighlightLength) {
        throw new Error(`Selection must be at least ${minHighlightLength} characters long`);
      }

      if (!color) {
        throw new Error('Please select a highlight color first');
      }

      // Find all instances of the selected text
      const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = [...sampleText.matchAll(regex)];
      const newTempHighlights = matches.map(match => ({
        startIndex: match.index!,
        endIndex: match.index! + text.length
      }));

      if (newTempHighlights.length === 1) {
        // If there's only one instance, highlight it immediately
        confirmHighlight(newTempHighlights[0].startIndex, newTempHighlights[0].endIndex, text);
      } else {
        // If there are multiple instances, set the temporary highlights for confirmation
        setSelectedText(text);
        setTempHighlights(newTempHighlights);
      }

    } catch (err) {
      if (err instanceof Error) {
        showTemporaryError(err.message);
      } else {
        showTemporaryError('An unexpected error occurred');
      }
    }
  }, [minHighlightLength, showTemporaryError, color, sampleText]);

  const confirmHighlight = useCallback((startIndex: number, endIndex: number, text: string) => {
    if (color === null) return;

    setHighlights(prevHighlights => {
      if (prevHighlights.length >= maxHighlights) {
        showTemporaryError(`Maximum number of highlights (${maxHighlights}) reached`);
        return prevHighlights;
      }

      let newHighlights = [...prevHighlights];
      let affectedHighlights = newHighlights.filter(h => 
        (startIndex < h.endIndex && endIndex > h.startIndex) // Any form of overlap
      );

      if (affectedHighlights.length > 0) {
        // Remove all affected highlights
        newHighlights = newHighlights.filter(h => !affectedHighlights.includes(h));

        // Process each affected highlight
        affectedHighlights.forEach(h => {
          // Part before the overlap
          if (startIndex > h.startIndex) {
            newHighlights.push({
              id: Date.now() + Math.random(),
              text: sampleText.slice(h.startIndex, startIndex),
              color: h.color,
              startIndex: h.startIndex,
              endIndex: startIndex
            });
          }

          // Overlapping part (uses the new highlight's color)
          newHighlights.push({
            id: Date.now() + Math.random(),
            text: sampleText.slice(Math.max(startIndex, h.startIndex), Math.min(endIndex, h.endIndex)),
            color: color,
            startIndex: Math.max(startIndex, h.startIndex),
            endIndex: Math.min(endIndex, h.endIndex)
          });

          // Part after the overlap
          if (endIndex < h.endIndex) {
            newHighlights.push({
              id: Date.now() + Math.random(),
              text: sampleText.slice(endIndex, h.endIndex),
              color: h.color,
              startIndex: endIndex,
              endIndex: h.endIndex
            });
          }
        });

        // Add any part of the new highlight that extends beyond the affected highlights
        const lastAffectedHighlight = affectedHighlights[affectedHighlights.length - 1];
        if (endIndex > lastAffectedHighlight.endIndex) {
          newHighlights.push({
            id: Date.now() + Math.random(),
            text: sampleText.slice(lastAffectedHighlight.endIndex, endIndex),
            color: color,
            startIndex: lastAffectedHighlight.endIndex,
            endIndex: endIndex
          });
        }
      } else {
        // If there's no overlap, just add the new highlight
        newHighlights.push({
          id: Date.now(),
          text,
          color,
          startIndex,
          endIndex
        });
      }

      // Sort highlights by startIndex
      newHighlights.sort((a, b) => a.startIndex - b.startIndex);

      return newHighlights;
    });

    // Clear selection after confirming
    setSelectedText(null);
    setTempHighlights([]);
  }, [color, maxHighlights, showTemporaryError, sampleText]);

  const cancelSelection = useCallback(() => {
    setSelectedText(null);
    setTempHighlights([]);
  }, []);

  const removeHighlight = useCallback((id: number) => {
    setHighlights(prevHighlights => prevHighlights.filter(h => h.id !== id));
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlights([]);
    setSelectedText(null);
    setTempHighlights([]);
  }, []);

  const renderHighlightedText = useCallback(() => {
    let result = [];
    let lastIndex = 0;

    const allHighlights = [
      ...highlights.map(h => ({ ...h, isTemp: false as const })),
      ...tempHighlights.map(h => ({ ...h, isTemp: true as const }))
    ].sort((a, b) => a.startIndex - b.startIndex);

    allHighlights.forEach((highlight, index) => {
      const { startIndex, endIndex, isTemp } = highlight;
      
      if (startIndex > lastIndex) {
        result.push(sampleText.slice(lastIndex, startIndex));
      }
      
      const highlightedText = sampleText.slice(startIndex, endIndex);
      
      if (isTemp && tempHighlights.length > 1) {
        result.push(
          <span key={`temp-${index}`} className="relative">
            <span className="bg-gray-200">{highlightedText}</span>
            <button
              onClick={() => confirmHighlight(startIndex, endIndex, highlightedText)}
              className="absolute -top-5 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded"
            >
              Confirm
            </button>
          </span>
        );
      } else if (isTemp) {
        result.push(<span key={`temp-${index}`} className="bg-gray-200">{highlightedText}</span>);
      } else {
        const { color, id } = highlight as Highlight;
        result.push(
          <span key={id} style={{ backgroundColor: color }}>
            {highlightedText}
          </span>
        );
      }
      
      lastIndex = endIndex;
    });

    if (lastIndex < sampleText.length) {
      result.push(sampleText.slice(lastIndex));
    }

    return <>{result}</>;
  }, [highlights, tempHighlights, confirmHighlight, sampleText]);

  const toggleColor = useCallback((selectedColor: string) => {
    setColor(prevColor => prevColor === selectedColor ? null : selectedColor);
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4 flex items-center flex-wrap">
        <span className="mr-2 mb-2">Select highlight color:</span>
        {colorOptions.map((c) => (
          <button
            key={c}
            onClick={() => toggleColor(c)}
            className={`w-6 h-6 rounded-full mr-2 mb-2 ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
            style={{ backgroundColor: c }}
            aria-label={`${color === c ? 'Deselect' : 'Select'} ${c} color`}
          />
        ))}
      </div>
      <p 
        onMouseUp={handleTextSelection}
        className="mb-4 p-2 border border-gray-300 rounded"
      >
        {renderHighlightedText()}
      </p>
      {selectedText && tempHighlights.length > 1 && (
        <div className="mb-4">
          <p>Selected text: "{selectedText}"</p>
          <p>Multiple instances found. Please confirm the instance you want to highlight.</p>
          <button 
            onClick={cancelSelection}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
          >
            Cancel Selection
          </button>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="highlights">
          <AccordionTrigger>Current Highlights ({highlights.length})</AccordionTrigger>
          <AccordionContent>
            {highlights.map(highlight => (
              <div key={highlight.id} className="flex items-center mb-2">
                <span 
                  className="inline-block w-4 h-4 mr-2" 
                  style={{ backgroundColor: highlight.color }}
                ></span>
                <span className="mr-2 flex-grow">{highlight.text}</span>
                <button 
                  onClick={() => removeHighlight(highlight.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {highlights.length === 0 && (
              <p className="text-gray-500 italic">No highlights yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <button 
        onClick={clearHighlights}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear All Highlights
      </button>
    </div>
  );
};

export default HighlightText;
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { Lock, Unlock, CornerRightDown, Trash2 } from 'lucide-react';

interface Note {
  id: number;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isLocked: boolean;
}

interface Connection {
  start: number;
  end: number;
}

interface AnimatedNoteProps {
  note: Note;
  onUpdate: (id: number, updates: Partial<Note>) => void;
  onDelete: (id: number) => void;
  onDoubleClick: (id: number) => void;
  onConnectionEnd: (id: number) => void;
  isConnecting: boolean;
}

const AnimatedNote: React.FC<AnimatedNoteProps> = ({ 
  note, 
  onUpdate,
  onDelete,
  onDoubleClick,
  onConnectionEnd,
  isConnecting,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  const [{ x, y, width, height, scale }, api] = useSpring(() => ({
    x: note.x,
    y: note.y,
    width: note.width,
    height: note.height,
    scale: 1,
    config: config.wobbly,
  }));

  useEffect(() => {
    api.start({ x: note.x, y: note.y, width: note.width, height: note.height });
  }, [note.x, note.y, note.width, note.height, api]);

  const handleMouseEnter = () => api.start({ scale: 1.05 });
  const handleMouseLeave = () => api.start({ scale: 1 });

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.isLocked) {
      setIsResizing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.isLocked && !isConnecting) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - note.x, y: e.clientY - note.y });
    }
  };

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        const newWidth = Math.max(note.width + dx, 100);
        const newHeight = Math.max(note.height + dy, 80);
        onUpdate(note.id, { width: newWidth, height: newHeight });
        setStartPos({ x: e.clientX, y: e.clientY });
      } else if (isDragging) {
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        onUpdate(note.id, { x: newX, y: newY });
      }
    };

    if (isResizing || isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, note.id, note.width, note.height, onUpdate, startPos, handleMouseUp]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) {
      onConnectionEnd(note.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(note.id);
  };

  return (
    <animated.div
      ref={noteRef}
      style={{ x, y, width, height, scale, position: 'absolute' }}
      className={`bg-yellow-200 p-2 rounded shadow min-h-52 ${note.isLocked ? 'cursor-default' : isConnecting ? 'cursor-pointer' : 'cursor-move'}`}
      onMouseDown={handleDragStart}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <textarea
        value={note.content}
        onChange={(e) => onUpdate(note.id, { content: e.target.value })}
        className="w-full h-full bg-transparent focus:outline-none p-2 pr-6 resize-none"
        style={{ minWidth: '100px', minHeight: '80px' }}
        placeholder="Enter your note here..."
        readOnly={note.isLocked || isConnecting}
      />
      <button
        onClick={() => onUpdate(note.id, { isLocked: !note.isLocked })}
        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
      >
        {note.isLocked ? (
          <Lock size={16} className="text-gray-600" />
        ) : (
          <Unlock size={16} className="text-gray-600" />
        )}
      </button>
      <button
        onMouseDown={handleResizeStart}
        className="absolute bottom-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-se-resize"
      >
        <CornerRightDown size={16} className="text-gray-600" />
      </button>
      <button
        onClick={() => onDelete(note.id)}
        className="absolute bottom-1 left-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
      >
        <Trash2 size={16} className="text-red-600" />
      </button>
    </animated.div>
  );
};

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [nextId, setNextId] = useState(1);
  const [activeConnection, setActiveConnection] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const addNote = () => {
    const newNote: Note = {
      id: nextId,
      content: '',
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 100),
      width: 200,
      height: 100,
      isLocked: false,
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    setNextId(nextId + 1);
  };

  const updateNote = useCallback((id: number, updates: Partial<Note>) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  }, []);

  const deleteNote = useCallback((id: number) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    setConnections(prevConnections => prevConnections.filter(
      conn => conn.start !== id && conn.end !== id
    ));
  }, []);

  const handleDoubleClick = (id: number) => {
    if (activeConnection === null) {
      setActiveConnection(id);
    }
  };

  const handleConnectionEnd = (endId: number) => {
    if (activeConnection !== null && activeConnection !== endId) {
      setConnections(prevConnections => [
        ...prevConnections,
        { start: activeConnection, end: endId }
      ]);
      setActiveConnection(null);
    }
  };

  const cancelConnection = () => {
    setActiveConnection(null);
  };

  const getNoteCenter = (note: Note) => ({
    x: note.x + note.width / 2,
    y: note.y + note.height - 25,
  });

  return (
    <div 
      className="h-screen w-full bg-gray-100 p-4 overflow-hidden relative" 
      onClick={cancelConnection}
    >
      <button 
        onClick={addNote} 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Add Note
      </button>
      <svg ref={svgRef} className="absolute top-0 left-0 h-full w-full pointer-events-none">
        {connections.map((connection, index) => {
          const startNote = notes.find(note => note.id === connection.start);
          const endNote = notes.find(note => note.id === connection.end);
          if (startNote && endNote) {
            const start = getNoteCenter(startNote);
            const end = getNoteCenter(endNote);
            return (
              <line
                key={index}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="black"
                strokeWidth="2"
              />
            );
          }
          return null;
        })}
        {activeConnection !== null && (
          <line
            x1={getNoteCenter(notes.find(note => note.id === activeConnection) || notes[0]).x}
            y1={getNoteCenter(notes.find(note => note.id === activeConnection) || notes[0]).y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="black"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>
      {notes.map((note) => (
        <AnimatedNote
          key={note.id}
          note={note}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onDoubleClick={handleDoubleClick}
          onConnectionEnd={handleConnectionEnd}
          isConnecting={activeConnection !== null}
        />
      ))}
    </div>
  );
};
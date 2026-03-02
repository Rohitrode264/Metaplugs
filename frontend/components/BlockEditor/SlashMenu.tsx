'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading1, Heading2, Type, Image as ImageIcon, Video as VideoIcon, Search, List, Quote, Code } from 'lucide-react';

interface SlashMenuProps {
  onSelect: (type: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const MENU_ITEMS = [
  { id: 'heading-1', label: 'Heading 1', icon: Heading1, description: 'Large section heading', color: 'text-blue-600' },
  { id: 'heading-2', label: 'Heading 2', icon: Heading2, description: 'Medium section heading', color: 'text-indigo-600' },
  { id: 'paragraph', label: 'Text', icon: Type, description: 'Just start writing with plain text', color: 'text-slate-600' },
  { id: 'image', label: 'Image', icon: ImageIcon, description: 'Upload or embed from URL', color: 'text-emerald-600' },
  { id: 'video', label: 'Video', icon: VideoIcon, description: 'Upload a video file', color: 'text-rose-600' },
];

export function SlashMenu({ onSelect, onClose, position }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const filteredItems = MENU_ITEMS.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = position.top;
      let left = position.left;

      // If menu goes below viewport, show it above the cursor
      if (top + rect.height > viewportHeight) {
        top = position.top - rect.height - 20;
      }

      // If menu goes beyond right edge, shift it left
      if (left + rect.width > viewportWidth) {
        left = viewportWidth - rect.width - 20;
      }

      setAdjustedPosition({ top, left });
    }
  }, [position, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        position: 'fixed'
      }}
      className="z-[9999] w-72 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden ring-1 ring-black/5"
    >
      <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Search size={14} className="text-slate-400" />
        <input
          autoFocus
          placeholder="Type to filter..."
          className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-[320px] overflow-y-auto p-1.5 custom-scrollbar">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Basic Blocks</div>
        {filteredItems.map((item, index) => (
          <button
            key={item.id}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-left ${index === selectedIndex
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${index === selectedIndex ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
              <item.icon size={18} className={index === selectedIndex ? 'text-white' : item.color} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{item.label}</div>
              <div className={`text-[11px] truncate ${index === selectedIndex ? 'text-blue-100' : 'text-slate-400'}`}>
                {item.description}
              </div>
            </div>
          </button>
        ))}
        {filteredItems.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-slate-300 mb-1">
              <Search size={24} className="mx-auto" />
            </div>
            <div className="text-sm text-slate-400">No matching blocks</div>
          </div>
        )}
      </div>
      <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-4">
        <div className="text-[10px] text-slate-400 font-medium">
          Use <span className="px-1 bg-white border border-slate-200 rounded">↑↓</span> to navigate
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          <span className="px-1 bg-white border border-slate-200 rounded">Enter</span> to select
        </div>
      </div>
    </motion.div>
  );
}


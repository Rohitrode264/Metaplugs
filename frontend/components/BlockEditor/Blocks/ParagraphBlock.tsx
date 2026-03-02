'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Toolbar } from '../Toolbar';

interface TextSpan {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
}

interface ParagraphBlockProps {
    data: { text: TextSpan[], html?: string };
    style?: { fontSize?: string; lineHeight?: string; color?: string; fontFamily?: string };
    onChange: (data: any, style: any) => void;
    onEnter: () => void;
    onDeleteIfEmpty: () => void;
    onTriggerSlash: (position: { top: number; left: number }) => void;
}

export function ParagraphBlock({ data, style, onChange, onEnter, onDeleteIfEmpty, onTriggerSlash }: ParagraphBlockProps) {
    const editableRef = useRef<HTMLDivElement>(null);
    const [toolbar, setToolbar] = useState<{ open: boolean; pos: { top: number; left: number } }>({
        open: false,
        pos: { top: 0, left: 0 }
    });

    // Sync state to DOM only once on mount or if external data changes drastically
    useEffect(() => {
        if (editableRef.current && data.html && editableRef.current.innerHTML !== data.html) {
            editableRef.current.innerHTML = data.html;
        } else if (editableRef.current && !data.html) {
            // Fallback for old data format
            const text = data.text.map(s => s.text).join('');
            if (editableRef.current.innerText !== text) {
                editableRef.current.innerText = text;
            }
        }
    }, []);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const text = e.currentTarget.innerText;
        const html = e.currentTarget.innerHTML;

        // Check for slash command
        if (text.endsWith('/')) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                onTriggerSlash({ top: rect.bottom, left: rect.left });
            }
        }

        onChange({
            text: [{ text }], // Keep for compatibility
            html: html
        }, style);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter();
        } else if (e.key === 'Backspace' && (editableRef.current?.innerText === '' || editableRef.current?.innerText === '\n')) {
            onDeleteIfEmpty();
        }
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setToolbar({
                open: true,
                pos: { top: rect.top, left: rect.left + rect.width / 2 }
            });
        } else {
            setToolbar({ ...toolbar, open: false });
        }
    };

    const applyFormat = (type: string, value?: any) => {
        document.execCommand('styleWithCSS', false, 'true');
        switch (type) {
            case 'bold':
                document.execCommand('bold', false);
                break;
            case 'italic':
                document.execCommand('italic', false);
                break;
            case 'underline':
                document.execCommand('underline', false);
                break;
            case 'color':
                document.execCommand('foreColor', false, value);
                break;
            case 'fontFamily':
                document.execCommand('fontName', false, value);
                break;
            case 'fontSize':
                // execCommand('fontSize') is weird (1-7), so we use style directly on selection if possible
                // but for simplicity with contentEditable we'll try to wrap in a span
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.fontSize = value;
                    range.surroundContents(span);
                }
                break;
            case 'clear':
                document.execCommand('removeFormat', false);
                break;
        }
        if (editableRef.current) {
            onChange({
                text: [{ text: editableRef.current.innerText }],
                html: editableRef.current.innerHTML
            }, style);
        }
    };

    return (
        <div className="w-full relative group">
            <Toolbar
                isVisible={toolbar.open}
                position={toolbar.pos}
                onFormat={applyFormat}
            />
            <div
                ref={editableRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-[1.5em] bg-transparent border-none focus:ring-0 outline-none text-black leading-relaxed placeholder:text-slate-300 empty:after:content-['Type_/_for_menu...'] empty:after:text-slate-300 transition-all duration-200"
                style={{
                    fontSize: style?.fontSize || '17px',
                    lineHeight: style?.lineHeight || '1.8',
                    color: style?.color || '#000000',
                    fontFamily: style?.fontFamily || 'inherit'
                }}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}


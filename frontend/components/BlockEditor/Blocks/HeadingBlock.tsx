'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Toolbar } from '../Toolbar';
import { cn } from '@/lib/utils';

interface HeadingBlockProps {
    data: { text?: string; html?: string };
    style: { level: number; color?: string; fontFamily?: string };
    onChange: (data: any, style: any) => void;
    onEnter: () => void;
    onDeleteIfEmpty: () => void;
}

export function HeadingBlock({ data, style, onChange, onEnter, onDeleteIfEmpty }: HeadingBlockProps) {
    const editableRef = useRef<HTMLDivElement>(null);
    const level = style.level || 1;
    const [toolbar, setToolbar] = useState<{ open: boolean; pos: { top: number; left: number } }>({
        open: false,
        pos: { top: 0, left: 0 }
    });

    useEffect(() => {
        if (editableRef.current && data.html && editableRef.current.innerHTML !== data.html) {
            editableRef.current.innerHTML = data.html;
        } else if (editableRef.current && !data.html && data.text) {
            editableRef.current.innerText = data.text;
        }
    }, []);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange({
            text: e.currentTarget.innerText,
            html: e.currentTarget.innerHTML
        }, style);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
        } else if (e.key === 'Backspace' && (editableRef.current?.innerText === '' || editableRef.current?.innerText === '\n')) {
            e.preventDefault();
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
            case 'bold': document.execCommand('bold', false); break;
            case 'italic': document.execCommand('italic', false); break;
            case 'underline': document.execCommand('underline', false); break;
            case 'color': document.execCommand('foreColor', false, value); break;
            case 'fontFamily': document.execCommand('fontName', false, value); break;
            case 'fontSize':
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.fontSize = value;
                    range.surroundContents(span);
                }
                break;
            case 'clear': document.execCommand('removeFormat', false); break;
        }
        if (editableRef.current) {
            onChange({
                text: editableRef.current.innerText,
                html: editableRef.current.innerHTML
            }, style);
        }
    };

    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

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
                className={cn(
                    "w-full bg-transparent border-none focus:ring-0 outline-none font-extrabold tracking-tight placeholder:text-slate-200 empty:after:content-['Heading_'] empty:after:text-slate-200",
                    level === 1 ? "text-4xl md:text-5xl mt-8 mb-4" :
                        level === 2 ? "text-3xl md:text-4xl mt-6 mb-3" :
                            "text-2xl md:text-3xl mt-4 mb-2"
                )}
                style={{
                    color: style.color || '#000000',
                    fontFamily: style.fontFamily || 'inherit'
                }}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}

'use client';

import { useState, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';
import { SlashMenu } from './SlashMenu';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface Block {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'video' | 'list';
    data: any;
    style?: any;
}

export default function BlockEditor({ blocks = [], onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
    const [slashMenu, setSlashMenu] = useState<{ open: boolean; pos: { top: number; left: number }; blockId: string | null }>({
        open: false,
        pos: { top: 0, left: 0 },
        blockId: null
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);
            onChange(arrayMove(blocks, oldIndex, newIndex));
        }
    };

    const addBlock = useCallback((type: string, afterId?: string) => {
        const id = `b-${Math.random().toString(36).substr(2, 9)}`;
        let newBlock: Block;

        if (type.startsWith('heading')) {
            newBlock = {
                id,
                type: 'heading',
                data: { text: '', html: '' },
                style: { level: type === 'heading-2' ? 2 : 1, color: '#1f2937' }
            };
        } else if (type === 'image') {
            newBlock = {
                id,
                type: 'image',
                data: { url: '', caption: '' },
                style: { width: '100%', borderRadius: '12px' }
            };
        } else if (type === 'video') {
            newBlock = {
                id,
                type: 'video',
                data: { url: '', caption: '', isEmbed: false },
                style: { width: '100%', borderRadius: '12px' }
            };
        } else {
            newBlock = {
                id,
                type: 'paragraph',
                data: { text: [{ text: '' }], html: '' },
                style: { fontSize: '16px', lineHeight: '1.7' }
            };
        }

        if (afterId) {
            const index = blocks.findIndex(b => b.id === afterId);
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            onChange(newBlocks);
        } else {
            onChange([...blocks, newBlock]);
        }

        setSlashMenu({ open: false, pos: { top: 0, left: 0 }, blockId: null });
    }, [blocks, onChange]);

    const updateBlock = (id: string, data: any, style: any) => {
        onChange(blocks.map(b => b.id === id ? { ...b, data, style } : b));
    };

    const removeBlock = (id: string) => {
        if (blocks.length <= 1) {
            updateBlock(id, { text: [{ text: '' }], html: '' }, { fontSize: '16px', lineHeight: '1.7' });
            return;
        }
        onChange(blocks.filter(b => b.id !== id));
    };

    return (
        <div className="relative min-h-[500px] pb-32">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={blocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {blocks.map((block) => (
                            <SortableBlock
                                key={block.id}
                                id={block.id}
                                block={block}
                                updateBlock={updateBlock}
                                removeBlock={removeBlock}
                                onEnter={() => addBlock('paragraph', block.id)}
                                triggerSlash={(pos: { top: number; left: number }) => setSlashMenu({ open: true, pos, blockId: block.id })}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Premium Add More Button */}
            <div className="mt-8 flex justify-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addBlock('paragraph')}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all font-medium group"
                >
                    <div className="p-1 bg-slate-100 rounded-full group-hover:bg-blue-50 transition-colors">
                        <Plus size={16} />
                    </div>
                    Add content to your post
                </motion.button>
            </div>

            {blocks.length === 0 && (
                <div
                    className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 cursor-text hover:bg-slate-50 transition-colors"
                    onClick={() => addBlock('paragraph')}
                >
                    <p className="text-lg font-medium">Click here to start writing your masterpiece...</p>
                </div>
            )}

            <AnimatePresence>
                {slashMenu.open && (
                    <SlashMenu
                        position={slashMenu.pos}
                        onClose={() => setSlashMenu({ ...slashMenu, open: false })}
                        onSelect={(type) => {
                            if (slashMenu.blockId) {
                                const triggerBlock = blocks.find(b => b.id === slashMenu.blockId);
                                const isSlashOnly = triggerBlock?.type === 'paragraph' &&
                                    (triggerBlock.data.text?.[0]?.text === '/' || triggerBlock.data.html === '/' || triggerBlock.data.html === '/<br>');

                                if (isSlashOnly) {
                                    const id = `b-${Math.random().toString(36).substr(2, 9)}`;
                                    let newBlock: Block;

                                    if (type.startsWith('heading')) {
                                        newBlock = {
                                            id,
                                            type: 'heading',
                                            data: { text: '', html: '' },
                                            style: { level: type === 'heading-2' ? 2 : 1, color: '#1f2937' }
                                        };
                                    } else if (type === 'image') {
                                        newBlock = {
                                            id,
                                            type: 'image',
                                            data: { url: '', caption: '' },
                                            style: { width: '100%', borderRadius: '12px' }
                                        };
                                    } else if (type === 'video') {
                                        newBlock = {
                                            id,
                                            type: 'video',
                                            data: { url: '', caption: '', isEmbed: false },
                                            style: { width: '100%', borderRadius: '12px' }
                                        };
                                    } else {
                                        newBlock = {
                                            id,
                                            type: 'paragraph',
                                            data: { text: [{ text: '' }], html: '' },
                                            style: { fontSize: '16px', lineHeight: '1.7' }
                                        };
                                    }

                                    const newBlocks = blocks.map(b => b.id === slashMenu.blockId ? newBlock : b);
                                    onChange(newBlocks);
                                    setSlashMenu({ open: false, pos: { top: 0, left: 0 }, blockId: null });
                                } else {
                                    addBlock(type, slashMenu.blockId);
                                }
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

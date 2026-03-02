'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { HeadingBlock } from './Blocks/HeadingBlock';
import { ParagraphBlock } from './Blocks/ParagraphBlock';
import { ImageBlock } from './Blocks/ImageBlock';
import { VideoBlock } from './Blocks/VideoBlock';

export function SortableBlock({ id, block, updateBlock, removeBlock, onEnter, triggerSlash }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleChange = (data: any, style: any) => {
        updateBlock(id, data, style);
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-1 items-start group mb-1 relative">
            <div
                {...attributes}
                {...listeners}
                className="mt-2 p-1.5 opacity-0 group-hover:opacity-100 cursor-grab text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded transition-all"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex-1 min-w-0">
                {block.type === 'heading' && (
                    <HeadingBlock
                        data={block.data}
                        style={block.style}
                        onChange={handleChange}
                        onEnter={onEnter}
                        onDeleteIfEmpty={() => removeBlock(id)}
                    />
                )}

                {block.type === 'paragraph' && (
                    <ParagraphBlock
                        data={block.data}
                        style={block.style}
                        onChange={handleChange}
                        onEnter={onEnter}
                        onDeleteIfEmpty={() => removeBlock(id)}
                        onTriggerSlash={triggerSlash}
                    />
                )}

                {block.type === 'image' && (
                    <ImageBlock
                        data={block.data}
                        style={block.style}
                        onChange={handleChange}
                        onDelete={() => removeBlock(id)}
                    />
                )}

                {block.type === 'video' && (
                    <VideoBlock
                        data={block.data}
                        style={block.style}
                        onChange={handleChange}
                        onDelete={() => removeBlock(id)}
                    />
                )}
            </div>

            <button
                onClick={() => removeBlock(id)}
                className="mt-2 p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

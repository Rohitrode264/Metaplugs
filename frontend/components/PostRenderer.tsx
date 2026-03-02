'use client';

import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface Block {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'video' | 'list' | 'h1' | 'h2' | 'h3';
    data: any;
    style?: any;
}

interface PostRendererProps {
    blocks: Block[];
}

export default function PostRenderer({ blocks }: PostRendererProps) {
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0 || (blocks.length === 1 && !blocks[0].data?.html && !blocks[0].data?.text)) {
        return (
            <div className="py-20 text-center space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                    <Eye size={24} />
                </div>
                <p className="text-slate-300 font-medium text-sm tracking-tight italic">Content empty. Start typing to see the magic happen...</p>
            </div>
        )
    }

    const renderText = (data: any) => {
        if (data.html) return data.html;
        if (Array.isArray(data.text)) {
            // Handle the array format: [{"text": "...", "bold": true, ...}]
            return data.text.map((span: any) => {
                let content = span.text;
                if (span.bold) content = `<strong>${content}</strong>`;
                if (span.italic) content = `<em>${content}</em>`;
                if (span.underline) content = `<u>${content}</u>`;
                if (span.color) content = `<span style="color: ${span.color}">${content}</span>`;
                return content;
            }).join('');
        }
        return data.text || '';
    };

    return (
        <div className="prose prose-slate max-w-none">
            {blocks.map((block) => (
                <div key={block.id} className="mb-8 last:mb-0">
                    {/* Render Paragraphs and Headings */}
                    {(block.type === 'paragraph' || block.type === 'heading' || ['h1', 'h2', 'h3'].includes(block.type)) && (
                        <div
                            className={cn(
                                "text-black break-words",
                                // Heading level 1
                                (block.type === 'h1' || (block.type === 'heading' && block.style?.level === 1)) &&
                                "text-4xl md:text-5xl font-black tracking-tight mb-6 mt-8",
                                // Heading level 2
                                (block.type === 'h2' || (block.type === 'heading' && block.style?.level === 2)) &&
                                "text-2xl md:text-3xl font-black tracking-tight mb-4 mt-6",
                                // Heading level 3
                                (block.type === 'h3' || (block.type === 'heading' && block.style?.level === 3)) &&
                                "text-xl md:text-2xl font-bold tracking-tight mb-3 mt-4",
                                // Standard Paragraph
                                block.type === 'paragraph' && "text-lg leading-relaxed"
                            )}
                            style={{
                                color: block.style?.color || 'inherit',
                                fontSize: block.style?.fontSize || 'inherit',
                                fontFamily: block.style?.fontFamily || 'inherit'
                            }}
                            dangerouslySetInnerHTML={{ __html: renderText(block.data) }}
                        />
                    )}

                    {/* Render Image Block */}
                    {block.type === 'image' && block.data?.url && (
                        <figure className="my-10 animate-in fade-in slide-in-from-bottom-5 duration-700 select-none">
                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
                                <img
                                    src={block.data.url}
                                    alt={block.data.caption || 'Post image'}
                                    className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700"
                                />
                            </div>
                            {block.data.caption && (
                                <figcaption className="text-center text-slate-400 text-sm mt-6 italic font-medium">
                                    {block.data.caption}
                                </figcaption>
                            )}
                        </figure>
                    )}

                    {/* Render Video Block */}
                    {block.type === 'video' && block.data?.url && (
                        <div className="my-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {block.data.isEmbed ? (
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={block.data.url}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            ) : (
                                <video
                                    src={block.data.url}
                                    controls
                                    className="w-full aspect-video object-cover"
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

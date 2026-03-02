'use client';

import React, { useState } from 'react';
import { UploadCloud, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabaseClient';

interface CoverImageSelectorProps {
    url: string;
    onChange: (url: string) => void;
}

export default function CoverImageSelector({ url, onChange }: CoverImageSelectorProps) {
    const [method, setMethod] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('metaplugBuckets')
                .upload(filePath, file);

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error("Storage bucket 'metaplugBuckets' not found. Please create a public bucket named 'metaplugBuckets' in your Supabase Dashboard.");
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('metaplugBuckets')
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (error: any) {
            alert('Error uploading file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Cover Story Image</label>
                {!url && (
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setMethod('url')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                method === 'url' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >URL</button>
                        <button
                            type="button"
                            onClick={() => setMethod('upload')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                method === 'upload' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >Upload</button>
                    </div>
                )}
            </div>

            {url ? (
                <div className="relative rounded-[2.5rem] overflow-hidden aspect-video md:aspect-[21/9] group shadow-2xl border-4 border-white">
                    <img src={url} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-4 bg-red-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {method === 'url' ? (
                        <div className="relative group/input">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors">
                                <LinkIcon size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Paste cover image URL here..."
                                className="w-full pl-14 pr-6 py-8 bg-white border-2 border-slate-100 rounded-[2rem] text-black font-medium focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = (e.target as HTMLInputElement).value;
                                        if (val) onChange(val);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center p-20 border-3 border-dashed border-slate-100 rounded-[3rem] bg-white hover:bg-slate-50 hover:border-blue-200 transition-all cursor-pointer group shadow-sm">
                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-lg",
                                uploading ? "bg-blue-100 animate-pulse text-blue-600" : "bg-blue-50 text-blue-500"
                            )}>
                                <UploadCloud size={40} />
                            </div>
                            <p className="text-slate-900 font-black text-lg mb-2">Upload from laptop</p>
                            <p className="text-slate-400 text-sm font-medium">JPG, PNG, WebP or AVIF supported</p>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}

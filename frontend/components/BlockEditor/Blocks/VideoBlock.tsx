'use client';

import React, { useState } from 'react';
import { Video as VideoIcon, X, UploadCloud, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface VideoBlockProps {
    data: { url: string; caption?: string; isEmbed?: boolean };
    style?: { width?: string; borderRadius?: string };
    onChange: (data: any, style: any) => void;
    onDelete: () => void;
}

export function VideoBlock({ data, style, onChange, onDelete }: VideoBlockProps) {
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const supabase = createClient();

    const getEmbedUrl = (url: string) => {
        if (!url) return null;

        // YouTube
        const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

        // Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

        return null;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file.');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `blog-videos/${fileName}`;

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

            onChange({ ...data, url: publicUrl, isEmbed: false }, style);
        } catch (error: any) {
            alert('Error uploading video: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleEmbedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimUrl = urlInput.trim();
        if (!trimUrl) return;

        const embedUrl = getEmbedUrl(trimUrl);
        if (embedUrl) {
            onChange({ ...data, url: embedUrl, isEmbed: true }, style);
        } else {
            // Check if it's likely a direct video link
            const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(trimUrl) || trimUrl.includes('supabase.co');
            onChange({ ...data, url: trimUrl, isEmbed: !isDirectVideo }, style);
        }
    };

    const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, caption: e.target.value }, style);
    };

    const isYouTube = data.url?.includes('youtube.com') || data.url?.includes('youtu.be');

    return (
        <div className="group relative w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 transition-all hover:border-slate-300">
            <button
                onClick={onDelete}
                className="absolute top-2 right-2 p-1.5 bg-white shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 text-slate-400 hover:text-red-500 hover:scale-110"
            >
                <X size={16} />
            </button>

            {data.url ? (
                <div className="p-2">
                    {data.isEmbed ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-sm">
                            <iframe
                                src={data.url}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <video
                            src={data.url}
                            controls
                            className="w-full h-auto rounded-lg shadow-sm"
                            style={{
                                width: style?.width || '100%',
                                borderRadius: style?.borderRadius || '12px'
                            }}
                        />
                    )}
                    <input
                        className="w-full mt-3 bg-transparent text-center text-sm text-slate-500 italic border-none focus:ring-0 outline-none"
                        placeholder="Write a video caption..."
                        value={data.caption || ''}
                        onChange={handleCaptionChange}
                    />
                </div>
            ) : (
                <div className="p-12 space-y-8">
                    <label className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />

                        <div className="p-5 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                            {uploading ? (
                                <Loader2 size={32} className="animate-spin" />
                            ) : (
                                <VideoIcon size={32} />
                            )}
                        </div>

                        <div className="text-center">
                            <p className="font-semibold text-slate-700">
                                {uploading ? 'Uploading your video...' : 'Click to upload video'}
                            </p>
                        </div>
                    </label>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-50 px-2 text-slate-400 font-bold">Or Embed Link</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmbedSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste YouTube or Vimeo URL..."
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors"
                        >
                            Embed
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

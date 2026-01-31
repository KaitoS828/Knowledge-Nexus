import React, { useState, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { useToast } from './ui/Toast';
import { processDocument } from '@/services/pdfService';
import { Upload, FileText, Loader2, Trash2, File, CheckCircle, X, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { UpgradeModal } from './UpgradeModal';

export const DocumentUploader: React.FC = () => {
    const { documents, addDocument, deleteDocument } = useAppStore();
    const { addToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const selectedDoc = documents.find(d => d.id === selectedDocId);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const file = files[0];
        // 簡易チェック (PDFのみ)
        if (file.type !== 'application/pdf') {
            addToast({ type: 'error', message: 'PDFファイルのみアップロード可能です' });
            return;
        }

        setIsUploading(true);
        try {
            const result = await processDocument(file);
            
            await addDocument({
                id: crypto.randomUUID(),
                name: file.name,
                type: 'pdf',
                content: result.content,
                summary: result.summary,
                keyPoints: result.keyPoints,
                chapters: result.chapters,
                addedAt: new Date().toISOString(),
                fileSize: file.size
            });
            addToast({ type: 'success', message: `「${file.name}」の分析が完了しました` });
        } catch (e: any) {
            console.error(e);
            if (e.message === 'Storage limit reached') {
                setShowUpgradeModal(true);
            } else {
                addToast({ type: 'error', message: 'アップロードまたは分析に失敗しました。Gemini API Key設定を確認してください' });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex h-screen bg-nexus-50 overflow-hidden">
            {/* List Sidebar */}
            <div className="w-80 border-r border-nexus-200 bg-white flex flex-col shrink-0">
                <div className="p-6 border-b border-nexus-200">
                    <h2 className="text-xl font-bold text-nexus-900 flex items-center gap-2 mb-4">
                        <FileText className="text-nexus-600" /> ドキュメント
                    </h2>
                    
                    <div 
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                            dragActive ? "border-nexus-accent bg-blue-50" : "border-nexus-300 hover:border-nexus-400 hover:bg-nexus-50"
                        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept=".pdf" 
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-nexus-accent" />
                                <span className="text-xs text-nexus-500">AIが分析中...</span>
                                <span className="text-[10px] text-nexus-400">数十秒かかる場合があります</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-nexus-400">
                                <Upload size={24} />
                                <span className="text-xs font-bold">PDFをアップロード</span>
                                <span className="text-[10px]">ドラッグ&ドロップ可</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {documents.length === 0 && (
                        <div className="text-center text-nexus-400 mt-10 text-xs">
                            ドキュメントがありません
                        </div>
                    )}
                    {documents.map(doc => (
                        <div 
                            key={doc.id} 
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                                selectedDocId === doc.id 
                                ? "bg-nexus-50 border-nexus-accent shadow-sm" 
                                : "bg-white border-nexus-200 hover:border-nexus-300 hover:shadow-sm"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                    <File size={16} />
                                </div>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const docToDelete = doc;
                                        deleteDocument(doc.id);
                                        if(selectedDocId===doc.id) setSelectedDocId(null); 
                                        addToast({
                                            type: 'info',
                                            message: 'ドキュメントを削除しました',
                                            duration: 5000,
                                            onUndo: () => addDocument(docToDelete)
                                        });
                                    }}
                                    className="text-nexus-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <h3 className="text-sm font-bold text-nexus-900 mb-1 line-clamp-2">{doc.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] text-nexus-400 font-mono">
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>{new Date(doc.addedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-nexus-50 flex flex-col overflow-hidden relative">
                {selectedDoc ? (
                    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                        <div className="bg-white rounded-3xl shadow-sm border border-nexus-200 overflow-hidden mb-8">
                            <div className="p-8 border-b border-nexus-100 bg-gradient-to-r from-white to-nexus-50">
                                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold tracking-wide mb-4">
                                    AI ANALYSIS
                                </span>
                                <h1 className="text-3xl font-bold text-nexus-900 mb-4 leading-tight">{selectedDoc.name}</h1>
                                <div className="flex gap-6 text-sm text-nexus-500">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} />
                                        <span>{selectedDoc.type.toUpperCase()} DOCUMENT</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <span>AI要約完了</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Summary Column */}
                                <div className="md:col-span-2 space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-nexus-900 mb-4 flex items-center gap-2">
                                            <FileText className="text-nexus-600" /> 要約
                                        </h3>
                                        <div className="bg-nexus-50 p-6 rounded-2xl text-nexus-700 leading-relaxed text-sm">
                                            {selectedDoc.summary}
                                        </div>
                                    </section>

                                    {selectedDoc.chapters && selectedDoc.chapters.length > 0 && (
                                        <section>
                                            <h3 className="text-lg font-bold text-nexus-900 mb-4">章ごとの詳細</h3>
                                            <div className="space-y-4">
                                                {selectedDoc.chapters.map((chapter, idx) => (
                                                    <div key={idx} className="border border-nexus-200 rounded-xl p-5 hover:bg-nexus-50 transition-colors">
                                                        <h4 className="font-bold text-nexus-800 mb-2">{chapter.title}</h4>
                                                        <p className="text-sm text-nexus-600 leading-relaxed mb-3">{chapter.content}</p>
                                                        <div className="text-xs text-nexus-500 bg-white p-3 rounded-lg border border-nexus-100">
                                                            <strong className="block mb-1 text-nexus-700">要点:</strong>
                                                            {chapter.summary}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Key Points Column */}
                                <div className="space-y-6">
                                    <div className="bg-nexus-900 text-white p-6 rounded-2xl shadow-lg">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <CheckCircle className="text-green-400" /> 重要ポイント
                                        </h3>
                                        <ul className="space-y-3">
                                            {selectedDoc.keyPoints.map((point, idx) => (
                                                <li key={idx} className="flex gap-3 text-sm leading-relaxed text-nexus-100">
                                                    <span className="text-nexus-500 font-bold select-none">{idx + 1}.</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="border border-nexus-200 p-6 rounded-2xl bg-white">
                                        <h3 className="text-sm font-bold text-nexus-900 mb-3">元ファイル情報</h3>
                                        <div className="text-xs text-nexus-500 table w-full">
                                            <div className="table-row">
                                                <div className="table-cell py-1">追加日</div>
                                                <div className="table-cell py-1 text-right font-mono">{new Date(selectedDoc.addedAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="table-row">
                                                <div className="table-cell py-1">サイズ</div>
                                                <div className="table-cell py-1 text-right font-mono">{formatFileSize(selectedDoc.fileSize)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-nexus-300">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p className="font-bold">ドキュメントを選択またはアップロード</p>
                    </div>
                )}
            </div>
            
            <UpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
            />
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Download, Check, Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import './popup.css';

const Popup = () => {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [pageData, setPageData] = useState<any>(null);

    useEffect(() => {
        // Get current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: "extract" }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Fallback: just use tab info
                        setPageData({ title: tab.title, url: tab.url, content: "" });
                    } else {
                        setPageData(response);
                    }
                });
            }
        });
    }, []);

    const handleSave = async () => {
        if (!pageData) return;
        setStatus('saving');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) {
                setStatus('error');
                alert("Login required in Knowledge Nexus app (or Extension context).");
                return;
            }

            const newId = crypto.randomUUID();
            const now = new Date().toISOString();

            const { error } = await supabase.from('articles').insert({
                id: newId,
                user_id: session.user.id,
                url: pageData.url,
                title: pageData.title,
                summary: "Imported from Extension (Pending Analysis)",
                content: pageData.content,
                practice_guide: '',
                status: 'new',
                frequent_words: [],
                tags: [],
                added_at: now,
                analysis_status: 'pending',
                analysis_progress: 0
            });

            if (error) throw error;

            setStatus('saved');
        } catch (e: any) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div style={{ padding: '16px', width: '300px', fontFamily: 'sans-serif' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px', fontSize: '18px' }}>
                <span style={{ background: 'black', color: 'white', padding: '4px', borderRadius: '4px' }}>N</span>
                Knowledge Nexus
            </h2>

            {pageData ? (
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Saving:</p>
                    <p style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: '1.4' }}>{pageData.title}</p>
                </div>
            ) : (
                <p>Loading page info...</p>
            )}

            <button
                onClick={handleSave}
                disabled={status === 'saving' || status === 'saved' || !pageData}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: status === 'saved' ? '#10b981' : '#000',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                {status === 'idle' && <><Download size={16} /> Save to Nexus</>}
                {status === 'saving' && <><Loader2 size={16} className="animate-spin" /> Saving...</>}
                {status === 'saved' && <><Check size={16} /> Saved!</>}
                {status === 'error' && "Error"}
            </button>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useAppStore } from '../store';
import { generateKnowledgeGraph } from '../services/geminiService';
import { GraphData } from '../types';

export const KnowledgeGraph: React.FC = () => {
  const { brain } = useAppStore();
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGraph = async () => {
      setLoading(true);
      const graphData = await generateKnowledgeGraph(brain.content);
      setData(graphData);
      setLoading(false);
    };
    loadGraph();
  }, [brain.content]);

  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setDimensions({ w: window.innerWidth - 80, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 h-screen bg-nexus-50 flex items-center justify-center">
        <div className="text-nexus-900 animate-pulse font-bold">シナプスを生成中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-nexus-50 h-screen overflow-hidden relative">
      <div className="absolute top-6 left-6 z-10 bg-white/90 p-5 rounded-2xl border border-nexus-200 backdrop-blur shadow-lg">
        <h2 className="text-nexus-900 font-bold text-lg">ニューラルマップ</h2>
        <p className="text-xs text-nexus-500 font-medium">{data.nodes.length} 個の概念を可視化</p>
      </div>
      
      <ForceGraph2D
        width={dimensions.w}
        height={dimensions.h}
        graphData={data}
        nodeLabel="id"
        nodeColor={(node: any) => {
          // Lighter, more vibrant colors for light mode
          const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
          return colors[node.group % colors.length];
        }}
        nodeVal={(node: any) => node.val}
        linkColor={() => "#cbd5e1"} // Light gray links
        backgroundColor="#f8fafc" // nexus-50
        nodeRelSize={6}
        linkWidth={1.5}
        onNodeClick={node => {
          console.log(node);
        }}
      />
    </div>
  );
};
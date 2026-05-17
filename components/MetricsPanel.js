"use client";

import React, { useMemo } from 'react';
import { Share2, Users, Network, TrendingUp, Activity, Link2 } from 'lucide-react';

export default function MetricsPanel({ data, selectedNode }) {
  const { nodes, links } = data || { nodes: [], links: [] };

  const topCentral = useMemo(() => {
    if (!nodes.length) return [];
    return [...nodes].sort((a, b) => b.degreeCentrality - a.degreeCentrality).slice(0, 5);
  }, [nodes]);

  const topBetweenness = useMemo(() => {
    if (!nodes.length) return [];
    return [...nodes].sort((a, b) => b.betweennessCentrality - a.betweennessCentrality).slice(0, 5);
  }, [nodes]);
  
  const numCommunities = useMemo(() => {
    if (!nodes.length) return 0;
    return new Set(nodes.map(n => n.community)).size;
  }, [nodes]);

  const density = useMemo(() => {
    if (!nodes.length) return 0;
    const maxEdges = (nodes.length * (nodes.length - 1)) / 2;
    return links.length / maxEdges;
  }, [nodes, links]);

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
      
      {selectedNode && (
        <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 border border-blue-500/30 shadow-lg backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Selected Legislator
          </h2>
          <div className="space-y-3">
            <p className="text-2xl font-bold text-blue-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              {selectedNode.name}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-blue-200/70 uppercase tracking-wider font-semibold mb-1">Degree</p>
                <p className="text-lg text-white font-medium">{(selectedNode.degreeCentrality || 0).toFixed(3)}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-indigo-200/70 uppercase tracking-wider font-semibold mb-1">Betweenness</p>
                <p className="text-lg text-white font-medium">{(selectedNode.betweennessCentrality || 0).toFixed(3)}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-purple-200/70 uppercase tracking-wider font-semibold mb-1">Community Bloc</p>
                <p className="text-lg text-white font-medium">#{selectedNode.community}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-pink-200/70 uppercase tracking-wider font-semibold mb-1">Shared Bills</p>
                <p className="text-lg text-white font-medium">{selectedNode.billsCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/60 shadow-lg backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Network Overview
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/40 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-700/50">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-3xl font-bold text-white">{nodes.length}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Senators</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-700/50">
            <Link2 className="w-6 h-6 text-pink-400 mb-2" />
            <p className="text-3xl font-bold text-white">{links.length}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Connections</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-700/50">
            <Network className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-3xl font-bold text-white">{numCommunities}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Political Blocs</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-700/50">
            <Share2 className="w-6 h-6 text-emerald-400 mb-2" />
            <p className="text-3xl font-bold text-white">{(density * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Density</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-400" /> 
              Most Collaborative (Degree)
            </h3>
            <div className="space-y-3">
              {topCentral.map((node, i) => (
                <div key={node.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                      {i + 1}
                    </span>
                    <span className="text-gray-200 font-medium group-hover:text-blue-300 transition-colors">{node.name}</span>
                  </div>
                  <span className="text-sm font-mono text-blue-400 bg-blue-950/50 px-2 py-1 rounded">
                    {node.degreeCentrality.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Network className="w-4 h-4 text-pink-400" /> 
              Key Bridge Actors (Betweenness)
            </h3>
            <div className="space-y-3">
              {topBetweenness.map((node, i) => (
                <div key={node.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold border border-pink-500/30">
                      {i + 1}
                    </span>
                    <span className="text-gray-200 font-medium group-hover:text-pink-300 transition-colors">{node.name}</span>
                  </div>
                  <span className="text-sm font-mono text-pink-400 bg-pink-950/50 px-2 py-1 rounded">
                    {node.betweennessCentrality.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

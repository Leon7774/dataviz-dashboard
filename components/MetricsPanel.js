"use client";

import React, { useMemo, useState } from 'react';
import { Share2, Users, Network, TrendingUp, Activity, Link2, Search, Copy, Check, X, Info, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { PARTY_MAP, PARTY_COLORS, METRIC_EXPLANATIONS, COLOR_IMPLICATIONS } from './constants';

export default function MetricsPanel({ data, selectedNode }) {
  const { nodes, links } = data || { nodes: [], links: [] };

  const [showAllDegree, setShowAllDegree] = useState(false);
  const [showAllBetweenness, setShowAllBetweenness] = useState(false);

  // Modal states for Research and Development (RaD) Centrality directory
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'degreeCentrality', direction: 'descending' });
  const [copied, setCopied] = useState(false);

  const handleSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredNodes = useMemo(() => {
    let result = [...nodes];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.name.toLowerCase().includes(q) || 
        (PARTY_MAP[n.id] || '').toLowerCase().includes(q)
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle party sorting
        if (sortConfig.key === 'party') {
          aVal = PARTY_MAP[a.id] || '';
          bVal = PARTY_MAP[b.id] || '';
        }
        
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [nodes, searchQuery, sortConfig]);

  const copyCSV = () => {
    const headers = "Senator,Party,Bloc,Degree Centrality,Betweenness Centrality,Shared Bills\n";
    const rows = nodes.map(n => 
      `"${n.name}","${PARTY_MAP[n.id] || 'Independent'}",${n.community},${n.degreeCentrality.toFixed(6)},${n.betweennessCentrality.toFixed(6)},${n.billsCount}`
    ).join("\n");
    navigator.clipboard.writeText(headers + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topCentral = useMemo(() => {
    if (!nodes.length) return [];
    const sorted = [...nodes].sort((a, b) => b.degreeCentrality - a.degreeCentrality);
    return showAllDegree ? sorted : sorted.slice(0, 5);
  }, [nodes, showAllDegree]);

  const topBetweenness = useMemo(() => {
    if (!nodes.length) return [];
    const sorted = [...nodes].sort((a, b) => b.betweennessCentrality - a.betweennessCentrality);
    return showAllBetweenness ? sorted : sorted.slice(0, 5);
  }, [nodes, showAllBetweenness]);
  
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
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Selected Legislator
          </h2>
          <div className="space-y-3 text-left">
            <div>
              <p className="text-2xl font-bold text-blue-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 leading-tight">
                {selectedNode.name}
              </p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                {PARTY_MAP[selectedNode.id] || 'Independent'}
              </span>
            </div>
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
        <div className="flex items-center justify-between mb-6 gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Network Overview
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Research Directory</span>
          </button>
        </div>
        
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
            <div className="space-y-2.5">
              {topCentral.map((node, i) => {
                const isSelected = selectedNode && selectedNode.id === node.id;
                return (
                  <div key={node.id} className={`flex items-center justify-between group p-1.5 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'bg-blue-500/15 border-l-2 border-blue-500 pl-2.5 text-white font-medium' 
                      : 'hover:bg-gray-800/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        isSelected 
                          ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20' 
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`text-sm font-medium transition-colors ${
                        isSelected ? 'text-white' : 'text-gray-300 group-hover:text-blue-300'
                      }`}>{node.name}</span>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded transition-all ${
                      isSelected ? 'text-blue-300 bg-blue-950/60 font-semibold' : 'text-blue-400 bg-blue-950/50'
                    }`}>
                      {node.degreeCentrality.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
            {nodes.length > 5 && (
              <button
                onClick={() => setShowAllDegree(!showAllDegree)}
                className="mt-3 w-full py-1.5 px-3 rounded-xl border border-gray-800/80 bg-gray-800/10 hover:bg-gray-800/30 hover:border-gray-700/60 hover:text-blue-400 transition-all text-xs font-semibold text-gray-400 cursor-pointer"
              >
                {showAllDegree ? 'Show Less' : `Show All (${nodes.length})`}
              </button>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-800/80 to-transparent"></div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Network className="w-4 h-4 text-pink-400" /> 
              Key Bridge Actors (Betweenness)
            </h3>
            <div className="space-y-2.5">
              {topBetweenness.map((node, i) => {
                const isSelected = selectedNode && selectedNode.id === node.id;
                return (
                  <div key={node.id} className={`flex items-center justify-between group p-1.5 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'bg-pink-500/15 border-l-2 border-pink-500 pl-2.5 text-white font-medium' 
                      : 'hover:bg-gray-800/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        isSelected 
                          ? 'bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/20' 
                          : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`text-sm font-medium transition-colors ${
                        isSelected ? 'text-white' : 'text-gray-300 group-hover:text-pink-300'
                      }`}>{node.name}</span>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded transition-all ${
                      isSelected ? 'text-pink-300 bg-pink-950/60 font-semibold' : 'text-pink-400 bg-pink-950/50'
                    }`}>
                      {node.betweennessCentrality.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
            {nodes.length > 5 && (
              <button
                onClick={() => setShowAllBetweenness(!showAllBetweenness)}
                className="mt-3 w-full py-1.5 px-3 rounded-xl border border-gray-800/80 bg-gray-800/10 hover:bg-gray-800/30 hover:border-gray-700/60 hover:text-pink-400 transition-all text-xs font-semibold text-gray-400 cursor-pointer"
              >
                {showAllBetweenness ? 'Show Less' : `Show All (${nodes.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Research Directory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-gray-900/95 rounded-2xl border border-gray-800/80 w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <SlidersHorizontal className="w-6 h-6 text-blue-400" />
                  Legislator Centrality Directory (RaD)
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Analyze all 19th Congress ICT bill sponsorship and network metrics. Search, sort, or copy data as CSV.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-850 hover:bg-gray-800 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Action Bar */}
            <div className="px-6 py-4 bg-gray-950/40 border-b border-gray-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Senator or political party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition-all placeholder-gray-500"
                />
              </div>

              {/* Copy CSV Button */}
              <button
                onClick={copyCSV}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-750 border border-gray-700/50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span className="text-emerald-400">CSV Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-300" />
                    <span>Copy CSV to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Table Area */}
            <div className="flex-1 overflow-auto p-6 min-h-0 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th 
                      onClick={() => handleSort('name')}
                      className="pb-3 hover:text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        Senator
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('party')}
                      className="pb-3 hover:text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        Party
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('community')}
                      className="pb-3 hover:text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        Bloc
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('degreeCentrality')}
                      className="pb-3 text-right hover:text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Degree
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('betweennessCentrality')}
                      className="pb-3 text-right hover:text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Betweenness
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('billsCount')}
                      className="pb-3 text-right hover:text-white cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Shared Bills
                        <ArrowUpDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-sm">
                  {sortedAndFilteredNodes.length > 0 ? (
                    sortedAndFilteredNodes.map((node) => {
                      const isSelected = selectedNode && selectedNode.id === node.id;
                      const party = PARTY_MAP[node.id] || 'Independent';
                      const partyColor = PARTY_COLORS[party] || '#6b7280';
                      
                      return (
                        <tr 
                          key={node.id} 
                          className={`group transition-all ${
                            isSelected 
                              ? 'bg-blue-500/10 text-white font-medium border-l-2 border-blue-500 pl-4' 
                              : 'hover:bg-gray-800/20 text-gray-300'
                          }`}
                        >
                          <td className="py-3 px-1 font-medium group-hover:text-blue-300 transition-colors">
                            {node.name}
                          </td>
                          <td className="py-3 px-1">
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                              style={{ 
                                backgroundColor: `${partyColor}15`, 
                                borderColor: `${partyColor}40`,
                                color: partyColor
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: partyColor }} />
                              {party}
                            </span>
                          </td>
                          <td className="py-3 px-1 text-gray-400">
                            Bloc #{node.community}
                          </td>
                          <td className="py-3 px-1 text-right font-mono text-xs">
                            {node.degreeCentrality.toFixed(4)}
                          </td>
                          <td className="py-3 px-1 text-right font-mono text-xs">
                            {node.betweennessCentrality.toFixed(4)}
                          </td>
                          <td className="py-3 px-1 text-right font-mono text-xs text-blue-400 font-semibold">
                            {node.billsCount}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No senators match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Insights Footer */}
            <div className="p-5 bg-gray-950/50 border-t border-gray-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-2.5 items-start text-xs text-gray-400 leading-relaxed">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-300 block mb-0.5">{METRIC_EXPLANATIONS.degree.title}</span>
                  {METRIC_EXPLANATIONS.degree.description}
                </div>
              </div>
              <div className="flex gap-2.5 items-start text-xs text-gray-400 leading-relaxed">
                <Info className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-300 block mb-0.5">{METRIC_EXPLANATIONS.betweenness.title}</span>
                  {METRIC_EXPLANATIONS.betweenness.description}
                </div>
              </div>
              <div className="flex gap-2.5 items-start text-xs text-gray-400 leading-relaxed">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-300 block mb-0.5">{COLOR_IMPLICATIONS.party.title} vs. Blocs</span>
                  Cross-partisan co-sponsorship is indicated when senators from different party lists cluster into the same Collaboration Bloc.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

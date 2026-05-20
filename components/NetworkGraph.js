"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { PARTY_MAP, PARTY_COLORS, COMMUNITY_COLORS, COLOR_IMPLICATIONS } from './constants';

export default function NetworkGraph({ data, onNodeClick, selectedNode }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [colorMode, setColorMode] = useState('community'); // 'community' | 'party'
  const [sizeMode, setSizeMode] = useState('bills'); // 'bills' | 'degree'

  useEffect(() => {
    // Make it responsive
    const updateDimensions = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      // Add more spacing between nodes by increasing repulsion and link distance
      fgRef.current.d3Force('charge').strength(-250);
      fgRef.current.d3Force('link').distance(60);
    }
  }, [data]);

  // Compute stats for scaling
  const stats = useMemo(() => {
    if (!data || !data.nodes || !data.nodes.length) {
      return { minBills: 1, maxBills: 172, minDegree: 0, maxDegree: 1 };
    }
    const bills = data.nodes.map(n => n.billsCount || 0);
    const degrees = data.nodes.map(n => n.degreeCentrality || 0);
    return {
      minBills: Math.min(...bills),
      maxBills: Math.max(...bills),
      minDegree: Math.min(...degrees),
      maxDegree: Math.max(...degrees)
    };
  }, [data]);

  // Get size of node based on active sizeMode
  const getNodeSize = (node) => {
    const minSize = 4;
    const maxSize = 22; // Increased max size for better visual distinction
    if (sizeMode === 'bills') {
      const bills = node.billsCount || 0;
      const { minBills, maxBills } = stats;
      if (maxBills === minBills) return 10;
      // Linear scaling makes the difference in bill counts visually accurate and obvious in one glance
      const ratio = (bills - minBills) / (maxBills - minBills);
      return minSize + ratio * (maxSize - minSize);
    } else {
      const degree = node.degreeCentrality || 0;
      const { minDegree, maxDegree } = stats;
      if (maxDegree === minDegree) return 10;
      const ratio = (degree - minDegree) / (maxDegree - minDegree);
      return minSize + ratio * (maxSize - minSize);
    }
  };

  // Get color of node based on active colorMode
  const getNodeColor = (node) => {
    if (colorMode === 'party') {
      const party = PARTY_MAP[node.id] || 'Independent';
      return PARTY_COLORS[party] || '#6b7280';
    } else {
      return COMMUNITY_COLORS[node.community % COMMUNITY_COLORS.length];
    }
  };

  return (
    <div id="graph-container" className="w-full h-full relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-md border border-gray-800/50 shadow-2xl">
      {/* Floating Controls Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        {/* Color Mode Segmented Control */}
        <div className="bg-gray-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-800/80 shadow-lg flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Color:</span>
          <div className="flex bg-gray-950/60 rounded-lg p-0.5 border border-gray-800/80">
            <button
              onClick={() => setColorMode('community')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                colorMode === 'community'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Blocs
            </button>
            <button
              onClick={() => setColorMode('party')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                colorMode === 'party'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Parties
            </button>
          </div>
        </div>

        {/* Size Mode Segmented Control */}
        <div className="bg-gray-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-800/80 shadow-lg flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Size:</span>
          <div className="flex bg-gray-950/60 rounded-lg p-0.5 border border-gray-800/80">
            <button
              onClick={() => setSizeMode('bills')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                sizeMode === 'bills'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Shared Bills
            </button>
            <button
              onClick={() => setSizeMode('degree')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                sizeMode === 'degree'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Degree
            </button>
          </div>
        </div>
      </div>

      {/* Floating Legend */}
      {data && (
        <div className="absolute top-4 right-4 max-h-[80%] overflow-y-auto bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-gray-800/80 shadow-2xl z-10 w-52 text-[11px] custom-scrollbar flex flex-col gap-4">
          {/* Section 1: Color Legend */}
          <div>
            <h3 className="font-bold text-gray-200 mb-2 pb-1 border-b border-gray-800/60 uppercase tracking-wider text-[10px]">
              {COLOR_IMPLICATIONS[colorMode].title}
            </h3>
            <div className="space-y-1.5">
              {colorMode === 'party' ? (
                Object.entries(PARTY_COLORS).map(([party, color]) => (
                  <div key={party} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-gray-300 font-medium truncate">{party}</span>
                  </div>
                ))
              ) : (
                Array.from(new Set(data.nodes.map(n => n.community))).sort((a, b) => a - b).map(comm => (
                  <div key={comm} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COMMUNITY_COLORS[comm % COMMUNITY_COLORS.length] }} />
                    <span className="text-gray-300 font-medium">Bloc #{comm}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Size Legend */}
          <div>
            <h3 className="font-bold text-gray-200 mb-2 pb-1 border-b border-gray-800/60 uppercase tracking-wider text-[10px]">
              Node Size: {sizeMode === 'bills' ? 'Shared Bills' : 'Degree Centrality'}
            </h3>
            <div className="space-y-2 mt-2 px-1">
              {sizeMode === 'bills' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 animate-pulse" />
                    <span className="text-gray-300">Min: {stats.minBills} bill</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-400 flex-shrink-0 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="text-gray-300">Mid: {Math.round((stats.minBills + stats.maxBills) / 2)} bills</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5.5 h-5.5 rounded-full bg-gray-400 flex-shrink-0 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span className="text-gray-300">Max: {stats.maxBills} bills</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-gray-300">Min: {stats.minDegree.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-gray-300">Mid: {((stats.minDegree + stats.maxDegree) / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5.5 h-5.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-gray-300">Max: {stats.maxDegree.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Implications Box */}
          <div className="mt-1 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800/80 text-[10px] text-gray-400 leading-normal">
            <span className="font-bold text-gray-300 block mb-1">Research Insight:</span>
            {COLOR_IMPLICATIONS[colorMode].description}
          </div>
        </div>
      )}

      {data ? (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const size = getNodeSize(node);
            
            // Draw highlight ring if node is selected
            if (selectedNode && selectedNode.id === node.id) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, size + 2.5, 0, 2 * Math.PI, false);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }

            // Draw the node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fillStyle = getNodeColor(node);
            ctx.fill();

            // Only show labels when reasonably zoomed in, or for very central nodes
            const label = node.name;
            const fontSize = Math.max(3, 12 / globalScale);
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw text background for readability
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
            ctx.fillStyle = 'rgba(17, 24, 39, 0.7)'; // dark background
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 + size + fontSize, bckgDimensions[0], bckgDimensions[1]);

            // Draw text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(label, node.x, node.y + size + fontSize);
          }}
          nodeLabel={(node) => `
            <div class="bg-gray-800/95 text-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-700 backdrop-blur-md font-sans">
              <div class="font-bold text-blue-400 mb-0.5">${node.name}</div>
              <div class="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">${PARTY_MAP[node.id] || 'Independent'}</div>
              <div class="h-px bg-gray-700/40 my-1"></div>
              <div class="text-xs text-gray-300">Degree: <span class="text-white font-medium">${(node.degreeCentrality || 0).toFixed(3)}</span></div>
              <div class="text-xs text-gray-300">Betweenness: <span class="text-white font-medium">${(node.betweennessCentrality || 0).toFixed(3)}</span></div>
              <div class="text-xs text-gray-300">Shared Bills: <span class="text-white font-medium">${node.billsCount || 0}</span></div>
            </div>
          `}
          linkWidth={(link) => Math.min(5, Math.max(0.5, link.weight * 0.5))}
          linkColor={() => 'rgba(148, 163, 184, 0.2)'} // slate-400 with opacity
          onNodeClick={(node) => {
            onNodeClick(node);
            // Center camera on node
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(8, 2000);
          }}
          cooldownTicks={100}
          onEngineStop={() => {
            if (fgRef.current) fgRef.current.zoomToFit(400);
          }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

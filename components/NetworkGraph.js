"use client";

import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function NetworkGraph({ data, onNodeClick }) {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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

  // Community colors (Tailwind vibrant colors)
  const colors = [
    '#3b82f6', // blue-500
    '#ec4899', // pink-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ef4444', // red-500
  ];

  return (
    <div id="graph-container" className="w-full h-full relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-md border border-gray-800/50 shadow-2xl">
      {data ? (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Draw the node circle
            const size = Math.max(2, (node.val || 1) * 0.5);
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fillStyle = colors[node.community % colors.length];
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
            <div class="bg-gray-800/90 text-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-700 backdrop-blur-md font-sans">
              <div class="font-bold text-blue-400 mb-1">${node.name}</div>
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

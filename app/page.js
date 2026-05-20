"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MetricsPanel from '../components/MetricsPanel';
import { Network, Search, Zap, Shield } from 'lucide-react';

// Dynamically import NetworkGraph to avoid SSR issues with canvas
const NetworkGraph = dynamic(() => import('../components/NetworkGraph'), { ssr: false });

export default function Home() {
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetch('/network_data.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 h-screen flex flex-col max-w-[1920px] mx-auto p-4 md:p-6 gap-6">

        {/* Header */}
        <header className="flex-none flex items-center justify-between bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4 md:px-8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Network className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Legislative Collaboration Network
              </h1>
              <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                19th Philippine Congress <span className="w-1 h-1 rounded-full bg-gray-600"></span> Senate ICT Bills
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-col text-gray-400 text-sm">
            <p>Galileon Destura</p>
            <p>Kurt Ashton Montebon</p>
            <p>Jeff Ronyl Pausal</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

          {/* Left Panel: Network Graph */}
          <div className="flex-[2] relative min-h-[400px] lg:min-h-0">
            <NetworkGraph data={data} onNodeClick={setSelectedNode} selectedNode={selectedNode} />

            {/* Overlay instruction */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-gray-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-gray-700/50 shadow-xl text-left">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Search className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Interactive Network</p>
                <p className="text-xs text-gray-400">Scroll to zoom • Click nodes for details</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Metrics & Insights */}
          <div className="flex-[1] min-w-[320px] max-w-lg min-h-0">
            <MetricsPanel data={data} selectedNode={selectedNode} />
          </div>

        </main>
      </div>
    </div>
  );
}

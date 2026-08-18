import React, { useState } from 'react';
import { IPOProvider, useIPOLedger } from './context/IPOContext.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import LiveMarketTracker from './components/LiveMarketTracker.jsx';
import IPOList from './components/IPOList.jsx';
import ApplicationModal from './components/ApplicationModal.jsx';
import ExitModal from './components/ExitModal.jsx';
import ReinvestModal from './components/ReinvestModal.jsx';
import SettleModal from './components/SettleModal.jsx';
import IPODetailsModal from './components/IPODetailsModal.jsx';
import ScraperTelemetryModal from './components/ScraperTelemetryModal.jsx';
import CheckIPOModal from './components/CheckIPOModal.jsx';
import LedgerView from './components/LedgerView.jsx';
import FlowVisualizer from './components/FlowVisualizer.jsx';
import PartnersManager from './components/PartnersManager.jsx';

function MainAppContent() {
  const { activeTab } = useIPOLedger();

  // Modals state
  const [newIPOTarget, setNewIPOTarget] = useState(null); // { name, lotPrice, sharesPerLot } or {}
  const [exitTarget, setExitTarget] = useState(null); // { ipo, app }
  const [reinvestSourceAppId, setReinvestSourceAppId] = useState(null);
  const [settleTarget, setSettleTarget] = useState(null); // { fromPartnerId, toPartnerId, amount }
  const [viewIpoTarget, setViewIpoTarget] = useState(null);
  const [checkIpoTarget, setCheckIpoTarget] = useState(null); // { ipoName } or null
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  const handleOpenExitModal = (ipo, app) => {
    setExitTarget({ ipo, app });
  };

  const handleOpenReinvestModal = (sourceAppId) => {
    setReinvestSourceAppId(sourceAppId);
  };

  const handleOpenSettleModal = (targetData = {}) => {
    setSettleTarget(targetData);
  };

  const handleOpenNewIPO = (initialData = {}) => {
    setNewIPOTarget(initialData || {});
  };

  const handleOpenCheckIPO = (ipoName = '') => {
    setCheckIpoTarget({ ipoName });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header 
        onOpenNewIPO={() => handleOpenNewIPO({})} 
        onOpenCheckIPO={(name) => handleOpenCheckIPO(name)}
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onOpenNewIPO={() => handleOpenNewIPO({})}
            onOpenReinvest={(appId) => handleOpenReinvestModal(appId)}
            onOpenSettleModal={handleOpenSettleModal}
          />
        )}

        {activeTab === 'live' && (
          <LiveMarketTracker
            onApplyIPO={(name, lotPrice, sharesPerLot) => handleOpenNewIPO({ name, lotPrice, sharesPerLot })}
            onOpenTelemetry={() => setIsTelemetryOpen(true)}
            onViewDetails={(ipo) => setViewIpoTarget(ipo)}
            onOpenCheckIPO={(name) => handleOpenCheckIPO(name)}
          />
        )}

        {activeTab === 'ipos' && (
          <IPOList 
            onOpenNewIPO={() => handleOpenNewIPO({})}
            onOpenExitModal={handleOpenExitModal}
            onOpenReinvestModal={handleOpenReinvestModal}
            onOpenCheckIPO={(name) => handleOpenCheckIPO(name)}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerView 
            onOpenSettleModal={handleOpenSettleModal}
          />
        )}

        {activeTab === 'flow' && (
          <FlowVisualizer />
        )}

        {activeTab === 'partners' && (
          <PartnersManager />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>IPO Multi-Account Partnership & Settlement Ledger • Commercial SaaS Live Stream Powered</p>
      </footer>

      {/* Modals */}
      <ApplicationModal 
        isOpen={!!newIPOTarget} 
        onClose={() => setNewIPOTarget(null)} 
        initialData={newIPOTarget}
      />

      <ExitModal 
        isOpen={!!exitTarget} 
        onClose={() => setExitTarget(null)} 
        targetData={exitTarget}
      />

      <ReinvestModal 
        isOpen={!!reinvestSourceAppId}
        onClose={() => setReinvestSourceAppId(null)}
        sourceAppId={reinvestSourceAppId}
      />

      <SettleModal
        isOpen={!!settleTarget}
        onClose={() => setSettleTarget(null)}
        initialData={settleTarget}
      />

      <IPODetailsModal
        isOpen={!!viewIpoTarget}
        onClose={() => setViewIpoTarget(null)}
        ipo={viewIpoTarget}
        onApply={(name, lotPrice, sharesPerLot) => handleOpenNewIPO({ name, lotPrice, sharesPerLot })}
        onOpenCheckIPO={(name) => handleOpenCheckIPO(name)}
      />

      <ScraperTelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        latency={5}
      />

      <CheckIPOModal
        isOpen={!!checkIpoTarget}
        onClose={() => setCheckIpoTarget(null)}
        ipoName={checkIpoTarget?.ipoName || ''}
      />

    </div>
  );
}

export default function App() {
  return (
    <IPOProvider>
      <MainAppContent />
    </IPOProvider>
  );
}

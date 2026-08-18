import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStoredData, saveStoredData, resetToDemoData, clearAllDataFresh, exportBackupJSON } from '../utils/storage.js';
import { calculateLedger, calculateDashboardMetrics } from '../utils/calculations.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';

const IPOContext = createContext();

export function IPOProvider({ children }) {
  const [data, setData] = useState(() => loadStoredData());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Custom Confirm & Toast System
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {}
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({
      id: Date.now(),
      message,
      type,
      duration
    });
  };

  const showConfirm = ({
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    onConfirm = () => {}
  }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
  };

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Sync to localStorage on data change
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Calculated properties
  const ledger = calculateLedger(data.ipos, data.partners, data.settlements);
  const metrics = calculateDashboardMetrics(data.ipos, data.partners);

  // Actions
  const addIPO = (newIpo) => {
    setData(prev => ({
      ...prev,
      ipos: [newIpo, ...prev.ipos]
    }));
    showToast("IPO Application added successfully!", "success");
  };

  const updateIPO = (ipoId, updatedIpo) => {
    setData(prev => ({
      ...prev,
      ipos: prev.ipos.map(item => item.id === ipoId ? updatedIpo : item)
    }));
    showToast("IPO details updated!", "info");
  };

  const deleteIPO = (ipoId) => {
    const ipo = data.ipos.find(i => i.id === ipoId);
    showConfirm({
      title: "Delete IPO Application",
      message: `Are you sure you want to delete "${ipo?.name || 'this IPO'}"? This action cannot be undone.`,
      confirmText: "Delete IPO",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          ipos: prev.ipos.filter(item => item.id !== ipoId)
        }));
        showToast("IPO deleted successfully", "warning");
      }
    });
  };

  const updateApplicationStatus = (ipoId, appId, newStatus, unblockedDate = null) => {
    setData(prev => ({
      ...prev,
      ipos: prev.ipos.map(ipo => {
        if (ipo.id !== ipoId) return ipo;
        const updatedApps = ipo.applications.map(app => {
          if (app.id !== appId) return app;
          return {
            ...app,
            status: newStatus,
            unblockedDate: unblockedDate || app.unblockedDate
          };
        });
        
        const allStatuses = updatedApps.map(a => a.status);
        let overallStatus = "BLOCKED";
        if (allStatuses.every(s => s === "NOT_ALLOTTED")) overallStatus = "NOT_ALLOTTED";
        else if (allStatuses.some(s => s === "SOLD")) overallStatus = "SOLD";
        else if (allStatuses.some(s => s === "ALLOTTED")) overallStatus = "ALLOTTED";

        return {
          ...ipo,
          status: overallStatus,
          applications: updatedApps
        };
      })
    }));
    showToast(`Status updated to ${newStatus}`, "info");
  };

  const recordExit = (ipoId, appId, exitDetails) => {
    setData(prev => ({
      ...prev,
      ipos: prev.ipos.map(ipo => {
        if (ipo.id !== ipoId) return ipo;
        const updatedApps = ipo.applications.map(app => {
          if (app.id !== appId) return app;
          return {
            ...app,
            status: "SOLD",
            exitDetails
          };
        });
        return {
          ...ipo,
          status: "SOLD",
          applications: updatedApps
        };
      })
    }));
    showToast("Exit recorded successfully!", "success");
  };

  const recycleFunds = (sourceAppId, targetIpoId, newAppDetails) => {
    setData(prev => {
      const updatedIpos = prev.ipos.map(ipo => {
        const apps = ipo.applications.map(app => {
          if (app.id === sourceAppId) {
            return { ...app, reinvestedToAppId: newAppDetails.id };
          }
          return app;
        });

        if (ipo.id === targetIpoId) {
          return {
            ...ipo,
            applications: [...ipo.applications, { ...newAppDetails, reinvestedFromAppId: sourceAppId }]
          };
        }

        return { ...ipo, applications: apps };
      });

      return {
        ...prev,
        ipos: updatedIpos
      };
    });
    showToast("Capital recycled & reinvested into new IPO!", "success");
  };

  const addPartner = (partner) => {
    setData(prev => ({
      ...prev,
      partners: [...prev.partners, partner]
    }));
    showToast(`Partner '${partner.name}' added successfully!`, "success");
  };

  const deletePartner = (partnerId) => {
    const partner = data.partners.find(p => p.id === partnerId);
    if (partner?.isSelf) {
      showToast("Primary Self partner account cannot be deleted.", "warning");
      return;
    }

    showConfirm({
      title: "Delete IPO Partner",
      message: `Are you sure you want to delete partner '${partner?.name}'? Associated accounts will also be removed.`,
      confirmText: "Delete Partner",
      cancelText: "Keep Partner",
      type: "danger",
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          partners: prev.partners.filter(p => p.id !== partnerId),
          accounts: prev.accounts.filter(a => a.partnerId !== partnerId)
        }));
        showToast(`Partner '${partner?.name}' deleted.`, "warning");
      }
    });
  };

  const addAccount = (acc) => {
    setData(prev => ({
      ...prev,
      accounts: [...prev.accounts, acc]
    }));
    showToast(`Bank account '${acc.name}' linked!`, "success");
  };

  const deleteAccount = (accountId) => {
    const acc = data.accounts.find(a => a.id === accountId);
    showConfirm({
      title: "Delete Bank Account",
      message: `Are you sure you want to delete bank account '${acc?.name}'?`,
      confirmText: "Delete Account",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          accounts: prev.accounts.filter(a => a.id !== accountId)
        }));
        showToast(`Account '${acc?.name}' removed.`, "warning");
      }
    });
  };

  const addSettlement = (settle) => {
    setData(prev => ({
      ...prev,
      settlements: [settle, ...prev.settlements]
    }));
    showToast("Direct settlement recorded in ledger!", "success");
  };

  const handleExport = () => {
    exportBackupJSON(data);
    showToast("JSON Backup downloaded to computer!", "success");
  };

  const handleImport = (importedData) => {
    if (importedData && importedData.data) {
      setData(importedData.data);
      showToast("Backup restored successfully!", "success");
    } else {
      showToast("Invalid JSON backup file!", "error");
    }
  };

  const handleResetDemo = () => {
    showConfirm({
      title: "Reset Interactive Demo Data",
      message: "Are you sure you want to reset all data back to the initial interactive demo state?",
      confirmText: "Reset Demo",
      cancelText: "Keep Current Data",
      type: "warning",
      onConfirm: () => {
        const reset = resetToDemoData();
        setData(reset);
        showToast("Demo data reset complete!", "info");
      }
    });
  };

  const handleClearFresh = () => {
    showConfirm({
      title: "Remove All Dummy Data & Start Fresh",
      message: "Are you sure you want to purge all demo applications, partners, and settlements? This will give you a clean slate to enter real data.",
      confirmText: "Purge & Start Fresh",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        const fresh = clearAllDataFresh();
        setData(fresh);
        showToast("All dummy data removed! Ready for real production data.", "success");
      }
    });
  };

  return (
    <IPOContext.Provider
      value={{
        partners: data.partners,
        accounts: data.accounts,
        ipos: data.ipos,
        settlements: data.settlements,
        ledger,
        metrics,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        addIPO,
        updateIPO,
        deleteIPO,
        updateApplicationStatus,
        recordExit,
        recycleFunds,
        addPartner,
        deletePartner,
        addAccount,
        deleteAccount,
        addSettlement,
        handleExport,
        handleImport,
        handleResetDemo,
        handleClearFresh,
        showToast,
        showConfirm
      }}
    >
      {children}

      {/* Global Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        type={confirmConfig.type}
      />

      {/* Global Custom Toast Notification */}
      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
      />

    </IPOContext.Provider>
  );
}

export function useIPOLedger() {
  const context = useContext(IPOContext);
  if (!context) {
    throw new Error('useIPOLedger must be used within an IPOProvider');
  }
  return context;
}

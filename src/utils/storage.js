import { INITIAL_PARTNERS, INITIAL_ACCOUNTS, INITIAL_IPOS, INITIAL_SETTLEMENTS } from './sampleData.js';

const STORAGE_KEYS = {
  PARTNERS: 'ipo_manager_partners_v1',
  ACCOUNTS: 'ipo_manager_accounts_v1',
  IPOS: 'ipo_manager_ipos_v1',
  SETTLEMENTS: 'ipo_manager_settlements_v1'
};

export function loadStoredData() {
  try {
    const rawPartners = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    const rawAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const rawIpos = localStorage.getItem(STORAGE_KEYS.IPOS);
    const rawSettlements = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);

    const partners = rawPartners ? JSON.parse(rawPartners) : INITIAL_PARTNERS;
    const accounts = rawAccounts ? JSON.parse(rawAccounts) : INITIAL_ACCOUNTS;
    const ipos = rawIpos ? JSON.parse(rawIpos) : INITIAL_IPOS;
    const settlements = rawSettlements ? JSON.parse(rawSettlements) : INITIAL_SETTLEMENTS;

    return { partners, accounts, ipos, settlements };
  } catch (err) {
    console.error("Failed to load stored IPO data, falling back to defaults", err);
    return {
      partners: INITIAL_PARTNERS,
      accounts: INITIAL_ACCOUNTS,
      ipos: INITIAL_IPOS,
      settlements: INITIAL_SETTLEMENTS
    };
  }
}

export function saveStoredData(data) {
  try {
    if (data.partners) localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(data.partners));
    if (data.accounts) localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.accounts));
    if (data.ipos) localStorage.setItem(STORAGE_KEYS.IPOS, JSON.stringify(data.ipos));
    if (data.settlements) localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(data.settlements));
  } catch (err) {
    console.error("Failed to save data to localStorage", err);
  }
}

export function exportBackupJSON(data) {
  const payload = {
    app: "IPO Partnership & Settlement Manager",
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {
      partners: data.partners,
      accounts: data.accounts,
      ipos: data.ipos,
      settlements: data.settlements
    }
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `IPO_Manager_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_PARTNERS));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
  localStorage.setItem(STORAGE_KEYS.IPOS, JSON.stringify(INITIAL_IPOS));
  localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
  return {
    partners: INITIAL_PARTNERS,
    accounts: INITIAL_ACCOUNTS,
    ipos: INITIAL_IPOS,
    settlements: INITIAL_SETTLEMENTS
  };
}

export function clearAllDataFresh() {
  const freshPartners = [
    {
      id: 'partner-me',
      name: 'Me (Primary)',
      upiOrBank: 'My Primary Bank',
      notes: 'Main Account Owner',
      isSelf: true
    }
  ];
  const freshAccounts = [
    {
      id: 'acc-me-1',
      partnerId: 'partner-me',
      name: 'My Primary Demat Bank',
      accountNumber: 'Primary Bank Acc',
      pan: ''
    }
  ];
  const freshIpos = [];
  const freshSettlements = [];

  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(freshPartners));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(freshAccounts));
  localStorage.setItem(STORAGE_KEYS.IPOS, JSON.stringify(freshIpos));
  localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(freshSettlements));

  return {
    partners: freshPartners,
    accounts: freshAccounts,
    ipos: freshIpos,
    settlements: freshSettlements
  };
}

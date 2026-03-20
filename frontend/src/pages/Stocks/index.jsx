import React, { useMemo, useState } from 'react';
import Produits from './Produits';
import Mouvements from './Mouvements';
import Fournisseurs from './Fournisseurs';
import Inventaire from './Inventaire';

const tabs = [
  { key: 'produits', label: 'Produits' },
  { key: 'mouvements', label: 'Mouvements' },
  { key: 'fournisseurs', label: 'Fournisseurs' },
  { key: 'inventaire', label: 'Inventaire' },
];

const Stocks = () => {
  const [activeTab, setActiveTab] = useState('produits');

  const content = useMemo(() => {
    if (activeTab === 'mouvements') return <Mouvements />;
    if (activeTab === 'fournisseurs') return <Fournisseurs />;
    if (activeTab === 'inventaire') return <Inventaire />;
    return <Produits />;
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Module Stocks</h1>
        <p className="text-sm text-gray-500 mt-1">Gestion des produits, mouvements, fournisseurs et inventaire.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section>{content}</section>
    </div>
  );
};

export default Stocks;

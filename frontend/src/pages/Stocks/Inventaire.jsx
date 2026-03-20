import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { Boxes, AlertTriangle, Layers, Wallet } from 'lucide-react';
import { getInventaire } from '../../services/stocksService';

const formatCurrency = (value) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(value || 0));

const Inventaire = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [inventaire, setInventaire] = useState({
    produits: [],
    totalProduits: 0,
    produitsActifs: 0,
    produitsEnAlerte: 0,
    valeurTotaleStock: 0,
    valeurParCategorie: [],
  });

  const fetchInventaire = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await getInventaire();
      setInventaire(response?.data?.data || {
        produits: [], totalProduits: 0, produitsActifs: 0, produitsEnAlerte: 0, valeurTotaleStock: 0, valeurParCategorie: [],
      });
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Chargement inventaire impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventaire();
  }, []);

  const columns = [
    { Header: 'Reference', accessor: 'reference' },
    { Header: 'Designation', accessor: 'designation' },
    { Header: 'Categorie', accessor: 'categorie' },
    { Header: 'Unite', accessor: 'unite' },
    { Header: 'Quantite', accessor: 'quantiteStock' },
    { Header: 'Prix unitaire', accessor: 'prixUnitaire', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Valeur totale', accessor: 'valeurTotale', Cell: ({ value }) => formatCurrency(value) },
    {
      Header: 'Alerte',
      accessor: 'enAlerte',
      Cell: ({ value }) => (
        value ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">ALERTE</span>
          : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">OK</span>
      ),
    },
  ];

  const rows = useMemo(() => {
    return (inventaire.produits || []).map((p) => ({
      ...p,
      valeurTotale: Number(p.quantiteStock || 0) * Number(p.prixUnitaire || 0),
      enAlerte: Number(p.quantiteStock || 0) <= Number(p.seuilAlerte || 0),
    }));
  }, [inventaire.produits]);

  const totalValeurTable = rows.reduce((sum, r) => sum + Number(r.valeurTotale || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard title="Valeur totale" value={formatCurrency(inventaire.valeurTotaleStock)} icon={<Wallet className="text-white" size={18} />} color="bg-emerald-500" />
        <StatCard title="Produits actifs" value={inventaire.produitsActifs} icon={<Boxes className="text-white" size={18} />} color="bg-blue-500" />
        <StatCard title="En alerte" value={inventaire.produitsEnAlerte} icon={<AlertTriangle className="text-white" size={18} />} color="bg-red-500" />
        <StatCard title="Categories" value={(inventaire.valeurParCategorie || []).length} icon={<Layers className="text-white" size={18} />} color="bg-purple-500" />
      </div>

      {errorMsg && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{errorMsg}</div>}

      <DataTable columns={columns} data={rows} loading={loading} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-x-auto">
        <div className="text-sm font-semibold text-gray-700 mb-3">Valeur du stock par categorie</div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventaire.valeurParCategorie || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categorie" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="valeur" fill="#2563eb" name="Valeur" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 font-semibold text-gray-800">
        Totaux: valeur inventaire = {formatCurrency(totalValeurTable)}
      </div>
    </div>
  );
};

export default Inventaire;

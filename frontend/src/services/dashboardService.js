import api from './api';

export const getKPIs = () => api.get('/dashboard/kpis');
export const getAlertes = () => api.get('/dashboard/alertes');
export const getGraphiqueCA = () => api.get('/dashboard/graphique/ca');
export const getGraphiqueFacturesStatut = () => api.get('/dashboard/graphique/factures-statut');
export const getGraphiqueEmployesDepartement = () => api.get('/dashboard/graphique/employes-departement');
export const getGraphiqueMasseSalariale = () => api.get('/dashboard/graphique/masse-salariale');
export const getGraphiqueConges = () => api.get('/dashboard/graphique/conges');
export const getGraphiqueMouvementsStock = () => api.get('/dashboard/graphique/mouvements-stock');
export const getGraphiqueStockCategorie = () => api.get('/dashboard/graphique/stock-categorie');

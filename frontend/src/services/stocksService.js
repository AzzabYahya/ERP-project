import api from './api';

// Fournisseurs
export const getFournisseurs = (params) => api.get('/stocks/fournisseurs', { params });
export const createFournisseur = (data) => api.post('/stocks/fournisseurs', data);
export const updateFournisseur = (id, data) => api.put(`/stocks/fournisseurs/${id}`, data);
export const deleteFournisseur = (id) => api.delete(`/stocks/fournisseurs/${id}`);

// Produits
export const getProduits = (params) => api.get('/stocks/produits', { params });
export const getProduitById = (id) => api.get(`/stocks/produits/${id}`);
export const createProduit = (data) => api.post('/stocks/produits', data);
export const updateProduit = (id, data) => api.put(`/stocks/produits/${id}`, data);
export const deleteProduit = (id) => api.delete(`/stocks/produits/${id}`);
export const getProduitsEnAlerte = () => api.get('/stocks/produits/alertes');
export const getCategories = () => api.get('/stocks/produits/categories');

// Mouvements
export const getMouvements = (params) => api.get('/stocks/mouvements', { params });
export const entreeStock = (data) => api.post('/stocks/mouvements/entree', data);
export const sortieStock = (data) => api.post('/stocks/mouvements/sortie', data);
export const ajustementStock = (data) => api.post('/stocks/mouvements/ajustement', data);

// Inventaire
export const getInventaire = () => api.get('/stocks/inventaire');
export const getStatistiquesStocks = () => api.get('/stocks/statistiques');

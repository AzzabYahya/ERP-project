const path = require('path');
const mongoose = require('mongoose');
const request = require('supertest');

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

const app = require('../app');
const User = require('../models/User');
const Produit = require('../models/Produit');
const Fournisseur = require('../models/Fournisseur');
const MouvementStock = require('../models/MouvementStock');

const magasinierUser = {
  nom: 'Stock',
  prenom: 'Manager',
  email: 'stock.manager@erp.ma',
  password: 'StockTest@123',
  role: 'MAGASINIER',
};

const comptableUser = {
  nom: 'Compte',
  prenom: 'User',
  email: 'compte.user@erp.ma',
  password: 'CompteTest@123',
  role: 'COMPTABLE',
};

const loginAs = async (email, password) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data.token;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Produit.deleteMany({}),
    Fournisseur.deleteMany({}),
    MouvementStock.deleteMany({}),
  ]);
  await User.create([magasinierUser, comptableUser]);
});

describe('Stocks API', () => {
  test('GET /api/stocks/produits is forbidden for COMPTABLE', async () => {
    const token = await loginAs(comptableUser.email, comptableUser.password);

    const res = await request(app)
      .get('/api/stocks/produits')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/stocks/mouvements/entree increases stock', async () => {
    const token = await loginAs(magasinierUser.email, magasinierUser.password);

    const fournisseurRes = await request(app)
      .post('/api/stocks/fournisseurs')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Fournisseur Test' });

    const fournisseurId = fournisseurRes.body.data._id;

    const produitRes = await request(app)
      .post('/api/stocks/produits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        designation: 'Clavier',
        categorie: 'Informatique',
        prixUnitaire: 300,
        fournisseur: fournisseurId,
      });

    const produitId = produitRes.body.data._id;

    const entreeRes = await request(app)
      .post('/api/stocks/mouvements/entree')
      .set('Authorization', `Bearer ${token}`)
      .send({
        produitId,
        quantite: 5,
        motif: 'Reapprovisionnement',
        reference: 'BL-TEST-001',
      });

    expect(entreeRes.status).toBe(201);
    expect(entreeRes.body.success).toBe(true);
    expect(entreeRes.body.data.produit.quantiteStock).toBe(5);

    const produit = await Produit.findById(produitId);
    expect(produit.quantiteStock).toBe(5);
  });

  test('POST /api/stocks/mouvements/sortie rejects insufficient stock', async () => {
    const token = await loginAs(magasinierUser.email, magasinierUser.password);

    const fournisseur = await Fournisseur.create({ nom: 'Fournisseur Direct' });
    const produit = await Produit.create({
      reference: 'PROD-999',
      designation: 'Souris',
      categorie: 'Informatique',
      prixUnitaire: 120,
      quantiteStock: 1,
      fournisseur: fournisseur._id,
    });

    const sortieRes = await request(app)
      .post('/api/stocks/mouvements/sortie')
      .set('Authorization', `Bearer ${token}`)
      .send({
        produitId: produit._id.toString(),
        quantite: 3,
        motif: 'Sortie test',
      });

    expect(sortieRes.status).toBe(400);
    expect(sortieRes.body.success).toBe(false);
    expect(sortieRes.body.message).toMatch(/Stock insuffisant/i);
  });
});

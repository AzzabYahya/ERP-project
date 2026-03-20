const path = require('path');
const mongoose = require('mongoose');
const request = require('supertest');

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

const app = require('../app');
const User = require('../models/User');
const CompteComptable = require('../models/CompteComptable');
const Facture = require('../models/Facture');
const EcritureComptable = require('../models/EcritureComptable');

const comptableUser = {
  nom: 'Comptable',
  prenom: 'Test',
  email: 'comptable.test@erp.ma',
  password: 'ComptaTest@123',
  role: 'COMPTABLE',
};

const magasinierUser = {
  nom: 'Magasinier',
  prenom: 'Test',
  email: 'magasinier.test@erp.ma',
  password: 'MagasinTest@123',
  role: 'MAGASINIER',
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
    CompteComptable.deleteMany({}),
    Facture.deleteMany({}),
    EcritureComptable.deleteMany({}),
  ]);

  await User.create([comptableUser, magasinierUser]);
  await CompteComptable.create([
    { numero: '411', libelle: 'Clients', type: 'ACTIF' },
    { numero: '701', libelle: 'Ventes', type: 'PRODUIT' },
  ]);
});

describe('Comptabilite API', () => {
  test('GET /api/comptabilite/comptes is forbidden for MAGASINIER', async () => {
    const token = await loginAs(magasinierUser.email, magasinierUser.password);

    const res = await request(app)
      .get('/api/comptabilite/comptes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/comptabilite/factures creates a draft invoice', async () => {
    const token = await loginAs(comptableUser.email, comptableUser.password);

    const payload = {
      client: { nom: 'Client Test' },
      lignes: [{ designation: 'Service ERP', quantite: 2, prixUnitaire: 1000 }],
      tva: 20,
    };

    const res = await request(app)
      .post('/api/comptabilite/factures')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.facture.statut).toBe('BROUILLON');
  });

  test('PATCH /api/comptabilite/factures/:id/statut validates invoice', async () => {
    const token = await loginAs(comptableUser.email, comptableUser.password);

    const createRes = await request(app)
      .post('/api/comptabilite/factures')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: { nom: 'Client Validation' },
        lignes: [{ designation: 'Abonnement', quantite: 1, prixUnitaire: 1200 }],
      });

    const factureId = createRes.body.data.facture._id;

    const patchRes = await request(app)
      .patch(`/api/comptabilite/factures/${factureId}/statut`)
      .set('Authorization', `Bearer ${token}`)
      .send({ statut: 'VALIDEE' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.facture.statut).toBe('VALIDEE');

    const ecritures = await EcritureComptable.find({ facture: factureId });
    expect(ecritures.length).toBe(2);
  });
});

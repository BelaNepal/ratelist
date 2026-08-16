import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  getDashboardStats,
  getProducts,
  addProduct,
  deleteProduct,
  getTrashProducts,
  restoreProduct,
  purgeProduct,
  syncLiveProductsHandler,
  fetchLiveBelaApiProducts,
  getRateHistory,
  submitRateChangeRequest,
  getApprovalRequests,
  approveRateChange,
  rejectRateChange,
  getModularTemplates,
  getBOMCalculation,
  getProjects,
  createProject,
  getBOQ,
  saveBOQ,
  getQuotations,
  getQuotationById,
  getSuppliers,
  getReportsTrend
} from './controllers/apiController';

import {
  login,
  logout,
  getCurrentUser,
  getAllUsersHandler,
  getAllSessionsHandler,
  updateUserRoleHandler,
  createNewUserHandler,
  updateUserStatusHandler,
  resetUserPasswordHandler,
  getRolePermissionsHandler,
  updateRolePermissionsHandler
} from './controllers/authController';

import { initializeUserDatabaseTables } from './database/userStore';
import { initializeBOMDatabaseTables } from './database/bomStore';
import { initializeRolePermissionsTable } from './database/roleStore';
import { getBOMCalculationHandler, saveBOMRecipeHandler } from './controllers/bomController';
import { verifyAuth, requireAdmin, requireRole } from './middleware/authMiddleware';

import path from 'path';
import fs from 'fs';
import { uploadProductImage } from './middleware/uploadMiddleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Support multiple CORS origins (comma-separated in env)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded asset directory statically
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Authentication & User Management Endpoints
app.post('/api/auth/login', login);
app.post('/api/auth/logout', verifyAuth, logout);
app.get('/api/auth/me', verifyAuth, getCurrentUser);
app.get('/api/auth/users', verifyAuth, requireAdmin, getAllUsersHandler);
app.post('/api/auth/users', verifyAuth, requireAdmin, createNewUserHandler);
app.get('/api/auth/sessions', verifyAuth, requireAdmin, getAllSessionsHandler);
app.post('/api/auth/users/role', verifyAuth, requireAdmin, updateUserRoleHandler);
app.patch('/api/auth/users/status', verifyAuth, requireAdmin, updateUserStatusHandler);
app.post('/api/auth/users/reset-password', verifyAuth, requireAdmin, resetUserPasswordHandler);
app.get('/api/auth/role-permissions', getRolePermissionsHandler);
app.post('/api/auth/role-permissions', verifyAuth, requireAdmin, updateRolePermissionsHandler);

// Image Upload Endpoint
app.post('/api/products/upload-image', uploadProductImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  // Determine relative path for web access
  const relativePath = `/uploads/products/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;
  res.json({
    success: true,
    imageUrl: relativePath,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

// API Routes with Granular RBAC Middleware Security
app.get('/api/dashboard/stats', getDashboardStats);
app.get('/api/products', getProducts);
app.get('/api/products/trash', getTrashProducts);
app.post('/api/products', verifyAuth, requireRole('Admin', 'Rate Manager'), addProduct);
app.delete('/api/products/:id', verifyAuth, requireRole('Admin', 'Rate Manager'), deleteProduct);
app.post('/api/products/:id/restore', verifyAuth, requireRole('Admin', 'Rate Manager'), restoreProduct);
app.delete('/api/products/:id/purge', verifyAuth, requireAdmin, purgeProduct);
app.post('/api/products/sync-live', verifyAuth, requireRole('Admin', 'Rate Manager'), syncLiveProductsHandler);

app.get('/api/rates/history/:productId', getRateHistory);
app.post('/api/rates/request', verifyAuth, requireRole('Admin', 'Rate Manager'), submitRateChangeRequest);

app.get('/api/approval-requests', getApprovalRequests);
app.post('/api/approval-requests/:id/approve', verifyAuth, requireRole('Admin', 'Approver'), approveRateChange);
app.post('/api/approval-requests/:id/reject', verifyAuth, requireRole('Admin', 'Approver'), rejectRateChange);

app.get('/api/modular-homes', getModularTemplates);

// Manufacturing BOM Endpoints
app.get('/api/bom/calculate/:productId', getBOMCalculationHandler);
app.post('/api/bom/save', verifyAuth, requireRole('Admin', 'Rate Manager', 'Estimator'), saveBOMRecipeHandler);

import multer from 'multer';

// Ensure upload directories exist
const uploadImagesDir = path.join(__dirname, '../uploads/projects/images');
const uploadDocsDir = path.join(__dirname, '../uploads/projects/documents');
fs.mkdirSync(uploadImagesDir, { recursive: true });
fs.mkdirSync(uploadDocsDir, { recursive: true });

// Serve public static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Multer Storage Configuration
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadImagesDir),
  filename: (req, file, cb) => cb(null, `img_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
});

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDocsDir),
  filename: (req, file, cb) => cb(null, `doc_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
});

const uploadImage = multer({ storage: imageStorage });
const uploadDoc = multer({ storage: docStorage });

import {
  getProjectsHandler,
  getProjectByIdHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  uploadProjectGalleryHandler,
  uploadProjectDocumentHandler,
  deleteProjectFileHandler
} from './controllers/projectController';
import { initializeProjectDatabaseTables } from './database/projectStore';

// Projects REST Endpoints
app.get('/api/projects', getProjectsHandler);
app.get('/api/projects/:id', getProjectByIdHandler);
app.post('/api/projects', verifyAuth, requireRole('Admin', 'Estimator', 'Sales'), createProjectHandler);
app.put('/api/projects/:id', verifyAuth, requireRole('Admin', 'Estimator', 'Sales'), updateProjectHandler);
app.delete('/api/projects/:id', verifyAuth, requireRole('Admin', 'Estimator'), deleteProjectHandler);

// Project Asset Vault Endpoints
app.post('/api/projects/:id/gallery', verifyAuth, uploadImage.array('images', 25), uploadProjectGalleryHandler);
app.post('/api/projects/:id/documents', verifyAuth, uploadDoc.single('document'), uploadProjectDocumentHandler);
app.delete('/api/projects/:id/files/:fileId', verifyAuth, deleteProjectFileHandler);

app.get('/api/boq/:projectId', getBOQ);
app.post('/api/boq', verifyAuth, requireRole('Admin', 'Estimator', 'Sales'), saveBOQ);

app.get('/api/quotations', getQuotations);
app.get('/api/quotations/:id', getQuotationById);

import {
  getSuppliersHandler,
  createSupplierHandler,
  updateSupplierHandler,
  deleteSupplierHandler,
  addSupplierRateHandler,
  deleteSupplierRateHandler
} from './controllers/supplierController';
import { initializeSupplierDatabaseTables } from './database/supplierStore';

app.get('/api/suppliers', getSuppliersHandler);
app.post('/api/suppliers', verifyAuth, requireRole('Admin', 'Rate Manager'), createSupplierHandler);
app.put('/api/suppliers/:id', verifyAuth, requireRole('Admin', 'Rate Manager'), updateSupplierHandler);
app.delete('/api/suppliers/:id', verifyAuth, requireRole('Admin', 'Rate Manager'), deleteSupplierHandler);
app.post('/api/suppliers/:id/rates', verifyAuth, requireRole('Admin', 'Rate Manager'), addSupplierRateHandler);
app.delete('/api/suppliers/rates/:rateId', verifyAuth, requireRole('Admin', 'Rate Manager'), deleteSupplierRateHandler);

app.get('/api/reports/trends', getReportsTrend);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bela Rate & Costing Manager Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Bela Rate Backend listening on http://localhost:${PORT}`);
  // Initialize Database Users, Sessions, BOM, Role Permissions, Supplier, and Projects tables
  initializeUserDatabaseTables();
  initializeBOMDatabaseTables();
  initializeRolePermissionsTable();
  initializeSupplierDatabaseTables();
  initializeProjectDatabaseTables();

  // Initial background sync from live Bela EcoPanels API
  fetchLiveBelaApiProducts().then((prods) => {
    console.log(`✅ Initially synced ${prods.length} live products from https://belaecopanels.com/api/products`);
  });
});



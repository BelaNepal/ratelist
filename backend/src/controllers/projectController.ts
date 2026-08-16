import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  getAllProjectsFromDb,
  getProjectByIdFromDb,
  createProjectInDb,
  updateProjectInDb,
  deleteProjectFromDb,
  addProjectGalleryImageInDb,
  addProjectGalleryImagesInDb,
  addProjectDocumentInDb,
  deleteProjectFileInDb
} from '../database/projectStore';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getProjectsHandler(req: Request, res: Response) {
  try {
    const projects = await getAllProjectsFromDb();
    return res.json(projects);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getProjectByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await getProjectByIdFromDb(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    return res.json(project);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createProjectHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, customer_name, location, building_type, area_sqft, floors, assigned_staff, status, estimated_cost, start_date, completion_date, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = await createProjectInDb({
      name,
      customer_name,
      location,
      building_type,
      area_sqft,
      floors,
      assigned_staff,
      status,
      estimated_cost,
      start_date,
      completion_date,
      description
    });
    return res.status(201).json(project);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateProjectHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = await updateProjectInDb(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteProjectHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await deleteProjectFromDb(id);
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function uploadProjectGalleryHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const singleFile = req.file;

    const fileList = files && files.length > 0 ? files : (singleFile ? [singleFile] : []);
    if (fileList.length === 0) return res.status(400).json({ error: 'No image files uploaded.' });

    const fileUrls = fileList.map((f) => `/uploads/projects/images/${f.filename}`);
    const updatedProject = await addProjectGalleryImagesInDb(id, fileUrls);
    return res.json({ success: true, message: `Uploaded ${fileUrls.length} gallery image(s) successfully.`, file_urls: fileUrls, project: updatedProject });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function uploadProjectDocumentHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No document file uploaded.' });

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '') || 'file';
    const fileUrl = `/uploads/projects/documents/${req.file.filename}`;

    const newFileItem = {
      id: `file_${Date.now()}`,
      original_name: req.file.originalname,
      file_url: fileUrl,
      file_type: ext,
      size: req.file.size,
      uploaded_at: new Date().toISOString().split('T')[0]
    };

    const updatedProject = await addProjectDocumentInDb(id, newFileItem);
    return res.json({ success: true, message: 'Project document uploaded successfully.', file: newFileItem, project: updatedProject });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteProjectFileHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, fileId } = req.params;
    const updated = await deleteProjectFileInDb(id, fileId);
    return res.json({ success: true, message: 'Project file removed successfully.', project: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

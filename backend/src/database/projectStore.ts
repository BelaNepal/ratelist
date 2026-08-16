import { pgPool } from './pgPool';

export interface ProjectFile {
  id: string;
  original_name: string;
  file_url: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

export interface Project {
  id: string;
  name: string;
  customer_name: string;
  location: string;
  building_type: string;
  area_sqft: number;
  floors: number;
  assigned_staff: string;
  status: 'Completed' | 'Upcoming' | 'Running' | 'Active' | 'Draft';
  estimated_cost: number;
  start_date: string;
  completion_date: string;
  description: string;
  gallery_images: string[];
  project_files: ProjectFile[];
  created_date?: string;
  created_at?: string;
}

const SEEDED_PROJECTS: Project[] = [
  {
    id: 'prj_pokhara_resort',
    name: 'Pokhara Luxury Eco Resort & Villas',
    customer_name: 'Annapurna Hospitality Group Pvt Ltd',
    location: 'Lakeside, Pokhara, Kaski',
    building_type: 'Hospitality Resort Suite',
    area_sqft: 18500,
    floors: 3,
    assigned_staff: 'Ashish (Lead Project Engineer)',
    status: 'Completed',
    estimated_cost: 34500000,
    start_date: '2025-09-01',
    completion_date: '2026-06-15',
    description: 'Turnkey 18,500 sq.ft Eco-Resort constructed using Bela EPS 100mm Sandwich Panels, structural RHS steel frames, and thermal insulated roof paneling.',
    gallery_images: [
      '/ecopanel_preview.png',
      '/bela_logo.png'
    ],
    project_files: [
      {
        id: 'file_1',
        original_name: 'Pokhara_Resort_Approved_BOQ_Costing.xlsm',
        file_url: '/uploads/projects/documents/sample_boq.xlsm',
        file_type: 'xlsm',
        size: 1450200,
        uploaded_at: '2026-01-10'
      },
      {
        id: 'file_2',
        original_name: 'Structural_Steel_Architectural_Drawing.pdf',
        file_url: '/uploads/projects/documents/sample_drawing.pdf',
        file_type: 'pdf',
        size: 3200100,
        uploaded_at: '2026-01-15'
      }
    ],
    created_date: '2025-09-01'
  },
  {
    id: 'prj_birgunj_wh',
    name: 'Birgunj Dry Port Industrial Warehouse',
    customer_name: 'Himalayan Logistics Infrastructure',
    location: 'Birgunj Dry Port Road, Parsa',
    building_type: 'Commercial Warehouse',
    area_sqft: 32000,
    floors: 1,
    assigned_staff: 'Suresh Shrestha (Site Manager)',
    status: 'Upcoming',
    estimated_cost: 48000000,
    start_date: '2026-09-01',
    completion_date: '2027-03-30',
    description: 'Heavy duty manufacturing & storage facility with 75mm EPS wall cladding and heavy structural steel trusses.',
    gallery_images: [
      '/ecopanel_preview.png'
    ],
    project_files: [
      {
        id: 'file_3',
        original_name: 'Birgunj_Warehouse_Structural_Calculation.pdf',
        file_url: '/uploads/projects/documents/sample_calc.pdf',
        file_type: 'pdf',
        size: 2100000,
        uploaded_at: '2026-07-20'
      }
    ],
    created_date: '2026-07-20'
  },
  {
    id: 'prj_kathmandu_villa',
    name: 'Budhanilkantha 3-Story Eco Villa',
    customer_name: 'Er. Rajesh K. C.',
    location: 'Budhanilkantha, Kathmandu',
    building_type: 'Multi-Story Villa',
    area_sqft: 4200,
    floors: 3,
    assigned_staff: 'Bikash Adhikari (Senior Architect)',
    status: 'Running',
    estimated_cost: 11200000,
    start_date: '2026-03-15',
    completion_date: '2026-11-20',
    description: 'Modern earthquake-resistant green residential residence featuring high thermal insulation EPS panels and light gauge steel floor systems.',
    gallery_images: [
      '/ecopanel_preview.png'
    ],
    project_files: [],
    created_date: '2026-03-15'
  }
];

let inMemoryProjects: Project[] = [...SEEDED_PROJECTS];

export async function initializeProjectDatabaseTables() {
  try {
    const client = await pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          customer_name VARCHAR(255),
          location VARCHAR(255),
          building_type VARCHAR(100),
          area_sqft NUMERIC,
          floors INT,
          assigned_staff VARCHAR(255),
          status VARCHAR(50) DEFAULT 'Running',
          estimated_cost NUMERIC,
          start_date VARCHAR(50),
          completion_date VARCHAR(50),
          description TEXT,
          gallery_images JSONB DEFAULT '[]'::jsonb,
          project_files JSONB DEFAULT '[]'::jsonb,
          created_date VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const check = await client.query('SELECT COUNT(*) FROM projects');
      if (parseInt(check.rows[0].count, 10) === 0) {
        for (const p of SEEDED_PROJECTS) {
          await client.query(
            `INSERT INTO projects (
              id, name, customer_name, location, building_type, area_sqft, floors, assigned_staff,
              status, estimated_cost, start_date, completion_date, description, gallery_images, project_files, created_date, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
              p.id,
              p.name,
              p.customer_name,
              p.location,
              p.building_type,
              p.area_sqft,
              p.floors,
              p.assigned_staff,
              p.status,
              p.estimated_cost,
              p.start_date,
              p.completion_date,
              p.description,
              JSON.stringify(p.gallery_images),
              JSON.stringify(p.project_files),
              p.created_date,
              new Date().toISOString()
            ]
          );
        }
      }
      console.log('✅ PostgreSQL Enterprise Projects & Asset Vault Table Initialized!');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.log('ℹ️ PostgreSQL Project Store fallback active (Using In-Memory Store)');
  }
}

export async function getAllProjectsFromDb(): Promise<Project[]> {
  try {
    const res = await pgPool.query('SELECT * FROM projects ORDER BY created_at DESC');
    if (res.rows.length > 0) {
      return res.rows.map((r) => ({
        ...r,
        area_sqft: parseFloat(r.area_sqft || 0),
        floors: parseInt(r.floors || 1, 10),
        estimated_cost: parseFloat(r.estimated_cost || 0),
        gallery_images: Array.isArray(r.gallery_images) ? r.gallery_images : JSON.parse(r.gallery_images || '[]'),
        project_files: Array.isArray(r.project_files) ? r.project_files : JSON.parse(r.project_files || '[]')
      }));
    }
  } catch (e) {
    // fallback
  }
  return inMemoryProjects;
}

export async function getProjectByIdFromDb(id: string): Promise<Project | null> {
  try {
    const res = await pgPool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      const r = res.rows[0];
      return {
        ...r,
        area_sqft: parseFloat(r.area_sqft || 0),
        floors: parseInt(r.floors || 1, 10),
        estimated_cost: parseFloat(r.estimated_cost || 0),
        gallery_images: Array.isArray(r.gallery_images) ? r.gallery_images : JSON.parse(r.gallery_images || '[]'),
        project_files: Array.isArray(r.project_files) ? r.project_files : JSON.parse(r.project_files || '[]')
      };
    }
  } catch (e) {
    // fallback
  }
  return inMemoryProjects.find((p) => p.id === id) || null;
}

export async function createProjectInDb(pData: Partial<Project>): Promise<Project> {
  const newProject: Project = {
    id: pData.id || `prj_${Date.now()}`,
    name: pData.name || 'New Construction Project',
    customer_name: pData.customer_name || 'Client',
    location: pData.location || 'Kathmandu, Nepal',
    building_type: pData.building_type || 'Residential Prefab Cottage',
    area_sqft: Number(pData.area_sqft) || 2400,
    floors: Number(pData.floors) || 2,
    assigned_staff: pData.assigned_staff || 'Lead Engineer',
    status: (pData.status as any) || 'Completed',
    estimated_cost: Number(pData.estimated_cost) || 12500000,
    start_date: pData.start_date || new Date().toISOString().split('T')[0],
    completion_date: pData.completion_date || '',
    description: pData.description || 'Bela Eco Panel Prefab Construction Project',
    gallery_images: pData.gallery_images || ['/ecopanel_preview.png'],
    project_files: pData.project_files || [],
    created_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  try {
    await pgPool.query(
      `INSERT INTO projects (
        id, name, customer_name, location, building_type, area_sqft, floors, assigned_staff,
        status, estimated_cost, start_date, completion_date, description, gallery_images, project_files, created_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        newProject.id,
        newProject.name,
        newProject.customer_name,
        newProject.location,
        newProject.building_type,
        newProject.area_sqft,
        newProject.floors,
        newProject.assigned_staff,
        newProject.status,
        newProject.estimated_cost,
        newProject.start_date,
        newProject.completion_date,
        newProject.description,
        JSON.stringify(newProject.gallery_images),
        JSON.stringify(newProject.project_files),
        newProject.created_date,
        newProject.created_at
      ]
    );
  } catch (e) {
    // fallback
  }

  inMemoryProjects.unshift(newProject);
  return newProject;
}

export async function updateProjectInDb(id: string, pData: Partial<Project>): Promise<Project | null> {
  const existing = await getProjectByIdFromDb(id);
  if (!existing) return null;

  const updated: Project = {
    ...existing,
    ...pData,
    gallery_images: pData.gallery_images || existing.gallery_images,
    project_files: pData.project_files || existing.project_files
  };

  try {
    await pgPool.query(
      `UPDATE projects SET 
        name = $1, customer_name = $2, location = $3, building_type = $4, area_sqft = $5, floors = $6,
        assigned_staff = $7, status = $8, estimated_cost = $9, start_date = $10, completion_date = $11,
        description = $12, gallery_images = $13, project_files = $14
      WHERE id = $15`,
      [
        updated.name,
        updated.customer_name,
        updated.location,
        updated.building_type,
        updated.area_sqft,
        updated.floors,
        updated.assigned_staff,
        updated.status,
        updated.estimated_cost,
        updated.start_date,
        updated.completion_date,
        updated.description,
        JSON.stringify(updated.gallery_images),
        JSON.stringify(updated.project_files),
        id
      ]
    );
  } catch (e) {
    // fallback
  }

  const idx = inMemoryProjects.findIndex((p) => p.id === id);
  if (idx !== -1) inMemoryProjects[idx] = updated;
  return updated;
}

export async function deleteProjectFromDb(id: string): Promise<boolean> {
  try {
    await pgPool.query('DELETE FROM projects WHERE id = $1', [id]);
  } catch (e) {
    // fallback
  }

  inMemoryProjects = inMemoryProjects.filter((p) => p.id !== id);
  return true;
}

export async function addProjectGalleryImageInDb(id: string, imageUrl: string): Promise<Project | null> {
  return addProjectGalleryImagesInDb(id, [imageUrl]);
}

export async function addProjectGalleryImagesInDb(id: string, imageUrls: string[]): Promise<Project | null> {
  const project = await getProjectByIdFromDb(id);
  if (!project) return null;

  const updatedImages = [...imageUrls, ...(project.gallery_images || [])];
  return updateProjectInDb(id, { gallery_images: updatedImages });
}

export async function addProjectDocumentInDb(id: string, fileItem: ProjectFile): Promise<Project | null> {
  const project = await getProjectByIdFromDb(id);
  if (!project) return null;

  const updatedFiles = [fileItem, ...(project.project_files || [])];
  return updateProjectInDb(id, { project_files: updatedFiles });
}

export async function deleteProjectFileInDb(id: string, fileOrImgId: string): Promise<Project | null> {
  const project = await getProjectByIdFromDb(id);
  if (!project) return null;

  const updatedImages = (project.gallery_images || []).filter((img) => img !== fileOrImgId);
  const updatedFiles = (project.project_files || []).filter((f) => f.id !== fileOrImgId && f.file_url !== fileOrImgId);

  return updateProjectInDb(id, {
    gallery_images: updatedImages,
    project_files: updatedFiles
  });
}

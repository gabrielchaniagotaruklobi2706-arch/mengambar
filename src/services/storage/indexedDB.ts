import { Project, ProjectSummary } from "../../types/project";

const DB_NAME = "AIDrawingStudioDB";
const DB_VERSION = 1;
const STORE_NAME = "projects";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProjectSummaries(): Promise<ProjectSummary[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const projects = (request.result as Project[]) || [];
        const summaries: ProjectSummary[] = projects
          .map((p) => ({
            id: p.id,
            name: p.name,
            width: p.width,
            height: p.height,
            thumbnail: p.thumbnail,
            updatedAt: p.updatedAt,
            layerCount: p.layers?.length || 1,
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(summaries);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("IndexedDB getAllProjectSummaries failed, returning empty:", err);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve((request.result as Project) || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB getProjectById error:", err);
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const updatedProject = {
        ...project,
        updatedAt: Date.now(),
      };
      const request = store.put(updatedProject);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB saveProject error:", err);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB deleteProject error:", err);
  }
}

export async function duplicateProject(id: string): Promise<Project | null> {
  const original = await getProjectById(id);
  if (!original) return null;

  const duplicated: Project = {
    ...original,
    id: "proj_" + Math.random().toString(36).substring(2, 9),
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProject(duplicated);
  return duplicated;
}

// Aliases for convenience
export const saveProjectToStorage = saveProject;
export const getProjectFromStorage = getProjectById;
export const deleteProjectFromStorage = deleteProject;

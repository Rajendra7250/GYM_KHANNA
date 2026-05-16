/* ===== IndexedDB Photo Storage ===== */
const PhotoDB = (() => {
  const DB_NAME = 'GymKhannaDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'photos';

  let db = null;

  function init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB Error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async function ensureDB() {
    if (!db) await init();
    return db;
  }

  async function savePhoto(base64Data, dateStr) {
    await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const photo = {
        id: id,
        date: dateStr || new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        data: base64Data
      };

      const request = store.add(photo);

      request.onsuccess = () => resolve(photo);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function getPhotos() {
    await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const photos = request.result || [];
        // Sort newest first
        photos.sort((a, b) => b.timestamp - a.timestamp);
        resolve(photos);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function deletePhoto(id) {
    await ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  }

  return { init, savePhoto, getPhotos, deletePhoto };
})();

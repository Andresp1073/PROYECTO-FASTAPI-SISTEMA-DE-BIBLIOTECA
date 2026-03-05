// src/api/uploads.js
import http from "./http.js";

/**
 * POST /uploads/covers
 * Subir imagen de portada
 */
export const uploadCover = async (file) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await http.post("/uploads/covers", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
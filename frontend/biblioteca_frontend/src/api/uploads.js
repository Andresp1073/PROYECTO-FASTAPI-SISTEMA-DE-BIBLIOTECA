import http from "./http.js";

export async function uploadCover(file) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post("/uploads/covers", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Puede devolver {url: "..."} o {cover_url: "..."} o string directo
  if (typeof data === "string") return data;
  return data?.url || data?.cover_url || data?.public_url || "";
}
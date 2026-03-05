import http from "./http.js";

export async function bulkLibrosCSV(file) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post("/bulk/libros", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
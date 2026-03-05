// [MODIFICADO]

export function fmtFecha(valor) {
  if (!valor) return "-";
  const s = String(valor);
  return s.replace("T", " ").split(".")[0];
}

export function textoCorto(str, max = 120) {
  const s = String(str ?? "").trim();
  if (!s) return "-";
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + "…";
}

export function safeUpper(str) {
  return String(str ?? "").toUpperCase();
}
import http from "./http.js";

export const solicitarPrestamo = async (libroId) => {
  const res = await http.post("/solicitudes/prestar", { libro_id: libroId });
  return res.data;
};

export const getMisSolicitudes = async () => {
  const res = await http.get("/solicitudes/mis-solicitudes");
  return res.data;
};

export const getSolicitudesPendientes = async () => {
  const res = await http.get("/solicitudes/admin");
  return res.data;
};

export const aprobarSolicitud = async (solicitudId) => {
  const res = await http.post(`/solicitudes/admin/${solicitudId}/procesar`, { accion: "aprobar" });
  return res.data;
};

export const rechazarSolicitud = async (solicitudId, notaRechazo) => {
  const res = await http.post(`/solicitudes/admin/${solicitudId}/procesar`, { accion: "rechazar", nota_rechazo: notaRechazo });
  return res.data;
};

export const getMisNotificaciones = async () => {
  const res = await http.get("/solicitudes/notificaciones");
  return res.data;
};

export const getNotificacionesNoLeidas = async () => {
  const res = await http.get("/solicitudes/notificaciones/no-leidas");
  return res.data;
};

export const marcarNotificacionLeida = async (notificacionId) => {
  const res = await http.post(`/solicitudes/notificaciones/${notificacionId}/leer`);
  return res.data;
};

export const marcarTodasLeidas = async () => {
  const res = await http.post("/solicitudes/notificaciones/leer-todas");
  return res.data;
};

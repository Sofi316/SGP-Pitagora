import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor para peticiones: Agrega el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para respuestas: Maneja la expiración del JWT (CU01)
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Si el servidor responde 401, el token expiró o es inválido
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada. Limpiando datos y redirigiendo...");
      
      // Limpiamos el storage de la Constructora Pitágoras
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      
      // Redirección forzada al login con aviso de expiración
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
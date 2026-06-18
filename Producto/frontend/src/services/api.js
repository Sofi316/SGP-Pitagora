import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/') {
        console.warn("Sesión expirada detectada por el servidor.");
        localStorage.clear(); 
        window.location.replace('/?expired=true'); 
      }
    } else if (!error.response) {
      console.error("Error de red: No se pudo conectar con el backend.");
      alert("No se pudo conectar con el servidor. Revisa tu conexión o intenta nuevamente más tarde.");
    }
    return Promise.reject(error);
  }
);

export default api;

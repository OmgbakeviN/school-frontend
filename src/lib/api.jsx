// src/lib/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const api = axios.create({ baseURL });

let isRefreshing = false;
let queue = [];

// Helpers
function setAuthHeader(config, token) {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}
function enqueueRequest(resolve, reject) { queue.push({ resolve, reject }); }
function flushQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}
function clearTokensAndKick() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  // Redirige vers la page de login
  window.location.href = "/";
}

// Attach access token on every request
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  return setAuthHeader(config, access);
});

// Refresh on 401 and retry once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (!response) return Promise.reject(error); // réseau
    if (response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      clearTokensAndKick();
      return Promise.reject(error);
    }

    // Eviter plusieurs refresh simultanés
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueueRequest(resolve, reject);
      })
        .then((newToken) => {
          config._retry = true;
          setAuthHeader(config, newToken);
          return api(config);
        })
        .catch((err) => Promise.reject(err));
    }

    // Lance le refresh
    config._retry = true;
    isRefreshing = true;
    try {
      // IMPORTANT: utiliser axios "nu" pour ne pas repasser par cet intercepteur
      const { data } = await axios.post(`${baseURL}/api/auth/refresh/`, { refresh });
      const newAccess = data.access;
      localStorage.setItem("access", newAccess);
      isRefreshing = false;
      flushQueue(null, newAccess);

      setAuthHeader(config, newAccess);
      return api(config); // rejoue la requête initiale
    } catch (refreshErr) {
      isRefreshing = false;
      flushQueue(refreshErr, null);
      clearTokensAndKick();
      return Promise.reject(refreshErr);
    }
  }
);

export default api;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const login = createAsyncThunk("auth/login", async ({ username, password }) => {
  // Utilise axios nu (pas l'instance api) pour éviter 401->refresh sur /login
  const { data } = await axios.post(`${baseURL}/api/auth/login/`, { username, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
});

export const getMe = createAsyncThunk("auth/getMe", async () => {
  const { data } = await api.get("/api/me/");
  return data; // { id, username, role, ... }
});

const initialState = {
  access: localStorage.getItem("access") || null,
  refresh: localStorage.getItem("refresh") || null,
  user: null,
  status: "idle",
  userStatus: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.access = null;
      state.refresh = null;
      state.user = null;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = "loading"; s.error = null; })
     .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.access = a.payload.access;
        s.refresh = a.payload.refresh;
     })
     .addCase(login.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message || "Login failed"; })

     .addCase(getMe.pending, (s) => { s.userStatus = "loading"; })
     .addCase(getMe.fulfilled, (s, a) => { s.userStatus = "succeeded"; s.user = a.payload; })
     .addCase(getMe.rejected, (s) => { s.userStatus = "failed"; s.user = null; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export const login = createAsyncThunk("auth/login", async ({ username, password }) => {
  const { data } = await api.post("/api/auth/login/", { username, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
});

const initialState = { access: localStorage.getItem("access") || null, refresh: localStorage.getItem("refresh") || null, user: null, status: "idle", error: null };

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
    setUser(state, action) { state.user = action.payload; }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => { state.status = "loading"; })
      .addCase(login.fulfilled, (state, action) => { state.status = "succeeded"; state.access = action.payload.access; state.refresh = action.payload.refresh; })
      .addCase(login.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

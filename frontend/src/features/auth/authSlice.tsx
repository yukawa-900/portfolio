import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTH_SIGNIN, PROPS_AUTH_SIGNUP } from "../types";

const apiUrl = "http://localhost:8000/";

export const login = createAsyncThunk(
  "auth/login",
  async (data: PROPS_AUTH_SIGNIN) => {
    const res = await axios.post(`${apiUrl}dj-rest-auth/login/`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await axios.post(
    `${apiUrl}dj-rest-auth/logout/`,
    {
      authorization: `JWT ${localStorage.getItem("JWT")}`,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});

export const register = createAsyncThunk(
  "auth/register",
  async (data: PROPS_AUTH_SIGNUP) => {
    const res = await axios.post(`${apiUrl}dj-rest-auth/registration/`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthLoading: false,
    isAuthRejected: false,
  },
  reducers: {
    startAuth(state) {
      state.isAuthLoading = true;
    },
    endAuth(state) {
      state.isAuthLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      localStorage.setItem("JWT", action.payload.access_token);
      window.location.href = "/";
      state.isAuthRejected = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isAuthRejected = true;
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      localStorage.removeItem("JWT");
      window.location.href = "/signin";
    });
  },
});

export const { startAuth, endAuth } = authSlice.actions;

export const selectIsAuthLoading = (state: RootState) =>
  state.auth.isAuthLoading;

export const selectIsAuthRejected = (state: RootState) =>
  state.auth.isAuthRejected;

export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTH_SIGNIN, PROPS_AUTH_SIGNUP } from "../types";
require("dotenv").config();

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

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
  await axios.post(`${apiUrl}dj-rest-auth/logout/`, {
    headers: {
      "Content-Type": "application/json",
      authorization: `JWT ${localStorage.getItem("token")}`,
    },
  });
});

export const register = createAsyncThunk(
  "auth/register",
  async (data: PROPS_AUTH_SIGNUP) => {
    const res1 = await axios.post(`${apiUrl}dj-rest-auth/registration/`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
);

export const fetchTwitterURL = createAsyncThunk(
  "auth/twitterRequestToken",
  async () => {
    const res = await axios.get(`${apiUrl}twitter/request_token/`);
    if (res.status === 200) {
      window.location.assign(res.data.authenticate_endpoint);
    }
  }
);

export const fetchTwitterAccessToken = createAsyncThunk(
  "auth/twitterAccessToken",
  async (queryString: string) => {
    const res1 = await axios.get(
      `${apiUrl}twitter/access_token/${queryString}`
    );

    const data = {
      access_token: res1.data.oauth_token,
      token_secret: res1.data.oauth_token_secret,
    };

    const res2 = await axios.post(`${apiUrl}dj-rest-auth/twitter/`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res2.data;
  }
);

interface authState {
  isDarkMode: null | Boolean;
  isAuthLoading: Boolean;
  isAuthRejected: Boolean;
}

const initialState: authState = {
  isDarkMode: true,
  isAuthLoading: false,
  isAuthRejected: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeColorMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
    startAuth(state) {
      state.isAuthLoading = true;
    },
    endAuth(state) {
      state.isAuthLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      localStorage.setItem("token", action.payload.access_token);
      state.isAuthRejected = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isAuthRejected = true;
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    });
    builder.addCase(fetchTwitterAccessToken.fulfilled, (state, action) => {
      localStorage.setItem("token", action.payload.access_token);
      state.isAuthRejected = false;
      window.location.href = "/";
    });
    builder.addCase(fetchTwitterAccessToken.rejected, (state, action) => {
      state.isAuthRejected = true;
    });
  },
});

export const { changeColorMode, startAuth, endAuth } = authSlice.actions;

export const selectIsDarkMode = (state: RootState) => state.auth.isDarkMode;

export const selectIsAuthLoading = (state: RootState) =>
  state.auth.isAuthLoading;

export const selectIsAuthRejected = (state: RootState) =>
  state.auth.isAuthRejected;

export default authSlice.reducer;

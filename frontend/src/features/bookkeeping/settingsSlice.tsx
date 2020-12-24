import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import { FILTER_PARAMS_PAYLOAD } from "../types";
import _, { filter, initial } from "lodash";
import formatDate from "./components/utils/formatDate";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const initialState: any = {
  active: {
    accounts: [],
    currencies: [],
    taxes: [],
    departments: [],
  },
  inactive: {
    accounts: [],
    currencies: [],
    taxes: [],
    departments: [],
  },
};

export const fetchActiveItems = createAsyncThunk(
  "bookkeeping/fetchActiveItems",
  async (data: any) => {
    const res = await axios.get(
      `${apiUrl}api/v1/${data.items}/${data.active}-list/`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `JWT ${localStorage.getItem("token")}`,
        },
      }
    );

    const response: any = {};

    response["items"] = data.items;
    response["active"] = data.active;
    response["data"] = res.data;
    return response;
  }
);

export const fetchAllActiveItems = createAsyncThunk(
  "bookkeeping/fetchAllActiveItems",
  async (active: "active" | "inactive") => {
    const list = ["accounts", "currencies", "departments", "taxes"];

    const response: any = { active: active, data: {} };

    for (const items of list) {
      const res = await axios.get(`${apiUrl}api/v1/${items}/${active}-list/`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `JWT ${localStorage.getItem("token")}`,
        },
      });
      response["data"][items] = res.data;
    }

    return response;
  }
);

export const updateExclusion = createAsyncThunk(
  "bookkeeping/updateExclusion",
  async (data: any) => {
    const res = await axios.patch(
      `${apiUrl}api/v1/${data.items}/update-exclusion/`,
      data.sentData,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `JWT ${localStorage.getItem("token")}`,
        },
      }
    );

    return res.data;
  }
);

export const settings = createSlice({
  name: "settings",
  initialState,
  reducers: {
    inactivateByIds: (state, action) => {
      const ids = action.payload.ids;
      const target = action.payload.target;
      const addedItems = state.active[target].filter((obj: any) =>
        ids.includes(obj.id)
      );
      state.active[target] = state.active[target].filter(
        (obj: any) => !ids.includes(obj.id)
      );
      state.inactive[target] = state.inactive[target].concat(addedItems);
    },
    activate: (state, action: PayloadAction<any>) => {
      state.active[action.payload.target] = action.payload.data;
      if (action.payload.target == "accounts") {
        state.active.accounts = _.orderBy(
          state.active.accounts,
          ["categoryOrder", "code"],
          ["asc", "asc"]
        );
      }
    },
    inactivate: (state, action: PayloadAction<any>) => {
      state.inactive[action.payload.target] = action.payload.data;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchActiveItems.fulfilled, (state, action) => {
      const payload = action.payload;
      state[payload.active][payload.items] = payload.data;
    });
    builder.addCase(fetchAllActiveItems.fulfilled, (state, action) => {
      state[action.payload.active] = action.payload.data;
    });
  },
});

export const { activate, inactivate, inactivateByIds } = settings.actions;

export const selectActiveCurrencies = (state: RootState) =>
  state.settings.active.currencies;

export const selectInactiveCurrencies = (state: RootState) =>
  state.settings.inactive.currencies;

export const selectActiveDepartments = (state: RootState) =>
  state.settings.active.departments;

export const selectInactiveDepartments = (state: RootState) =>
  state.settings.inactive.departments;

export const selectActiveAccounts = (state: RootState) =>
  state.settings.active.accounts;

export const selectInactiveAccounts = (state: RootState) =>
  state.settings.inactive.accounts;

export const selectActiveTaxes = (state: RootState) =>
  state.settings.active.taxes;

export const selectInactiveTaselectActiveTaxes = (state: RootState) =>
  state.settings.inactive.taxes;

// export const selectIsLoading = (state: RootState) => state.settings.isLoading;

// export const selectFilteredTransactionGroup = (state: RootState) =>
//   state.settings.filteredTransactionGroup;

// export const selectEditableTransactionGroup = (state: RootState) =>
//   state.settings.editableTransactionGroup;

export default settings.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import {
  ACCOUNT_OBJECT,
  CURRENCY_OBJECT,
  TAX_OBJECT,
  DEPARTMENT_OBJECT,
  EXCHANGE_OBJECT,
  TRANSACTION_OBJECT,
  TRANSACTION_PAYLOAD,
  TRANSACTION_GROUP_PAYLOAD,
  TRANSAC_GROUP_KEY,
  POST_TRANSACTON,
  PUT_TRANSACTON,
  GET_TRANSACTON,
} from "../types";
import _, { initial } from "lodash";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

interface stateInterface {
  accounts: Array<ACCOUNT_OBJECT>;
  departments: Array<DEPARTMENT_OBJECT>;
  currencies: Array<CURRENCY_OBJECT>;
  taxes: Array<TAX_OBJECT>;
}

const initialState: stateInterface = {
  accounts: [],
  departments: [],
  currencies: [],
  taxes: [],
};

export const fetchAccounts = createAsyncThunk(
  "bookkeeping/fetchAccounts",
  async () => {
    const accounts = await axios.get(`${apiUrl}api/v1/accounts/active-list/`, {
      headers: {
        "Content-Type": "application/json",
        authorization: `JWT ${localStorage.getItem("token")}`,
      },
    });
    return accounts.data;
  }
);

export const fetchDepartments = createAsyncThunk(
  "bookkeeping/fetchDepartments",
  async () => {
    const departments = await axios.get(
      `${apiUrl}api/v1/departments/active-list/`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `JWT ${localStorage.getItem("token")}`,
        },
      }
    );
    return departments.data;
  }
);

export const fetchCurrencies = createAsyncThunk(
  "bookkeeping/fetchCurrencies",
  async () => {
    const currencies = await axios.get(
      `${apiUrl}api/v1/currencies/active-list/`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `JWT ${localStorage.getItem("token")}`,
        },
      }
    );
    return currencies.data;
  }
);

export const fetchTaxes = createAsyncThunk(
  "bookkeeping/fetchTaxes",
  async () => {
    const taxes = await axios.get(`${apiUrl}api/v1/taxes/active-list/`, {
      headers: {
        "Content-Type": "application/json",
        authorization: `JWT ${localStorage.getItem("token")}`,
      },
    });
    return taxes.data;
  }
);

export const activeList = createSlice({
  name: "activeList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      return {
        ...state,
        accounts: action.payload,
      };
    });
    builder.addCase(fetchDepartments.fulfilled, (state, action) => {
      return {
        ...state,
        departments: action.payload,
      };
    });
    builder.addCase(fetchCurrencies.fulfilled, (state, action) => {
      return {
        ...state,
        currencies: action.payload,
      };
    });
    builder.addCase(fetchTaxes.fulfilled, (state, action) => {
      return {
        ...state,
        taxes: action.payload,
      };
    });
  },
});

export const {} = activeList.actions;

export const selectAccounts = (state: RootState) => state.activeList.accounts;
export const selectDepartments = (state: RootState) =>
  state.activeList.departments;

export const selectCurrencies = (state: RootState) =>
  state.activeList.currencies;

export const selectTaxes = (state: RootState) => state.activeList.taxes;

// export const selectEditedTransactions = (state: RootState) =>
//   state.bookkeeping.editedTransactions;

// export const selectEditedDate = (state: RootState) =>
//   state.bookkeeping.editedTransactions.date;

export default activeList.reducer;

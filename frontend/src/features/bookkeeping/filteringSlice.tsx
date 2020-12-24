import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import { FILTER_PARAMS_PAYLOAD } from "../types";
import _, { filter, initial } from "lodash";
import formatDate from "./components/utils/formatDate";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const initialState: any = {
  isLoading: false,
  filteringParams: {
    dateBefore: formatDate(new Date()),
    dateAfter: formatDate(new Date()),
    pdfName: "",
    slipNum: "",
  },
  filteredTransactionGroup: [],
  editableTransactionGroup: [],
};

export const filterTransactionGroup = createAsyncThunk(
  "bookkeeping/filterTransactionGroup",
  async (params: any) => {
    // for (const key of Object.keys(params)) {
    //   if (!params[key]) {
    //     params[key] = "";
    //   }
    // }

    const res = await axios.get(
      `${apiUrl}api/v1/transactions/?date_after=${params.dateAfter}&date_before=${params.dateBefore}&pdf=${params.pdfName}&slipNum=${params.slipNum}`,
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

export const fetchEditableTransactionGroup = createAsyncThunk(
  "bookkeeping/fetchEditableTransactionGroup",
  async () => {
    const res = await axios.get(
      `${apiUrl}api/v1/transactions/?createdOn=${formatDate(new Date())}`,
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

export const filtering = createSlice({
  name: "filtering",
  initialState,
  reducers: {
    changeFilteringParams: (
      state,
      action: PayloadAction<FILTER_PARAMS_PAYLOAD>
    ) => {
      const key = Object.keys(action.payload)[0];
      state.filteringParams[key] = action.payload[key];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(filterTransactionGroup.pending, (state, action) => {
      return {
        ...state,
        isLoading: true,
      };
    });
    builder.addCase(filterTransactionGroup.fulfilled, (state, action) => {
      return {
        ...state,
        isLoading: false,
        filteredTransactionGroup: action.payload,
      };
    });
    builder.addCase(filterTransactionGroup.rejected, (state, action) => {
      window.location.href = "/signin";
    });
    builder.addCase(
      fetchEditableTransactionGroup.fulfilled,
      (state, action) => {
        return {
          ...state,
          isLoading: false,
          editableTransactionGroup: action.payload,
        };
      }
    );
    builder.addCase(fetchEditableTransactionGroup.rejected, (state, action) => {
      window.location.href = "/signin";
    });
  },
});

export const { changeFilteringParams } = filtering.actions;

export const selectFilteringParams = (state: RootState) =>
  state.filtering.filteringParams;

export const selectIsLoading = (state: RootState) => state.filtering.isLoading;

export const selectFilteredTransactionGroup = (state: RootState) =>
  state.filtering.filteredTransactionGroup;

export const selectEditableTransactionGroup = (state: RootState) =>
  state.filtering.editableTransactionGroup;

export default filtering.reducer;

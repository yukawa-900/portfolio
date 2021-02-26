import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import { FILTER_PARAMS_PAYLOAD } from "../types";
import _, { filter, initial } from "lodash";
import formatDate from "../utils/dateFormatter";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const initialState: any = {
  isError: false,
  message: "",
  selectedDate: formatDate(new Date()),
  selectedDeptID: "",
  departments: [],
  costItems: [],
  salesUnits: [],
  employees: [],
};

export const ameba = createSlice({
  name: "ameba",
  initialState,
  reducers: {
    setState: (state, action) => {
      const target = action.payload.target;
      state[target] = action.payload.data;
    },
  },
  extraReducers: (builder) => {},
});

export const { setState } = ameba.actions;

export const selectIsError = (state: RootState) => state.ameba.isError;

export const selectMessage = (state: RootState) => state.ameba.message;

export const selectSelectedDate = (state: RootState) =>
  state.ameba.selectedDate;

export const selectSelectedDeptID = (state: RootState) =>
  state.ameba.selectedDeptID;

export const selectDepartments = (state: RootState) => state.ameba.departments;

export const selectEmployees = (state: RootState) => state.ameba.employees;

export const selectCostItems = (state: RootState) => state.ameba.costItems;

export const selectSalesUnits = (state: RootState) => state.ameba.salesUnits;

export default ameba.reducer;

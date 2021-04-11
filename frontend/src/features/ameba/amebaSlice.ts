import { createSlice } from "@reduxjs/toolkit";
import { string } from "yup";
import { RootState } from "../../app/store";
import formatDate from "../utils/dateFormatter";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const initialState: any = {
  isError: false,
  isLoading: false,
  message: "",
  imageSrc: "",
  isPhotoEdited: false,
  selectedDate: formatDate(new Date()),
  selectedDeptID: localStorage.getItem("selectedDeptID")
    ? localStorage.getItem("selectedDeptID")
    : "",
  isMonth: false,
  departments: [],
  costItems: [],
  salesCategories: [],
  salesUnits: [],
  employees: [],
  getAllSalesUnits: null,
  getAllEmployees: null,
  getAllCostItems: null,
  getAllSalesCategories: null,
  graphFilterVariables: {
    displayed: "",
    dataType: "",
  },
  // filterVariables: {},
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

export const selectIsMonth = (state: RootState) => state.ameba.isMonth;

export const selectIsLoading = (state: RootState) => state.ameba.isLoading;
export const selectIsError = (state: RootState) => state.ameba.isError;

export const selectMessage = (state: RootState) => state.ameba.message;

export const selectIsPhotoEdited = (state: RootState) =>
  state.ameba.isPhotoEdited;

export const selectSelectedDate = (state: RootState) =>
  state.ameba.selectedDate;

export const selectSelectedDeptID = (state: RootState) =>
  state.ameba.selectedDeptID;

export const selectDepartments = (state: RootState) => state.ameba.departments;

export const selectEmployees = (state: RootState) => state.ameba.employees;

export const selectCostItems = (state: RootState) => state.ameba.costItems;

export const selectSalesCategories = (state: RootState) =>
  state.ameba.salesCategories;

export const selectSalesUnits = (state: RootState) => state.ameba.salesUnits;

export const selectImageSrc = (state: RootState) => state.ameba.imageSrc;

export const selectGetAllEmployees = (state: RootState) =>
  state.ameba.getAllEmployees;

export const selectGetAllSalesUnits = (state: RootState) =>
  state.ameba.getAllSalesUnits;

export const selectGetAllCostItems = (state: RootState) =>
  state.ameba.getAllCostItems;

export const selectGetAllSalesCategories = (state: RootState) =>
  state.ameba.getAllSalesCategories;

export const selectGraphFilterVariables = (state: RootState) =>
  state.ameba.graphFilterVariables;

export default ameba.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import { FILTER_PARAMS_PAYLOAD } from "../types";
import _, { filter, initial } from "lodash";
import formatDate from "../utils/dateFormatter";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const initialState: any = {
  isEdit: true,
  isDialogOpen: false,
  account: {},
  department: {},
  accountCategories: [],
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
  "settings/fetchActiveItems",
  async (data: any) => {
    const res = await axios.get(
      `${apiUrl}api/v1/bookkeeping/${data.items}/${data.active}-list/`
    );

    const response: any = {};

    response["items"] = data.items;
    response["active"] = data.active;
    response["data"] = res.data;
    return response;
  }
);

export const retrieveItem = createAsyncThunk(
  "settings/retrieveItem",
  async (data: any) => {
    const res = await axios.get(
      `${apiUrl}api/v1/bookkeeping/${data.role}/${data.id}/`
    );

    const response: any = {};
    response.data = res.data;
    response.role = data.role;

    return response;
  }
);

export const fetchAllActiveItems = createAsyncThunk(
  "settings/fetchAllActiveItems",
  async () => {
    const itemsList = ["accounts", "currencies", "departments", "taxes"];
    const response: any = {
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
      accountCategories: [],
    };

    for (const active of ["active", "inactive"]) {
      for (const items of itemsList) {
        const res = await axios.get(
          `${apiUrl}api/v1/bookkeeping/${items}/${active}-list/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        response[active][items] = res.data;
      }
    }

    const res = await axios.get(
      `${apiUrl}api/v1/bookkeeping/account-categories/`
    );

    response["accountCategories"] = res.data;

    return response;
  }
);

export const updateExclusion = createAsyncThunk(
  "settings/updateExclusion",
  async (data: any) => {
    const res = await axios.patch(
      `${apiUrl}api/v1/bookkeeping/${data.items}/update-exclusion/`,
      data.sentData
    );

    return res.data;
  }
);

export const updateSettingsItem = createAsyncThunk(
  "settings/updateSettingsItem",
  async (data: any) => {
    const res = await axios.put(
      `${apiUrl}api/v1/bookkeeping/${data.role}/${data.id}/`,
      data.sentData
    );

    const response = {
      data: res.data,
      role: data.role,
    };

    return response;
  }
);

export const createSettingsItem = createAsyncThunk(
  "settings/createSettingsItem",
  async (data: any) => {
    const res = await axios.post(
      `${apiUrl}api/v1/bookkeeping/${data.role}/`,
      data.sentData
    );

    const response = {
      data: res.data,
      role: data.role,
    };

    return response;
  }
);

export const deleteSettingsItem = createAsyncThunk(
  "settings/deleteSettingsItem",
  async (data: any) => {
    const res = await axios.delete(
      `${apiUrl}api/v1/bookkeeping/${data.role}/${data.id}/`
    );

    const response = {
      id: data.id,
      role: data.role,
    };

    return response;
  }
);

export const settings = createSlice({
  name: "settings",
  initialState,
  reducers: {
    changeIsEdit: (state, action) => {
      state.isEdit = action.payload;
    },
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
    initializeForm: (state, action) => {
      const target = action.payload.target;
      state[target] = {};
    },
    handleDialogOpen: (state, action) => {
      state.isDialogOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchActiveItems.fulfilled, (state, action) => {
      const payload = action.payload;
      state[payload.active][payload.items] = payload.data;
    });
    builder.addCase(fetchAllActiveItems.fulfilled, (state, action) => {
      state["active"] = action.payload.active;
      state["inactive"] = action.payload.inactive;
      state["accountCategories"] = action.payload.accountCategories;
    });
    builder.addCase(retrieveItem.fulfilled, (state, action) => {
      const key = action.payload.role.slice(0, -1); // departments => department
      state[key] = action.payload.data;
    });

    builder.addCase(updateSettingsItem.fulfilled, (state, action) => {
      // acitve, inactiveの中から、更新対象を探し出し、更新する
      const role = action.payload.role;
      const updatedData = action.payload.data;
      for (let i = 0; i < state.active[role].length; i++) {
        if (state.active[role][i].id === updatedData.id) {
          state.active[role][i] = updatedData;
        }
      }
      for (let i = 0; i < state.inactive[role].length; i++) {
        if (state.inactive[role][i].id === updatedData.id) {
          state.inactive[role][i] = updatedData;
        }
      }
      state[role.slice(0, -1)] = updatedData;
    });
    builder.addCase(createSettingsItem.fulfilled, (state, action) => {
      // state.acitveに追加する
      state["active"][action.payload.role].unshift(action.payload.data);
    });
    builder.addCase(deleteSettingsItem.fulfilled, (state, action) => {
      // acitve, inactiveの中から、更新対象を探し出し、消去する
      const role = action.payload.role;

      for (let i = 0; i < state.active[role].length; i++) {
        if (state.active[role][i].id === action.payload.id) {
          state.active[role].splice(i, 1);
        }
      }
      for (let i = 0; i < state.inactive[role].length; i++) {
        if (state.inactive[role][i].id === action.payload.id) {
          state.inactive[role].splice(i, 1);
        }
      }
    });
  },
});

export const {
  activate,
  inactivate,
  inactivateByIds,
  changeIsEdit,
  initializeForm,
  handleDialogOpen,
} = settings.actions;

export const selectIsEdit = (state: RootState) => state.settings.isEdit;
export const selectIsDialogOpen = (state: RootState) =>
  state.settings.isDialogOpen;

export const selectAccountCategories = (state: RootState) =>
  state.settings.accountCategories;

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

export const selectAccount = (state: RootState) => state.settings.account;

export const selectDepartment = (state: RootState) => state.settings.department;

// export const selectIsLoading = (state: RootState) => state.settings.isLoading;

// export const selectFilteredTransactionGroup = (state: RootState) =>
//   state.settings.filteredTransactionGroup;

// export const selectEditableTransactionGroup = (state: RootState) =>
//   state.settings.editableTransactionGroup;

export default settings.reducer;

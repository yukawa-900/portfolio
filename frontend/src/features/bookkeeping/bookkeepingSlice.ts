import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import { INFO_OBJECT } from "../types";
const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

interface BookkeepingState {
  value: number;
  accountInfo: Array<INFO_OBJECT>;
}

const initialState: BookkeepingState = {
  value: 0,
  accountInfo: [],
};

export const fetchAccountInfo = createAsyncThunk(
  "bookkeeping/fetchAccountInfo",
  async () => {
    const accountInfo = await axios.get(`${apiUrl}api/v1/accounts/`, {
      headers: {
        "Content-Type": "application/json",
        authorization: `JWT ${localStorage.getItem("token")}`,
      },
    });
    return accountInfo.data;
  }
);

export const bookkeepingSlice = createSlice({
  name: "bookkeeping",
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.value += action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccountInfo.fulfilled, (state, action) => {
      state.accountInfo = action.payload;
    });
    // builder2
    // builder3
  },
});

export const { increment, decrement } = bookkeepingSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched

export const selectAccountInfo = (state: RootState) =>
  state.bookkeeping.accountInfo;

export default bookkeepingSlice.reducer;

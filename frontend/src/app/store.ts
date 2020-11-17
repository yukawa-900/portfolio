import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import bookkeepingReducer from "../features/bookkeeping/bookkeepingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookkeeping: bookkeepingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type AppDispatch = typeof store.dispatch;

import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";

import authReducer from "../features/auth/authSlice";
import bookkeepingReducer from "../features/bookkeeping/bookkeepingSlice";
import activeListReducer from "../features/bookkeeping/activeListSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookkeeping: bookkeepingReducer,
    activeList: activeListReducer,
  },
  preloadedState: load({
    states: ["auth", "activeList"],
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      save({
        states: ["auth", "activeList"],
      })
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type AppDispatch = typeof store.dispatch;

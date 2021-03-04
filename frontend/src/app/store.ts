import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";

import authReducer from "../features/auth/authSlice";
import bookkeepingReducer from "../features/bookkeeping/bookkeepingSlice";
import activeListReducer from "../features/bookkeeping/activeListSlice";
import filteringReducer from "../features/bookkeeping/filteringSlice";
import settingsReducer from "../features/bookkeeping/settingsSlice";
import amebaReducer from "../features/ameba/amebaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookkeeping: bookkeepingReducer,
    activeList: activeListReducer,
    filtering: filteringReducer,
    settings: settingsReducer,
    ameba: amebaReducer,
  },
  preloadedState: load({
    states: ["auth", "settings"],
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      save({
        states: ["auth", "settings"],
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

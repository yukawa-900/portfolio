import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { load, save } from "redux-localstorage-simple";
import amebaReducer from "../features/ameba/amebaSlice";
import authReducer from "../features/auth/authSlice";
import activeListReducer from "../features/bookkeeping/activeListSlice";
import bookkeepingReducer from "../features/bookkeeping/bookkeepingSlice";
import filteringReducer from "../features/bookkeeping/filteringSlice";
import settingsReducer from "../features/bookkeeping/settingsSlice";

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
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
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

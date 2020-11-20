import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import {
  INFO_OBJECT,
  TRANSACTION_OBJECT,
  TRANSACTION_PAYLOAD,
  POST_TRANSACTON,
  PUT_TRANSACTON,
  GET_TRANSACTON,
} from "../types";
import _, { initial } from "lodash";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

interface bookkeepingInterface {
  value: number;
  accountInfo: Array<INFO_OBJECT>;
  createdTransactions: {
    date: string;
    items: TRANSACTION_OBJECT;
  };
  editedTransactions: { date: string; items: TRANSACTION_OBJECT };
}

const initialCreatedItems: TRANSACTION_OBJECT = {};
const initialEditedItems: TRANSACTION_OBJECT = {};

[...Array(12)].forEach((_, i) => {
  initialCreatedItems[String(i)] = {
    account: "",
    money: "",
    memo: "",
  };
});

[...Array(12)].forEach((_, i) => {
  initialEditedItems[String(i)] = {
    id: "",
    account: "",
    initialAccountName: "",
    money: "",
    memo: "",
  };
});

const initialState: bookkeepingInterface = {
  value: 0,
  accountInfo: [],
  createdTransactions: {
    date: "",
    items: initialCreatedItems,
  },
  editedTransactions: {
    date: "",
    items: initialEditedItems,
  },
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

export const postTransactions = createAsyncThunk(
  "bookkeeping/create",
  async (data: POST_TRANSACTON[]) => {
    await axios.post(`${apiUrl}api/v1/transactions/`, data, {
      headers: {
        "Content-Type": "application/json",
        authorization: `JWT ${localStorage.getItem("token")}`,
      },
    });
  }
);

export const getTransactions = createAsyncThunk(
  "bookkeeping/create",
  async (date: string) => {
    //http://localhost:8000/api/v1/transactions/?date_after=2020-10-19&date_before=2020-10-19
    const res = await axios.get(
      `${apiUrl}api/v1/transactions/?date_after=${date}&date_before=${date}`,
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

export const bookkeepingSlice = createSlice({
  name: "bookkeeping",
  initialState,
  reducers: {
    changeDate: (
      state,
      action: PayloadAction<{ role: "create" | "edit"; date: string }>
    ) => {
      if (action.payload.role === "create") {
        state.createdTransactions.date = action.payload.date;
      } else if (action.payload.role === "edit") {
        state.editedTransactions.date = action.payload.date;
      }
    },
    changeCreatedTransaction: (
      state,
      action: PayloadAction<TRANSACTION_PAYLOAD>
    ) => {
      const target = action.payload.target;
      state.createdTransactions.items[action.payload.index][target] =
        action.payload[target];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccountInfo.fulfilled, (state, action) => {
      state.accountInfo = action.payload;
    });
    builder.addCase(getTransactions.fulfilled, (state, action) => {
      // console.log(state.editedTransactions.items);
      // console.log(action.payload);
      //並び替え
      _.orderBy(action.payload, ["order", "debitCredit"], ["asc", "asc"]);

      console.log(action.payload);
      let expectedDebitCredit = 0;
      // action.payload.forEach((item: any, index: Number) => {

      let index = 0;
      let i = 0;
      while (i < action.payload.length) {
        let data = {};
        const item = action.payload[i];
        if (item.debitCredit === expectedDebitCredit) {
          data = {
            id: item.id,
            account: item.account,
            initialAccountName: item.accountName,
            money: new Intl.NumberFormat("ja-JP", {
              style: "currency",
              currency: "JPY",
            }).format(item.money),
            memo: item.memo,
          };
          i++; // iは、action.pyaloadの通し番号
        } else {
          data = {
            id: "",
            account: "",
            initialAccountName: "",
            money: "",
            memo: "",
          };
        }
        // console.log(data);
        expectedDebitCredit = (expectedDebitCredit + 1) % 2;
        state.editedTransactions.items[String(index)] = data;
        // console.log(state.editedTransactions.items);
        index++; // indexは、新しく作るデータの、通し番号
      }
      // });

      // [{accountName: "受取手形"
      // date: "2020-11-19"
      // debitCredit: 0
      // id: "fe3f0f51-c6ca-4bc7-8dd9-59e46330256d",
      // "account": "5f268e64-3815-4b15-8ecb-096fadbed271",
      // memo: ""
      // money: 1000
      // order: 2
      //}]

      // order, debitCreditでlodashで並べ替え
      // 値の挿入は、レンダリングする際のinitialValuesで制御できる
    });
    // builder2
    // builder3
  },
});

export const {
  changeDate,
  changeCreatedTransaction,
} = bookkeepingSlice.actions;

export const selectAccountInfo = (state: RootState) =>
  state.bookkeeping.accountInfo;
export const selectCreatedTransactions = (state: RootState) =>
  state.bookkeeping.createdTransactions;
export const selectEditedDate = (state: RootState) =>
  state.bookkeeping.editedTransactions.date;
export const selectEditedTransactions = (state: RootState) =>
  state.bookkeeping.editedTransactions;

export default bookkeepingSlice.reducer;

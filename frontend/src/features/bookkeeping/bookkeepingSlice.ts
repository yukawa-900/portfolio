import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppThunk, RootState } from "../../app/store";
import {
  ACCOUNT_OBJECT,
  CURRENCY_OBJECT,
  TAX_OBJECT,
  DEPARTMENT_OBJECT,
  EXCHANGE_OBJECT,
  TRANSACTION_OBJECT,
  TRANSACTION_PAYLOAD,
  TRANSACTION_GROUP_PAYLOAD,
  TRANSAC_GROUP_KEY,
  POST_TRANSACTON,
  PUT_TRANSACTON,
  GET_TRANSACTON,
} from "../types";
import _, { initial } from "lodash";
import { insert } from "formik";
import { v4 as uuidv4 } from "uuid";
import { Translate } from "@material-ui/icons";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

interface bookkeepingInterface {
  rate: number;
  status: {
    isLoading: boolean;
    isError: boolean;
    message: string;
    messageOpen: boolean;
  };
  transactionGroup: any;
  // transactionGroup: {
  //   // [key: string]: string | number | Array<TRANSACTION_OBJECT>;
  //   slipNum: number;
  //   date: string;
  //   memo: string;
  //   pdf: string;
  //   department: string;
  //   currency: string;
  //   transactions: Array<TRANSACTION_OBJECT>;
  // };
  // editedTransactions: { date: string; items: TRANSACTION_OBJECT };
}

const searchIndexByOrder = (state: bookkeepingInterface, index: number) => {
  // transactions（配列）の中で index = order となる箇所(index)を探す
  return state.transactionGroup.transactions
    .map((item: TRANSACTION_OBJECT) => item.order)
    .indexOf(index);
};

const searchIndexById = (state: bookkeepingInterface, id: string) => {
  // transactions（配列）の中で transac.id = id となる箇所(index)を探す
  return state.transactionGroup.transactions
    .map((transac: TRANSACTION_OBJECT) => transac.id)
    .indexOf(id);
};

const initialTransaction = (order: number) => ({
  id: uuidv4(),
  debitCredit: "",
  accountName: "",
  account: "",
  money: "",
  foreignMoney: null,
  tax: "",
  order: order,
});

const initialTransactions = () =>
  [...Array(4)].map((_, i) => initialTransaction(i));

const initialTransactionGroup = {
  id: "",
  date: "",
  slipNum: 0,
  memo: "",
  pdf: null,
  department: "",
  currency: "JPY",
  transactions: initialTransactions(),
};

const initialState: bookkeepingInterface = {
  rate: 1,
  status: {
    isLoading: false,
    isError: true,
    message: "",
    messageOpen: true,
  },
  transactionGroup: initialTransactionGroup,
};

export const fetchExchangeRates = createAsyncThunk(
  "bookkeeping/fetchExchangeRates",
  async (date: string) => {
    const res = await axios.get(
      `https://api.exchangeratesapi.io/${date}?base=JPY`
    );
    return res.data;
  }
);

export const getSlipNum = createAsyncThunk(
  "bookkeeping/slipNum",
  async (date: string) => {
    const res = await axios.get(
      `${apiUrl}/api/v1/bookkeeping/next_slip_num/?date=${date}`
    );
    console.log(`${apiUrl}/api/v1/bookkeeping/next_slip_num/?date=${date}`);
    return res.data;
  }
);

export const postTransactionGroup = createAsyncThunk(
  "bookkeeping/createTransactionGroup",
  async (data: { postData: any; pdf: File | null }) => {
    const res = await axios.post(
      `${apiUrl}/api/v1/bookkeeping/transactions/`,
      data.postData
    );

    if (data.pdf) {
      const uploadData = new FormData();
      uploadData.append("pdf", data.pdf);

      await axios.post(
        `${apiUrl}/api/v1/bookkeeping/transactions/${res.data.id}/upload-pdf/`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    // return res.data;
  }
);

export const postPDF = createAsyncThunk(
  "bookkeeping/postPDF",
  async (data: any) => {
    console.log(data);
    const res = await axios.post(
      `${apiUrl}/api/v1/bookkeeping/transactions/${data.id}/upload-pdf/`,
      data.pdf,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  }
);

export const retrieveTransactionGroup = createAsyncThunk(
  "bookkeeping/retrieveTransactionGroup",
  async (id: string) => {
    const res = await axios.get(
      `${apiUrl}/api/v1/bookkeeping/transactions/${id}/`
    );
    return res.data;
  }
);

export const updateTransactionGroup = createAsyncThunk(
  "bookkeeping/updateTransactionGroup",
  async (data: any) => {
    const res = await axios.put(
      `${apiUrl}/api/v1/bookkeeping/transactions/${data.id}/`,
      data
    );
    return res.data;
  }
);

export const bookkeepingSlice = createSlice({
  name: "bookkeeping",
  initialState,
  reducers: {
    changeDate: (state, action: PayloadAction<{ date: string }>) => {
      state.transactionGroup.date = action.payload.date;
    },
    closeMessage: (state) => {
      state.status.messageOpen = false;
    },
    changeTransactions: (state, action: PayloadAction<TRANSACTION_PAYLOAD>) => {
      const payload: any = action.payload;

      const id = payload.id;
      delete payload.id;
      const key = Object.keys(payload)[0];

      const transacIndex = searchIndexById(state, id);

      state.transactionGroup.transactions[transacIndex][key] =
        action.payload[key];

      // const payload: any = action.payload;
      // const index = payload.index;
      // delete payload.index;
      // const key = Object.keys(action.payload)[0];

      // // order = indexとなる箇所を検索
      // const transacIndex = searchIndexByOrder(state, index);
      // state.transactionGroup.transactions[transacIndex][key] =
      //   action.payload[key];
    },
    changePDF: (state, action) => {
      state.transactionGroup.pdf = action.payload.pdf;
    },
    insertTransaction: (state, action) => {
      const id = action.payload.id;

      // order = indexとなる箇所を検索
      const insertPosition = searchIndexById(state, id) + 1;

      const tempTransactions: Array<TRANSACTION_OBJECT> =
        state.transactionGroup.transactions;
      const length = tempTransactions.length;

      for (let i = insertPosition; i < length; i++) {
        tempTransactions[i].order += 1;
      }

      const insertedOrder =
        state.transactionGroup.transactions[insertPosition - 1].order + 1;

      tempTransactions.splice(
        insertPosition,
        0,
        initialTransaction(insertedOrder)
      );

      state.transactionGroup.transactions = tempTransactions;
    },

    deleteTransaction: (state, action) => {
      state.transactionGroup.transactions = state.transactionGroup.transactions.filter(
        (transac: TRANSACTION_OBJECT) => transac.id != action.payload.id
      );
    },
    expandTransactions: (
      state,
      action: PayloadAction<TRANSACTION_GROUP_PAYLOAD>
    ) => {
      const max = _.maxBy(
        state.transactionGroup.transactions,
        (object: any) => object.order
      )["order"]; // transactionsから、orderが最大となるものを抽出

      for (
        let i = max + 1;
        i < Number(action.payload.expandNum) + max + 1;
        i++
      ) {
        state.transactionGroup.transactions.push(initialTransaction(i));
      }
    },
    changeTransactionGroup: (
      state,
      action: PayloadAction<TRANSACTION_GROUP_PAYLOAD>
    ) => {
      const key = Object.keys(action.payload)[0];
      state.transactionGroup[key] = action.payload[key];
    },
    initializeTransactionGroup: (state) => {
      // 初期化
      let initializedTransactionGroup = _.cloneDeep(state.transactionGroup);
      initializedTransactionGroup.transactions = initialTransactions();
      initializedTransactionGroup.currency = state.transactionGroup.currency;
      initializedTransactionGroup.rate = state.transactionGroup.rate;
      initializedTransactionGroup.date = state.transactionGroup.date;
      initializedTransactionGroup.memo = null;
      initializedTransactionGroup.pdf = null;
      initializedTransactionGroup.slipNum = state.transactionGroup.slipNum + 1;

      state.transactionGroup = initializedTransactionGroup;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchExchangeRates.fulfilled, (state, action) => {
      state.rate = action.payload.rates[state.transactionGroup.currency];
    });
    builder.addCase(fetchExchangeRates.rejected, (state, action) => {});
    // builder2
    // builder3
    builder.addCase(getSlipNum.fulfilled, (state, action) => {
      state.transactionGroup.slipNum = action.payload.nextSlipNum;
    });

    builder.addCase(postTransactionGroup.pending, (state, action) => {
      state.status.isLoading = true;
    });
    builder.addCase(postTransactionGroup.fulfilled, (state, action) => {
      state.status.message = "送信されました";
      state.status.messageOpen = true;
      state.status.isError = false;
      state.status.isLoading = false;
    });
    builder.addCase(postTransactionGroup.rejected, (state, action) => {
      state.status.message = "問題が発生しました";
      state.status.messageOpen = true;
      state.status.isError = true;
      state.status.isLoading = false;
      console.log(action.payload);
    });
    builder.addCase(retrieveTransactionGroup.fulfilled, (state, action) => {
      const payload = action.payload;
      console.log(payload);
      for (let i = 0; i < payload.transactions.length; i++) {
        payload["transactions"][i]["money"] = Number(
          payload["transactions"][i]["money"]
        );
        payload["transactions"][i]["foreignMoney"] = Number(
          payload["transactions"][i]["foreignMoney"]
        );
      }
      state.transactionGroup = payload;
    });
    builder.addCase(updateTransactionGroup.pending, (state, action) => {
      state.status.isLoading = true;
    });
    builder.addCase(updateTransactionGroup.fulfilled, (state, action) => {
      state.status.message = "送信されました";
      state.status.messageOpen = true;
      state.status.isError = false;
      state.status.isLoading = false;
    });
    builder.addCase(updateTransactionGroup.rejected, (state, action) => {
      state.status.message = "問題が発生しました";
      state.status.messageOpen = true;
      state.status.isError = true;
      state.status.isLoading = false;
      console.log(action.payload);
    });
  },
});

export const {
  closeMessage,
  changeDate,
  changePDF,
  changeTransactions,
  deleteTransaction,
  insertTransaction,
  expandTransactions,
  changeTransactionGroup,
  initializeTransactionGroup,
} = bookkeepingSlice.actions;

export const selectStatus = (state: RootState) => state.bookkeeping.status;

export const selectTransactionGroup = (state: RootState) =>
  state.bookkeeping.transactionGroup;

export const selectTransactions = (state: RootState) =>
  state.bookkeeping.transactionGroup.transactions;

export const selectDate = (state: RootState) =>
  state.bookkeeping.transactionGroup.date;

export const selectRate = (state: RootState) => state.bookkeeping.rate;

export const selectCurrency = (state: RootState) =>
  state.bookkeeping.transactionGroup.currency;

export const selectMemo = (state: RootState) =>
  state.bookkeeping.transactionGroup.memo;

export const selectSlipNum = (state: RootState) =>
  state.bookkeeping.transactionGroup.slipNum;

export const selectDepartment = (state: RootState) =>
  state.bookkeeping.transactionGroup.department;

// export const selectEditedTransactions = (state: RootState) =>
//   state.bookkeeping.editedTransactions;

// export const selectEditedDate = (state: RootState) =>
//   state.bookkeeping.editedTransactions.date;

export default bookkeepingSlice.reducer;

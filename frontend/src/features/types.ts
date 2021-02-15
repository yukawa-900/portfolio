/*Auth */

export type PROPS_AUTH_COMPONENT = {
  isSignup: boolean;
};

export type PROPS_AUTH_SIGNIN = {
  email: string;
  password: string;
};

export type PROPS_AUTH_SIGNUP = {
  email: string;
  password1: string;
  password2: string;
};

export type PROPS_INDEX = {
  index: number;
};

export type PROPS_BOOKKEEPING_FIELD = {
  index: number;
  role: "create" | "edit";
  initialValues: {
    [key: string]: string | number;
  };
};

export type ACCOUNT_OBJECT = {
  id: string;
  name: string;
  furigana: string;
  category: string;
  categoryName: string;
  categoryOrder: number;
  description: string | null;
  user: string | null;
};

export type ACCOUNT_CATEGORY_OBJECT = {
  id: string;
  name: string;
};

export type DEPARTMENT_OBJECT = {
  id: string;
  code: string;
  name: string;
  user: string;
};

export type CURRENCY_OBJECT = {
  code: string;
  name: string;
};

export type TAX_OBJECT = {
  id: number;
  code: string;
  name: string;
  rate: Number;
};

export type EXCHANGE_OBJECT = {
  [key: string]: number;
};

export type PROPS_FORM = {
  role: "create" | "edit";
};

type key_transac = "account" | "money" | "memo";
export type TRANSACTION_OBJECT = {
  id: string;
  debitCredit: number | string;
  accountName: string;
  account: string;
  money: number | string;
  foreignMoney: number | null;
  tax: string;
  order: number;
};

type key_transac_payload = "index" | "target" | "account";
export type TRANSACTION_PAYLOAD = {
  id: string;
  // target: string;
  [key: string]: string | number;
  // account: string;
};

export type TRANSAC_GROUP_KEY =
  | "date"
  | "slipNum"
  | "memo"
  | "pdf"
  | "department"
  | "currency";

export type TRANSACTION_GROUP_PAYLOAD = {
  [key: string]: string | number;
  // "currency": string;
  // "memo": string;
  // "department": string;
};

export type POST_TRANSACTON = {
  order: Number;
  debitCredit: Number;
  date: string;
  account: string;
  money: Number;
  memo: string;
};

// export type EDITED_TRANSACTION_OBJECT = {
//   [index: string]: {
//     [key: string]: string;
//     // key: account, money, memo, id
//   };
// };

// export type EDITED_TRANSACTION_PAYLOAD = {
//   index: string;
//   target: string;
//   [key: string]: string;
//   // account: string;
// };

export type PUT_TRANSACTON = {
  order: Number;
  debitCredit: Number;
  date: string;
  account: string;
  money: Number;
  memo: string;
};

export type GET_TRANSACTON = {
  id: string;
  order: Number;
  debitCredit: Number;
  date: string;
  account: string;
  accountName: string;
  money: Number;
  memo: string;
};

export type FILTER_PARAMS_PAYLOAD = {
  [key: string]: string | number;
};

export type ACTIVE_OBJECT = {
  [key: string]: string | number;
};

export type EXCLUSION_OBJECT = { item: string; isActive: boolean };

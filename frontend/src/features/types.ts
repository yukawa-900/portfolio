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

export type PROPS_BOOKKEEPING_FIELD = {
  index: Number;
  role: "create" | "edit";
  initialValues: {
    [key: string]: string;
  };
};

export type INFO_OBJECT = {
  id: string;
  name: string;
  furigana: string;
  categoryName: string;
  description: string | null;
};

export type PROPS_FORM = {
  role: "create" | "edit";
};

type key_transac = "account" | "money" | "memo";
export type TRANSACTION_OBJECT = {
  [index: string]: {
    [key: string]: string;
    // key: account, money,
  };
};

type key_transac_payload = "index" | "target" | "account";
export type TRANSACTION_PAYLOAD = {
  index: string;
  target: string;
  [key: string]: string;
  // account: string;
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

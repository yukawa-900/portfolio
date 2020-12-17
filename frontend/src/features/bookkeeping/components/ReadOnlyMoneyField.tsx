import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import { Rifm } from "rifm";
import { TRANSACTION_OBJECT } from "../../types";
import {
  selectTransactions,
  selectCurrency,
  changeTransactions,
} from "../bookkeepingSlice";
import { useSelector } from "react-redux";

const convertToYen = (money: number) => {
  if (money == null) {
    return "";
  }

  const res = money.toLocaleString("ja-JP", {
    style: "currency",
    currency: "JPY",
  });

  if (res != "￥NaN") {
    return res;
  } else {
    return "";
  }
};

const useStyles = makeStyles((theme) => ({
  textField: {
    "& .MuiInputBase-root.Mui-disabled": {
      color: theme.palette.text.primary, // (default alpha is 0.38)
    },
  },
}));

const ReadOnlyMoneyField: React.FC<any> = ({ money }) => {
  const classes = useStyles();
  const currency = useSelector(selectCurrency);

  // const money = useSelector(selectTransactions).filter(
  //   (transac: TRANSACTION_OBJECT) => transac.order == index
  // )[0].money;

  let yen = convertToYen(money);

  useEffect(() => {
    yen = "";
  }, []);

  return (
    <>
      <TextField
        style={{ width: 160 }}
        disabled
        className={classes.textField}
        name="money"
        autoComplete="off"
        label="日本円換算"
        variant="outlined"
        InputLabelProps={{
          shrink: yen ? true : false,
        }}
        value={yen}
        inputProps={{
          style: { textAlign: "right" },
        }}
      />
    </>
  );
};

export default ReadOnlyMoneyField;

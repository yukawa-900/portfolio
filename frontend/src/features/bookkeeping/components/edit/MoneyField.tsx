import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  numberAccept,
  parseNumber,
  formatFloatingPointNumber,
} from "../../../utils/moneyFormatter";
import { Rifm } from "rifm";
import { useSelector } from "react-redux";
import { selectCurrency, selectExchangeRates } from "../../bookkeepingSlice";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import classes from "*.module.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 160,
    [theme.breakpoints.down("xs")]: {
      width: 80,
    },
  },
}));

const MoneyField: React.FC<any> = ({
  values,
  setFieldValue,
  errors,
  isError,
  handleChange,
  handleBlur,
}) => {
  const classes = useStyles();
  const currency = useSelector(selectCurrency);
  const rate = useSelector(selectExchangeRates)[currency];
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));

  const formatCurrency = (string: string) => {
    return formatFloatingPointNumber(string, 2, currency);
  };

  const handleChangeMoney = () => {
    const localMoney = Number.parseFloat(parseNumber(values.money));
    console.log(rate);
    const jpy = localMoney / rate;

    handleChange({
      target: "money",
      value: jpy, // jpy ? jpy : null, // エラー防止
      // 通貨フォーマット(str) → numberに変換 → 為替レートから日本円に変換(number)
    });

    if (currency != "JPY") {
      handleChange({
        target: "foreignMoney",
        value: localMoney,
      });
    }
  };

  useEffect(() => {
    if (values.money) {
      handleChangeMoney();
    }
  }, [rate]);

  return (
    <>
      <Rifm
        accept={numberAccept}
        format={formatCurrency}
        value={values.money ? values.money : ""}
        onChange={(v) => {
          setFieldValue("money", v);
        }}
      >
        {({ value, onChange }) => (
          <TextField
            className={classes.root}
            // name="money"
            autoComplete="off"
            label="金額"
            variant="outlined"
            // InputLabelProps={{
            //   shrink: true,
            // }}
            size={isXSDown ? "small" : "medium"}
            inputProps={{
              style: { textAlign: "right" },
            }}
            InputLabelProps={{
              shrink: isXSDown ? true : undefined,
            }}
            onBlur={(event) => {
              // handleBlur(event);

              handleChangeMoney();

              setFieldValue("money", event.target.value);
            }}
            onChange={onChange}
            value={value}
            // error={isError("money")}
            // helperText={isError("money") ? errors.money : null}
          />
        )}
      </Rifm>
    </>
  );
};

export default MoneyField;

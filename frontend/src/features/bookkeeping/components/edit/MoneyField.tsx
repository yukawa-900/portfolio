import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import {
  numberAccept,
  parseNumber,
  formatFloatingPointNumber,
} from "../../../utils/moneyFormatter";
import { Rifm } from "rifm";
import { useSelector } from "react-redux";
import {
  selectCurrency,
  selectRate,
  selectTransactions,
  // selectExchangeRates,
} from "../../bookkeepingSlice";
import { parse } from "url";
import { number, string } from "yup";

const useStyles = makeStyles((theme) => ({}));

const MoneyField: React.FC<any> = ({
  values,
  setFieldValue,
  errors,
  isError,
  handleChange,
  handleBlur,
}) => {
  const currency = useSelector(selectCurrency);
  const rate = useSelector(selectRate);

  const formatCurrency = (string: string) => {
    return formatFloatingPointNumber(string, 2, currency);
  };

  const handleChangeMoney = () => {
    const localMoney = Number.parseFloat(parseNumber(values.money));

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
            style={{ width: 160 }}
            // name="money"
            autoComplete="off"
            label="金額"
            variant="outlined"
            // InputLabelProps={{
            //   shrink: true,
            // }}
            inputProps={{
              style: { textAlign: "right" },
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

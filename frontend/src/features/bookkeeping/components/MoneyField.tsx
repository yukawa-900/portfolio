import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import { Rifm } from "rifm";
import { useSelector } from "react-redux";
import {
  selectCurrency,
  selectRate,
  selectTransactions,
  // selectExchangeRates,
} from "../bookkeepingSlice";
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

  const numberAccept = /[\d.]+/g;

  const parseNumber = (string: string) => {
    return (string.match(numberAccept) || []).join("");
  };

  const formatFloatingPointNumber = (value: string, maxDigits: number) => {
    const parsed = parseNumber(value);

    const [head, tail] = parsed.split(".");
    const scaledTail = tail != null ? tail.slice(0, maxDigits) : "";

    const number = Number.parseFloat(`${head}.${scaledTail}`);

    if (Number.isNaN(number)) {
      return "";
    }

    const formatted = number.toLocaleString("ja-JP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDigits,
    });

    if (parsed.includes(".")) {
      const [formattedHead] = formatted.split(".");

      // skip zero at digits position for non fixed floats
      // as at digits 2 for non fixed floats numbers like 1.50 has no sense, just 1.5 allowed
      // but 1.0 has sense as otherwise you will not be able to enter 1.05 for example
      const formattedTail =
        scaledTail !== "" && scaledTail[maxDigits - 1] === "0"
          ? scaledTail.slice(0, -1)
          : scaledTail;

      return `${formattedHead}.${formattedTail}`;
    }
    return formatted;
  };

  const formatCurrency = (string: string) =>
    formatFloatingPointNumber(string, 2);

  const handleChangeMoney = () => {
    const localMoney = Number.parseFloat(parseNumber(values.money));

    const jpy = Math.floor(localMoney / rate); //小数点切り上げ

    handleChange({
      target: "money",
      value: jpy ? jpy : null, // エラー防止
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
            name="money"
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

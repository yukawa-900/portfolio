import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";
import { Rifm } from "rifm";
import {
  formatFloatingPointNumber,
  numberAccept,
  parseNumber,
} from "../../../utils/moneyFormatter";

const MoneyField = ({ values, yupKey, setFieldValue, size, label }: any) => {
  const formatCurrency = (string: string) => {
    return formatFloatingPointNumber(string, 2, "JPY");
  };
  return (
    <Rifm
      accept={numberAccept}
      format={formatCurrency}
      value={values[yupKey] ? values[yupKey] : ""}
      onChange={(v) => {
        setFieldValue(yupKey, v);
      }}
    >
      {({ value, onChange }) => (
        <Field
          component={TextField}
          fullWidth
          name={yupKey}
          // autoFocus
          autoComplete="off"
          size={size}
          label={label}
          variant="outlined"
          //   inputProps={{
          //     style: { textAlign: "right" },
          //   }}
          onBlur={(event: any) => {
            // handleBlur(event);
            setFieldValue(yupKey, parseNumber(event.target.value));
          }}
          onChange={onChange}
          value={value}
        />
      )}
    </Rifm>
  );
};

export default MoneyField;

MoneyField.defaultProps = {
  size: "medium",
  label: "金額",
};

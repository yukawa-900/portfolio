import React from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import { Rifm } from "rifm";
import {
  numberAccept,
  parseNumber,
  formatFloatingPointNumber,
} from "../../../../utils/moneyFormatter";

const MoneyField = ({ values, setFieldValue }: any) => {
  const formatCurrency = (string: string) => {
    return formatFloatingPointNumber(string, 2, "JPY");
  };
  return (
    <Rifm
      accept={numberAccept}
      format={formatCurrency}
      value={values.money ? values.money : ""}
      onChange={(v) => {
        setFieldValue("money", v);
      }}
    >
      {({ value, onChange }) => (
        <Field
          component={TextField}
          fullWidth
          name="money"
          autoComplete="off"
          label="金額"
          margin="normal"
          variant="outlined"
          //   inputProps={{
          //     style: { textAlign: "right" },
          //   }}
          onBlur={(event: any) => {
            // handleBlur(event);
            setFieldValue("money", parseNumber(event.target.value));
          }}
          onChange={onChange}
          value={value}
        />
      )}
    </Rifm>
  );
};

export default MoneyField;

import InputAdornment from "@material-ui/core/InputAdornment";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";

const SalesNumField = ({ values, yupKey, setFieldValue, size }: any) => {
  return (
    <Field
      component={TextField}
      fullWidth
      name={yupKey}
      size={size}
      // autoFocus
      autoComplete="off"
      label="個数（売上）"
      variant="outlined"
      InputProps={{
        endAdornment: <InputAdornment position="start">個</InputAdornment>,
      }}
      value={values[yupKey]}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(yupKey, String(e.target.value));
      }}
    />
  );
};

export default SalesNumField;

SalesNumField.defaultProps = {
  size: "medium",
};

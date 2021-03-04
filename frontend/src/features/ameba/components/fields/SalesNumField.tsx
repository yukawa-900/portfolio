import React from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import InputAdornment from "@material-ui/core/InputAdornment";

const SalesNumField = ({ values, yupKey, setFieldValue }: any) => {
  return (
    <Field
      component={TextField}
      fullWidth
      name={yupKey}
      autoComplete="off"
      label="個数（売上）"
      margin="normal"
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

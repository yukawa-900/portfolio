import React from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import InputAdornment from "@material-ui/core/InputAdornment";

const SalesNumField = ({ values, setFieldValue }: any) => {
  return (
    <Field
      component={TextField}
      fullWidth
      name="num"
      autoComplete="off"
      label="個数（売上）"
      margin="normal"
      variant="outlined"
      InputProps={{
        endAdornment: <InputAdornment position="start">個</InputAdornment>,
      }}
      value={values.num}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("num", String(e.target.value));
      }}
    />
  );
};

export default SalesNumField;

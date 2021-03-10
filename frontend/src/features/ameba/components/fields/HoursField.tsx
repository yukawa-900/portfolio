import InputAdornment from "@material-ui/core/InputAdornment";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";

const HoursField = ({ values, yupKey, setFieldValue, size }: any) => {
  return (
    <Field
      component={TextField}
      fullWidth
      name={yupKey}
      // autoFocus
      autoComplete="off"
      label="労働時間"
      variant="outlined"
      size={size}
      InputProps={{
        endAdornment: <InputAdornment position="end">時間</InputAdornment>,
      }}
      value={values[yupKey]}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(yupKey, String(e.target.value));
      }}
    />
  );
};

export default HoursField;

HoursField.defaultProps = {
  size: "medium",
};

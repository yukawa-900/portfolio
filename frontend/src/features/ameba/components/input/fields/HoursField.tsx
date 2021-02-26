import React from "react";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import InputAdornment from "@material-ui/core/InputAdornment";

const HoursField = ({ values, setFieldValue }: any) => {
  return (
    <Field
      component={TextField}
      fullWidth
      name="hours"
      autoComplete="off"
      label="労働時間"
      margin="normal"
      variant="outlined"
      InputProps={{
        endAdornment: <InputAdornment position="end">時間</InputAdornment>,
      }}
      value={values.hours}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("hours", String(e.target.value));
      }}
    />
  );
};

export default HoursField;

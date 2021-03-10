import MenuItem from "@material-ui/core/MenuItem";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";

const EmployeePositionField = ({
  values,
  yupKey,
  setFieldValue,
  size,
}: any) => {
  return (
    <Field
      component={TextField}
      select
      // autoFocus
      autoComplete="off"
      size={size}
      name={yupKey}
      label="区分"
      type="text"
      variant="outlined"
      fullWidth
      value={values[yupKey]}
      onChange={(e: any) => setFieldValue(yupKey, e.target.value)}
    >
      <MenuItem value={0}>正社員</MenuItem>
      <MenuItem value={1}>アルバイト</MenuItem>
    </Field>
  );
};

export default EmployeePositionField;

EmployeePositionField.defaultProps = {
  size: "medium",
};

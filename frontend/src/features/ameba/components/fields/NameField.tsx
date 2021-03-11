import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";

const NameField = ({ values, yupKey, setFieldValue, size, label }: any) => {
  return (
    <Field
      component={TextField}
      fullWidth
      size={size}
      name={yupKey}
      // autoFocus
      autoComplete="off"
      label={label}
      variant="outlined"
      type="text"
      value={values[yupKey]}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(yupKey, String(e.target.value));
      }}
    />
  );
};

export default NameField;

NameField.defaultProps = {
  size: "medium",
  label: "名前",
};

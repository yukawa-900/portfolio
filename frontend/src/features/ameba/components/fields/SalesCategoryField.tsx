import MenuItem from "@material-ui/core/MenuItem";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";
import { useSelector } from "react-redux";
import { selectSalesCategories } from "../../amebaSlice";

const CostItemField = ({ values, yupKey, setFieldValue, size }: any) => {
  const salesCategories = useSelector(selectSalesCategories);

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      size={size}
      name={yupKey}
      label="売上カテゴリー"
      type="text"
      variant="outlined"
      fullWidth
      value={values[yupKey]}
      onChange={(e: any) => setFieldValue(yupKey, e.target.value)}
    >
      {salesCategories?.map((option: any) => (
        <MenuItem key={option.node.id} value={option.node.id}>
          {option.node.name}
        </MenuItem>
      ))}
    </Field>
  );
};

export default CostItemField;

CostItemField.defaultProps = {
  size: "medium",
};

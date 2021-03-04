import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import { selectSalesCategories } from "../../amebaSlice";

const CostItemField = ({ values, yupKey, setFieldValue }: any) => {
  const salesCategories = useSelector(selectSalesCategories);

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name={yupKey}
      label="売上カテゴリー"
      type="text"
      margin="normal"
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

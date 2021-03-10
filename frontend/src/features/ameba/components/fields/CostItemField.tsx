import MenuItem from "@material-ui/core/MenuItem";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";
import { useSelector } from "react-redux";
import { selectCostItems } from "../../amebaSlice";

const CostItemField = ({ values, yupKey, setFieldValue, size }: any) => {
  const costItems = useSelector(selectCostItems);

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name={yupKey}
      size={size}
      label="費用項目"
      type="text"
      variant="outlined"
      fullWidth
      value={values[yupKey]}
      onChange={(e: any) => setFieldValue(yupKey, e.target.value)}
    >
      {costItems?.map((option: any) => (
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

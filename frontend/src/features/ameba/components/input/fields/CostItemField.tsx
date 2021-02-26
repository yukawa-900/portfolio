import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import {
  selectSelectedDate,
  selectSelectedDeptID,
  selectCostItems,
  selectDepartments,
  setState,
} from "../../../amebaSlice";

const CostItemField = ({ values, setFieldValue }: any) => {
  const costItems = useSelector(selectCostItems);

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name="item"
      label="費用項目"
      type="text"
      margin="normal"
      variant="outlined"
      fullWidth
      value={values.item}
      onChange={(e: any) => setFieldValue("item", e.target.value)}
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

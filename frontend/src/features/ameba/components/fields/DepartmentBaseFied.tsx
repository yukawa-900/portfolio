import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useLazyQuery } from "@apollo/client";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
// import TextField from "@material-ui/core/TextField";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import {
  selectSelectedDate,
  selectSelectedDeptID,
  selectCostItems,
  selectDepartments,
  setState,
} from "../../amebaSlice";
import {
  GET_ALL_SALES_UNITS,
  GET_ALL_EMPLOYEES,
} from "../../operations/queries";

const DepartmentBaseField = ({
  value,
  yupKey,
  handleChange,
  handleBlur,
}: any) => {
  const dispatch = useDispatch();
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const departments = useSelector(selectDepartments);

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name={yupKey}
      label="部門"
      type="text"
      margin="normal"
      variant="outlined"
      disabled={false} // disabledを明示的にfalseにしないと、送信後に勝手にdisabledになる（dashboardのFilterForm）理由は不明・・
      fullWidth
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
    >
      {departments?.map((option: any) => (
        <MenuItem key={option.node.id} value={option.node.id}>
          {option.node.name}
        </MenuItem>
      ))}
    </Field>
  );
};

export default DepartmentBaseField;

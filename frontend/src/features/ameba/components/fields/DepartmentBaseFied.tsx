import MenuItem from "@material-ui/core/MenuItem";
import { Field } from "formik";
// import TextField from "@material-ui/core/TextField";
import { TextField } from "formik-material-ui";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDepartments, selectSelectedDeptID } from "../../amebaSlice";

const DepartmentBaseField = ({
  value,
  yupKey,
  size,
  autoFocus,
  margin,
  handleChange,
  label,
}: any) => {
  const dispatch = useDispatch();
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const departments = useSelector(selectDepartments);

  return (
    <Field
      component={TextField}
      select
      autoFocus={autoFocus}
      size={size}
      autoComplete="off"
      name={yupKey}
      label={label}
      type="text"
      variant="outlined"
      disabled={false} // disabledを明示的にfalseにしないと、送信後に勝手にdisabledになる（dashboardのFilterForm）理由は不明・・
      fullWidth
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
      }}
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

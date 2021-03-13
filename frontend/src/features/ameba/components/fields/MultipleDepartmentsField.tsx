import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { Field } from "formik";
// import TextField from "@material-ui/core/TextField";
import { TextField } from "formik-material-ui";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDepartments, selectSelectedDeptID } from "../../amebaSlice";

const useStyles = makeStyles((theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const MultipleDepartmentsField = ({
  values,
  yupKey,
  setFieldValue,
  size,
  margin,
  label,
}: any) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const [deptId, setDeptId] = useState(selectedDepetID);
  const departments = useSelector(selectDepartments);

  const refSelectedDeptID = useRef(selectedDepetID);
  console.log(values[yupKey]);

  return (
    <Field
      component={TextField}
      select
      // autoFocus
      size={size}
      autoComplete="off"
      name={yupKey}
      label={label}
      type="text"
      variant="outlined"
      disabled={false} // disabledを明示的にfalseにしないと、送信後に勝手にdisabledになる（dashboardのFilterForm）理由は不明・・
      fullWidth
      value={values[yupKey]}
      SelectProps={{
        multiple: true,
        renderValue: (selected: any) => (
          <div className={classes.chips}>
            {selected.map((value: any) => {
              const selectedDept = departments.filter(
                (dept: any) => dept.node.id === value
              );

              return (
                <Chip
                  key={value}
                  label={selectedDept ? selectedDept[0].node.name : ""}
                  className={classes.chip}
                />
              );
            })}
          </div>
        ),
      }}
      multiple
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(yupKey, e.target.value);
      }}
    >
      {departments?.map((option: any) => {
        const id = option.node.id;
        const name = option.node.name;
        return (
          <MenuItem key={id} value={id}>
            <Checkbox checked={values[yupKey]?.indexOf(id) > -1} />
            <ListItemText primary={name} />
          </MenuItem>
        );
      })}
    </Field>
  );
};

export default MultipleDepartmentsField;

MultipleDepartmentsField.defaultProps = {
  label: "部門",
};

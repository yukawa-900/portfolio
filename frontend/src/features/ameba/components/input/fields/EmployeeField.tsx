import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { selectEmployees } from "../../../amebaSlice";

const useStyles = makeStyles((theme) => ({
  optionContainer: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  optionName: {
    fontSize: 18,
    color: theme.palette.primary.light,
  },
  optionFurigana: {
    fontSize: 6,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 1.6,
  },
  accountInput: {
    "& input": {
      textAlign: "center",
      // Autocomplete ✖️ TextFieldでは、inputPropsが上手く機能しないため、このような書き方になった
      //（inputではなく、divにスタイルが当たってしまう・・）
    },
  },
}));

const EmployeeField = ({ values, setFieldValue }: any) => {
  const classes = useStyles();
  const employees = useSelector(selectEmployees);
  const [selectedName, setSelectedName] = useState("");

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name="employee"
      label="従業員"
      type="text"
      margin="normal"
      variant="outlined"
      fullWidth
      value={values.employee}
      onChange={(e: any) => {
        setFieldValue("employee", e.target.value);
      }}
      SelectProps={{
        renderValue: (value: any) => selectedName,
      }}
    >
      {employees?.map((option: any) => (
        <MenuItem
          key={option.node.id}
          value={option.node.id}
          onClick={() => {
            setSelectedName(option.node.name);
          }}
        >
          <>
            <ListItem>
              <ListItemText
                primary={option.node.name}
                secondary={
                  option.node.position === "A_0" ? "正社員" : "アルバイト"
                }
              />
            </ListItem>
          </>
        </MenuItem>
      ))}
    </Field>
  );
};

export default EmployeeField;

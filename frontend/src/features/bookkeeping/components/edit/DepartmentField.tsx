import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector, useDispatch } from "react-redux";
import {
  changeTransactionGroup,
  selectDepartment,
  changeTransactions,
} from "../../bookkeepingSlice";
import { selectActiveDepartments } from "../../settingsSlice";
import { DEPARTMENT_OBJECT } from "../../../types";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    // minWidth: 40,
    [theme.breakpoints.down("xs")]: {
      width: 100,
    },
  },
}));

const DepartmentField = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const departments = useSelector(selectActiveDepartments);
  const department = useSelector(selectDepartment);
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));

  const handleChange = (event: any) => {
    dispatch(changeTransactionGroup({ department: event.target.value }));
  };
  return (
    // <Grid item>
    <FormControl
      className={classes.formControl}
      variant="outlined"
      size="small"
    >
      <InputLabel htmlFor="debit-credit">部門</InputLabel>
      <Select
        label="部門"
        id="debit-credit-select"
        value={department}
        onChange={handleChange}
      >
        <MenuItem value={""}>
          <em>None</em>
        </MenuItem>
        {departments.map((department: DEPARTMENT_OBJECT) => (
          <MenuItem value={department.id}>{department.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
    // </Grid>
  );
};

export default DepartmentField;

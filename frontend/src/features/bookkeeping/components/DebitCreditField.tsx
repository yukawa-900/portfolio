import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector, useDispatch } from "react-redux";
import { selectTransactions, changeTransactions } from "../bookkeepingSlice";
import { PROPS_INDEX } from "../../types";
import TextField from "@material-ui/core/TextField";
import { isError } from "lodash";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 100,
  },
}));

const DebitCreditField: React.FC<any> = ({
  handleChange,
  index,
  values,
  setFieldValue,
  errors,
}) => {
  const classes = useStyles();
  const transactions = useSelector(selectTransactions);

  return (
    <TextField
      style={{ width: 80 }}
      id="debitCredit"
      select
      label="借/貸"
      variant="outlined"
      value={values.debitCredit}
      onChange={(event) => {
        handleChange({ target: "debitCredit", value: event.target.value });
        setFieldValue("debitCredit", event.target.value);
      }}

      // error={isError("debitCredit")}
      // helperText={isError("debitCredit") ? errors["debitCredit"] : null}
    >
      <MenuItem value={""}>
        <em>None</em>
      </MenuItem>
      <MenuItem value={0}>借方</MenuItem>
      <MenuItem value={1}>貸方</MenuItem>
    </TextField>
  );
};

export default DebitCreditField;

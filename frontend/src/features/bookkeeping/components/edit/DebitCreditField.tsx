import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector, useDispatch } from "react-redux";
import { selectTransactions, changeTransactions } from "../../bookkeepingSlice";
import TextField from "@material-ui/core/TextField";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
    width: 80,
    [theme.breakpoints.down("xs")]: {
      width: 40,
    },
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
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <TextField
      className={classes.root}
      id="debitCredit"
      select
      label="借/貸"
      variant="outlined"
      value={values.debitCredit}
      size={isXSDown ? "small" : "medium"}
      onChange={(event) => {
        handleChange({ target: "debitCredit", value: event.target.value });
        setFieldValue("debitCredit", event.target.value);
      }}
      InputLabelProps={{
        shrink: isXSDown ? true : undefined,
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

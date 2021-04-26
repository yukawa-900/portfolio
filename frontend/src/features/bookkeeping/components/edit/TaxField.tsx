import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector } from "react-redux";
import { selectTaxes } from "../../activeListSlice";
import TextField from "@material-ui/core/TextField";
import { TAX_OBJECT } from "../../../types";
import { selectActiveTaxes } from "../../settingsSlice";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 150,
    [theme.breakpoints.down("xs")]: {
      width: 40,
      paddingRight: 4,
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
  },
}));

const DebitCreditField: React.FC<any> = ({
  handleChange,
  values,
  setFieldValue,
}) => {
  const classes = useStyles();
  const taxes = useSelector(selectActiveTaxes);
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    // <Grid item>
    <>
      <TextField
        className={classes.root}
        id="tax"
        select
        label="税率"
        variant="outlined"
        size={isXSDown ? "small" : "medium"}
        value={values.tax}
        onChange={(event) => {
          handleChange({ target: "tax", value: event.target.value });
          setFieldValue("tax", event.target.value);
        }}
        InputLabelProps={{
          shrink: isXSDown ? true : undefined,
        }}
      >
        <MenuItem value={""}>
          <em>None</em>
        </MenuItem>
        {taxes.map((tax: TAX_OBJECT) => (
          <MenuItem value={tax.id}>{tax.name}</MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default DebitCreditField;

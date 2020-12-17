import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector } from "react-redux";
import { selectTaxes } from "../activeListSlice";
import TextField from "@material-ui/core/TextField";
import { TAX_OBJECT } from "../../types";

const useStyles = makeStyles((theme) => ({
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
  const [tax, setTax] = React.useState("");
  const taxes = useSelector(selectTaxes);
  // const handleChange = (event: any) => {
  //   setTax(event.target.value);
  // };
  return (
    // <Grid item>
    <>
      {/* <FormControl className={classes.formControl} variant="outlined">
        <InputLabel htmlFor="tax">税率</InputLabel>
        <Select id="tax" label="税率" value={tax} onChange={handleChange}>
          <MenuItem value={""}>
            <em>None</em>
          </MenuItem>
          {taxes.map((tax) => (
            <MenuItem value={tax.id}>{tax.title}</MenuItem>
          ))}
        </Select>
      </FormControl> */}
      <TextField
        style={{ width: 150 }}
        id="tax"
        select
        label="税率"
        variant="outlined"
        value={values.tax}
        onChange={(event) => {
          handleChange({ target: "tax", value: event.target.value });
          setFieldValue("tax", event.target.value);
        }}
      >
        <MenuItem value={""}>
          <em>None</em>
        </MenuItem>
        {taxes.map((tax: TAX_OBJECT) => (
          <MenuItem value={tax.id}>{tax.title}</MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default DebitCreditField;

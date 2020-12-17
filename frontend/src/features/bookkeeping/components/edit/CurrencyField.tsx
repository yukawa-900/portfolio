import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector, useDispatch } from "react-redux";
import {
  changeTransactions,
  changeTransactionGroup,
  selectCurrency,
  selectDate,
  fetchExchangeRates,
} from "../../bookkeepingSlice";
import { CURRENCY_OBJECT } from "../../../types";

import { selectCurrencies } from "../../activeListSlice";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 160,
  },
}));

const CurrencyField = () => {
  const classes = useStyles();
  const currencies = useSelector(selectCurrencies);
  const currency = useSelector(selectCurrency);
  const date = useSelector(selectDate);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExchangeRates(date));
  }, [currency]);

  const handleChange = (event: any) => {
    dispatch(changeTransactionGroup({ currency: event.target.value }));
  };

  return (
    // <Grid item>
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel htmlFor="debit-credit">通貨</InputLabel>
      <Select
        label="通貨"
        id="debit-credit-select"
        value={currency}
        onChange={handleChange}
      >
        <MenuItem value={"JPY"}>日本円</MenuItem>
        {currencies.map((currency: CURRENCY_OBJECT) => (
          <MenuItem value={currency.code}>{currency.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
    // </Grid>
  );
};

export default CurrencyField;

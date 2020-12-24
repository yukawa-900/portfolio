import React from "react";
import ActiveSettings from "../../components/settings/ActiveSettings";
import { useSelector, useDispatch } from "react-redux";
import {
  selectActiveCurrencies,
  selectInactiveCurrencies,
} from "../../settingsSlice";
import { CURRENCY_OBJECT } from "../../../types";

const filterCurrencies = (currencies: Array<CURRENCY_OBJECT>) => {
  return currencies.filter((currency) => currency.code != "JPY");
};

const CurrencySettings = () => {
  const active = useSelector(selectActiveCurrencies);
  const inactive = useSelector(selectInactiveCurrencies);
  return (
    <div>
      <ActiveSettings
        items="currencies"
        active={filterCurrencies(active)}
        inactive={filterCurrencies(inactive)}
      />
    </div>
  );
};

export default CurrencySettings;

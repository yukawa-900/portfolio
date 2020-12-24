import React from "react";
import ActiveSettings from "../../components/settings/ActiveSettings";
import CustomTabs from "../../components/utils/CustomTabs";
import { useSelector, useDispatch } from "react-redux";
import {
  selectActiveAccounts,
  selectInactiveAccounts,
} from "../../settingsSlice";
import { labels } from "./tabLabels";
import SettingsTable from "../../components/settings/SettingsTable";
import { headCells, rowCells } from "../../components/settings/AccountCells";

const CurrencySettings = () => {
  const active = useSelector(selectActiveAccounts);
  const inactive = useSelector(selectInactiveAccounts);
  return (
    <div>
      <CustomTabs name="currency-settings" labels={labels}>
        <SettingsTable
          rows={active.concat(inactive)}
          headCells={headCells}
          rowCells={rowCells}
          role="accounts"
          inactive={inactive}
        />
        <ActiveSettings items="accounts" active={active} inactive={inactive} />
      </CustomTabs>
    </div>
  );
};

export default CurrencySettings;

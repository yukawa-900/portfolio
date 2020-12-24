import React from "react";
import ActiveSettings from "../../components/settings/ActiveSettings";
import { useSelector, useDispatch } from "react-redux";
import {
  selectActiveDepartments,
  selectInactiveDepartments,
} from "../../settingsSlice";
import CustomTabs from "../../components/utils/CustomTabs";
import { labels } from "./tabLabels";
import SettingsTable from "../../components/settings/SettingsTable";
import { headCells, rowCells } from "../../components/settings/DepartmentCells";

const CurrencySettings = () => {
  const active = useSelector(selectActiveDepartments);
  const inactive = useSelector(selectInactiveDepartments);
  return (
    <div>
      <CustomTabs name="currency-settings" labels={labels}>
        <SettingsTable
          rows={active.concat(inactive)}
          headCells={headCells}
          rowCells={rowCells}
          role="departments"
          inactive={inactive}
        />
        <ActiveSettings
          items="departments"
          active={active}
          inactive={inactive}
        />
      </CustomTabs>
    </div>
  );
};

export default CurrencySettings;

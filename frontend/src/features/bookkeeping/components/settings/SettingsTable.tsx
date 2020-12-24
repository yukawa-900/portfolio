import React from "react";
import Table from "../read/BaseTable";
import SettingsRow from "./SettingsTableRow";
import SettingsTableHead from "./SettingsTableHead";
import SettingsTableToolbar from "./SettingsTableToolbar";

const SettingsTable = ({ inactive, rows, headCells, rowCells, role }: any) => {
  return (
    <Table
      TableHead={SettingsTableHead}
      Row={SettingsRow}
      rows={rows}
      inactive={inactive}
      headCells={headCells}
      rowCells={rowCells}
      role={role}
      Toolbar={SettingsTableToolbar}
    />
  );
};

export default SettingsTable;

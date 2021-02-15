import React from "react";
import Button from "@material-ui/core/Button";
import Table from "../read/BaseTable";
import SettingsRow from "./SettingsTableRow";
import SettingsTableHead from "./SettingsTableHead";
import SettingsTableToolbar from "./SettingsTableToolbar";
import AccountDialog from "./AccountDialog";
import DepartmentDialog from "./DepartmentDialog";
import { useSelector, useDispatch } from "react-redux";
import {
  retrieveItem,
  selectIsDialogOpen,
  selectIsEdit,
  selectAccount,
  selectAccountCategories,
  updateSettingsItem,
  changeIsEdit,
  initializeForm,
  handleDialogOpen,
} from "../../settingsSlice";

const SettingsTable = ({ inactive, rows, headCells, rowCells, role }: any) => {
  const dispatch = useDispatch();
  const isDialogOpen = useSelector(selectIsDialogOpen);

  return (
    <>
      <Table
        TableHead={SettingsTableHead}
        Row={SettingsRow}
        rows={rows}
        inactive={inactive}
        headCells={headCells}
        rowCells={rowCells}
        role={role}
        Toolbar={SettingsTableToolbar}
        // dialogOpen={dialogOpen}
        // handleDialogOpen={handleDialogOpen}
        // handleDialogClose={handleDialogClose}
      />

      <Button
        variant="contained"
        color="primary"
        disableElevation
        style={{ display: "block", margin: "30px auto" }}
        onClick={async (e) => {
          // await dispatch(retrieveItem({ id: row.id, role: role }));
          await dispatch(changeIsEdit(false));
          await dispatch(initializeForm({ target: role.slice(0, -1) }));
          await dispatch(handleDialogOpen(true));
        }}
      >
        新しく追加する
      </Button>
      {role == "accounts" ? <AccountDialog /> : <DepartmentDialog />}
    </>
  );
};

export default SettingsTable;

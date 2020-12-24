import React from "react";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Popover from "@material-ui/core/Popover";
import Collapse from "@material-ui/core/Collapse";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import LinkIcon from "@material-ui/icons/Link";
import EditIcon from "@material-ui/icons/Edit";
import NoteIcon from "@material-ui/icons/Note";
import { useSelector, useDispatch } from "react-redux";
import {
  selectFilteredTransactionGroup,
  filterTransactionGroup,
} from "../../filteringSlice";
import { selectInactiveDepartments } from "../../settingsSlice";
import { retrieveTransactionGroup } from "../../bookkeepingSlice";
import formatDate from "../utils/formatDate";
import ReadOnlyMemo from "../read/ReadOnlyMemo";
import FormDialog from "../edit/FormDialog";
import { TurnedInTwoTone } from "@material-ui/icons";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const MAX_LENGTH = 12;

const SettingsRow = (props: any) => {
  const { row, rowCells, handleClick, isItemSelected, role } = props;
  const classes = useRowStyles();
  const dispatch = useDispatch();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDialogOpen = (e: any) => {
    e.stopPropagation(); // Clickの親要素への伝播を防ぐ
    // dispatch(retrieveTransactionGroup(row.id));
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const isInactive: boolean = props?.inactive.includes(row);

  return (
    <>
      <TableRow
        className={classes.root}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.name}
        selected={isItemSelected}
        hover={!isInactive}
        onClick={(event) => {
          isInactive ? console.log("hello") : handleClick(event, row.id);
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isInactive || isItemSelected}
            disabled={isInactive}
            inputProps={{ "aria-labelledby": row.name }}
          />
        </TableCell>
        <TableCell align="center">{isInactive ? "無効" : "有効"}</TableCell>
        {rowCells.map((rowCell: any) => {
          const content = row[rowCell.key];
          return (
            <TableCell align={rowCell.align}>
              {content?.length > MAX_LENGTH
                ? content.substr(0, MAX_LENGTH) + "…"
                : content}
            </TableCell>
          );
        })}
        <TableCell align="center">
          <IconButton size="small" onClick={handleDialogOpen}>
            <EditIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  );
};

export default SettingsRow;

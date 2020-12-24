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
import { retrieveTransactionGroup } from "../../bookkeepingSlice";
import formatDate from "../utils/formatDate";
import ReadOnlyMemo from "./ReadOnlyMemo";
import FormDialog from "../edit/FormDialog";
import { TurnedInTwoTone } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

const localStorageKey = "rowsPerPage";

function descendingComparator(a: any, b: any, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order: string, orderBy: string) {
  return order === "desc"
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

function stableSort(array: Array<any>, comparator: any) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function TablePaginationActions(props: any) {
  const classes = useStyles();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (event: any) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event: any) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event: any) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event: any) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

export default function CollapsibleTable(props: any) {
  const dispatch = useDispatch();
  const { TableHead, rows, Row, headCells, rowCells } = props;
  const classes = useStyles();

  const [page, setPage] = React.useState(0);
  const localRowsPerPage = localStorage.getItem(localStorageKey);
  const initialRowsPerPage = localRowsPerPage
    ? parseInt(localRowsPerPage, 10)
    : 5;
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [selected, setSelected] = React.useState<Array<any>>([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("date");

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    localStorage.setItem(localStorageKey, event.target.value);
  };

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n: any) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: any, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: any = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: any) => selected.indexOf(id) !== -1;

  return (
    <Paper style={{ width: "100%" }}>
      {props.Toolbar ? (
        <props.Toolbar
          numSelected={selected.length}
          role={props?.role}
          inactive={props?.inactive}
          selected={selected}
          setSelected={setSelected}
        />
      ) : null}
      <TableContainer>
        <Table aria-label="collapsible table">
          <TableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            headCells={headCells}
            numSelected={selected.length}
            onSelectAllClick={handleSelectAllClick}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: any) => {
                return (
                  <Row
                    key={row.id}
                    row={row}
                    role={props?.role}
                    inactive={props?.inactive}
                    rowCells={rowCells}
                    handleClick={handleClick}
                    isItemSelected={isSelected(row.id)}
                  />
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={rows.length} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[
                  { label: "5件", value: 5 },
                  { label: "10件", value: 10 },
                  { label: "20件", value: 20 },
                  { label: "50件", value: 50 },
                ]}
                colSpan={8}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage="１ページあたり :"
                SelectProps={{
                  inputProps: { label: "1ページあたり" },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
}

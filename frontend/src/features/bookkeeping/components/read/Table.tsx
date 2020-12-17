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
import formatDate from "../utils/formatDate";
import ReadOnlyMemo from "./ReadOnlyMemo";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const useStyles1 = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

function Row(props: any) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.date}
        </TableCell>
        <TableCell align="right">{row.slipNum}</TableCell>
        <TableCell align="right">
          {row.department ? row.department : "なし"}
        </TableCell>
        <TableCell align="right">
          {row.currencyTitle ? row.currencyTitle : "日本円"}
        </TableCell>
        <TableCell align="right">
          {row.pdf ? (
            <IconButton size="small" href={row.pdf} target="_blank">
              <LinkIcon />
            </IconButton>
          ) : (
            "なし"
          )}
        </TableCell>
        <TableCell align="right">
          {row.memo ? <ReadOnlyMemo memo={row.memo} /> : "なし"}
        </TableCell>
        <TableCell align="right">
          {row.createdOn === formatDate(new Date()) ? (
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          ) : null}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>借/貸</TableCell>
                    <TableCell align="right">勘定科目</TableCell>
                    <TableCell align="right">金額 (円)</TableCell>
                    <TableCell align="right">金額 (海外通貨)</TableCell>
                    <TableCell align="right">税率</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.transactions.map((transac: any, index: number) => (
                    <TableRow key={index} className={classes.root}>
                      <TableCell component="th" scope="row">
                        {transac.debitCredit == 0 ? "借方" : "貸方"}
                      </TableCell>
                      <TableCell align="right">{transac.accountName}</TableCell>
                      <TableCell align="right">
                        {parseInt(transac.money, 10)}
                      </TableCell>
                      <TableCell align="right">
                        {transac.foreignMoney}
                      </TableCell>
                      <TableCell align="right">{transac.tax}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function TablePaginationActions(props: any) {
  const classes = useStyles1();
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

export default function CollapsibleTable() {
  const dispatch = useDispatch();
  const rows = useSelector(selectFilteredTransactionGroup);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>転記日付</TableCell>
            <TableCell align="right">伝票番号</TableCell>
            <TableCell align="right">部門</TableCell>
            <TableCell align="right">通貨</TableCell>
            <TableCell align="right">PDF</TableCell>
            <TableCell align="right">摘要</TableCell>
            <TableCell align="right">編集</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row: any) => (
            <Row key={row.id} row={row} />
          ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
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
  );
}

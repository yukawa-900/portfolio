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

const TransacRow = (props: any) => {
  const { row } = props;
  const [transacOpen, setTransacOpen] = React.useState(false);
  const classes = useRowStyles();
  const dispatch = useDispatch();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDialogOpen = () => {
    dispatch(retrieveTransactionGroup(row.id));
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setTransacOpen(!transacOpen)}
          >
            {transacOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.date}
        </TableCell>
        <TableCell align="center">{row.slipNum}</TableCell>
        <TableCell align="center">
          {row.department ? row.department : "なし"}
        </TableCell>
        <TableCell align="center">
          {row.currencyName ? row.currencyName : "日本円"}
        </TableCell>
        <TableCell align="center">
          {row.pdf ? (
            <IconButton size="small" href={row.pdf} target="_blank">
              <LinkIcon />
            </IconButton>
          ) : (
            "なし"
          )}
        </TableCell>
        <TableCell align="center">
          {row.memo ? <ReadOnlyMemo memo={row.memo} /> : "なし"}
        </TableCell>
        <TableCell align="center">
          {row.createdOn === formatDate(new Date()) ? (
            <>
              <IconButton size="small" onClick={handleDialogOpen}>
                <EditIcon />
              </IconButton>
              <FormDialog
                open={dialogOpen}
                handleDialogClose={handleDialogClose}
              />
            </>
          ) : null}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={transacOpen} timeout="auto" unmountOnExit>
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
                        {parseInt(transac.money, 10).toLocaleString("ja-JP", {
                          style: "currency",
                          currency: "JPY",
                        })}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(transac.foreignMoney).toLocaleString(
                          "ja-JP",
                          {
                            style: "currency",
                            currency: row.currencyCode,
                          }
                        )}
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
};

export default TransacRow;

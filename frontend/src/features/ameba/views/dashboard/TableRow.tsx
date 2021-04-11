import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useSelector } from "react-redux";
import { selectIsMonth } from "../../amebaSlice";
import { headCells } from "./TableHeadCells";

const useRowStyles = makeStyles({
  root: {
    "& > *:nth-child(n+2)": {
      minWidth: 120,
    },
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const formatJPY = (d: number) => {
  return formatFloatingPointNumber(String(d), 0, "JPY");
};

const formatRatio = (d: number) => {
  if (d === Infinity || isNaN(d)) {
    return null;
  } else {
    return d + " %";
  }
};

const formatHours = (d: number) => {
  if (d !== null) {
    return d + " 時間";
  } else {
    return "";
  }
};

const formatPosition = (d: any) => {
  if (Number(d) === 0) {
    return "正社員";
  } else if (Number(d) === 1) {
    return "アルバイト";
  } else {
    return d;
  }
};

const TableCells = ({ row, group }: any) => {
  const name = group === "労働時間" ? formatPosition(row.name) : row.name;
  const formatData = group === "労働時間" ? formatHours : formatJPY;
  const isMonth = useSelector(selectIsMonth);
  return (
    <>
      <TableCell align="left">{name}</TableCell>
      <TableCell align="right">
        {formatData(isMonth ? row.theMonth : row.theDay)}
      </TableCell>
      <TableCell align="right">
        {formatData(isMonth ? row.theMonthBefore : row.theDayBefore)}
      </TableCell>
      <TableCell align="right">
        {formatData(isMonth ? row.twoMonthsBefore : row.oneWeekBefore)}
      </TableCell>
      <TableCell align="right">
        {formatRatio(
          Math.floor(
            (isMonth
              ? row.theMonth / row.theMonthBefore
              : row.theDay / row.theDayBefore) * 100
          )
        )}
      </TableCell>
      <TableCell align="right">
        {formatRatio(
          Math.floor(
            (isMonth
              ? row.theMonth / row.twoMonthsBefore
              : row.theDay / row.oneWeekBefore) * 100
          )
        )}
      </TableCell>
    </>
  );
};

const TransacRow = (props: any) => {
  const { row } = props;
  const theme = useTheme();
  const isSMDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [detailOpen, setDetailOpen] = React.useState(true);
  const classes = useRowStyles();
  const isMonth = useSelector(selectIsMonth);

  React.useEffect(() => {
    if (isSMDown) {
      setDetailOpen(false);
    } else {
      setDetailOpen(true);
    }
  }, [isSMDown]);

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell style={{ maxWidth: 60 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setDetailOpen(!detailOpen)}
          >
            {detailOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCells row={row} group={row.name} />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={detailOpen} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    {headCells(isMonth).map((cell) => (
                      <TableCell align={cell.align}>{cell.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.detail.map((detail: any, index: number) => (
                    <TableRow key={index} className={classes.root}>
                      <TableCells row={detail} group={row.name} />
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

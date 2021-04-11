import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import { useSelector, useDispatch } from "react-redux";
import {
  selectInactiveDepartments,
  retrieveItem,
  changeIsEdit,
  handleDialogOpen,
} from "../../settingsSlice";

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

const MAX_LENGTH = 12;

const SettingsRow = (props: {
  row: any;
  rowCells: any;
  handleClick: any;
  isItemSelected: any;
  role: any;
  inactive: any;
  // dialogOpen: boolean;
  // handleDialogClose: () => void;
  // handleDialogOpen: (e: any) => void;
  // setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    row,
    rowCells,
    handleClick,
    isItemSelected,
    role,
    // dialogOpen,
    // handleDialogClose,
    // handleDialogOpen,
  } = props;
  const classes = useRowStyles();
  const dispatch = useDispatch();

  // const [dialogOpen, setDialogOpen] = React.useState(false);

  // const handleDialogOpen = (e: any) => {
  //   // dispatch(retrieveTransactionGroup(row.id));
  //   setDialogOpen(true);
  // };

  // const handleDialogClose = () => {
  //   setDialogOpen(false);
  // };

  const isInactive: boolean = props?.inactive.includes(row);

  const isDefault = !row.user;

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
        <TableCell
          align="center"
          onClick={async (e) => {
            e.stopPropagation(); // Clickの親要素への伝播を防ぐ
            await dispatch(retrieveItem({ id: row.id, role: role }));
            await dispatch(changeIsEdit(true));
            await dispatch(handleDialogOpen(true));
          }}
        >
          {isDefault ? (
            "不可"
          ) : (
            <>
              <IconButton size="small">
                <EditIcon />
              </IconButton>
            </>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};

export default SettingsRow;

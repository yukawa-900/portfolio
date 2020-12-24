import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import { useDispatch } from "react-redux";
import {
  updateExclusion,
  activate,
  inactivate,
  inactivateByIds,
} from "../../settingsSlice";
import { EXCLUSION_OBJECT } from "../../../types";

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const SettingsTableToolbar = (props: any) => {
  const classes = useToolbarStyles();
  const dispatch = useDispatch();
  const { numSelected, role, selected, setSelected, inactive } = props;
  const handleClick = () => {
    let data: Array<EXCLUSION_OBJECT> = [];
    for (const item of selected) {
      data.push({ item: item, isActive: false });
    }
    dispatch(updateExclusion({ items: role, sentData: data }));
    dispatch(inactivateByIds({ target: role, ids: selected }));
    setSelected([]);
  };

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="table-title"
          component="div"
        >
          {role.slice(0, 1).toUpperCase() + role.slice(1)}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="チェックした項目を無効化します">
          <Button
            aria-label="inactivate"
            variant="contained"
            style={{ width: 100 }}
            onClick={handleClick}
          >
            無効化
          </Button>
        </Tooltip>
      ) : null}
    </Toolbar>
  );
};

export default SettingsTableToolbar;

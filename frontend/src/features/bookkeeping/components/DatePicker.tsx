import React, { useState, useEffect } from "react";
import {
  DatePicker,
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import IconButton from "@material-ui/core/IconButton";
import { changeDate } from "../bookkeepingSlice";
import { useDispatch } from "react-redux";
import { PROPS_FORM } from "../../types";
const useStyles = makeStyles({
  container: {
    // position: "relative",
  },
  datePicker: {
    marginTop: -60,
    marginRight: 20,
    visibility: "hidden",
    // position: "absolute",
    // top: 1000,
    // left: 1000,
  },
  typography: {
    // marginLeft: 140,
  },
  iconButton: {},
});

const CustomDatePicker: React.FC<PROPS_FORM> = ({ role }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const today = new Date();
  const formatDate = (date: any) => {
    return (
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    );
  };
  const initialDate = formatDate(today);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setDateChange] = useState(initialDate);

  useEffect(() => {
    dispatch(changeDate({ role: role, date: initialDate }));
  }, []);

  const handleDateChange = (date: any) => {
    setDateChange(formatDate(date));
    dispatch(changeDate({ role: role, date: formatDate(date) }));
  };

  return (
    <Grid container alignItems="center" direction="column">
      <Grid
        container
        item
        direction="row"
        alignItems="center"
        justify="center"
        className={classes.container}
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.typography}
        >
          {selectedDate}
          <Tooltip title="日付を変更する" placement="right">
            <IconButton
              onClick={() => setIsOpen(true)}
              className={classes.iconButton}
            >
              <CalendarTodayIcon />
            </IconButton>
          </Tooltip>
        </Typography>
      </Grid>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DatePicker
          className={classes.datePicker}
          variant="inline"
          open={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          label="Open me from button"
          format="yyyy-MM-dd"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </MuiPickersUtilsProvider>
    </Grid>
  );
};

export default CustomDatePicker;

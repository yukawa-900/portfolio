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
import { changeDate, getSlipNum } from "../../bookkeepingSlice";
import { useDispatch, useSelector } from "react-redux";
import { PROPS_FORM } from "../../../types";
import { selectDate } from "../../bookkeepingSlice";
import formatDate from "../../../utils/dateFormatter";

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
    "&.MuiPickersToolbar-toolbar": {
      backgroudColor: "fff",
    },
  },
  typography: {
    // marginLeft: 140,
  },
  iconButton: {},
});

const CustomDatePicker: React.FC = () => {
  const classes = useStyles();
  const date = useSelector(selectDate);
  const dispatch = useDispatch();
  const today = new Date();
  const initialDate = formatDate(today);
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedDate, setDateChange] = useState(initialDate);

  useEffect(() => {
    dispatch(changeDate({ date: initialDate }));
    dispatch(getSlipNum(initialDate));
  }, []);

  const handleDateChange = (date: any) => {
    // setDateChange(formatDate(date));
    dispatch(changeDate({ date: formatDate(date) }));
    dispatch(getSlipNum(formatDate(date)));
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
          {date}
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
          orientation="landscape"
          open={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          label="Open me from button"
          format="yyyy-MM-dd"
          value={date}
          onChange={handleDateChange}
        />
      </MuiPickersUtilsProvider>
    </Grid>
  );
};

export default CustomDatePicker;

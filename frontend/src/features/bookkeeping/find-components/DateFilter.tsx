import "date-fns";
import React from "react";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  dateField: {
    width: 180,
  },
}));

const DateFilter: React.FC<{ isRange: boolean; isDate: boolean }> = ({
  isRange,
  isDate,
}) => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  return (
    <>
      {isDate ? (
        <Grid
          container
          item
          xs
          justify="center"
          alignItems="center"
          spacing={3}
        >
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid item>
              <KeyboardDatePicker
                className={classes.dateField}
                disableToolbar
                variant="inline"
                format="yyyy-MM-dd"
                margin="normal"
                value={selectedDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </Grid>
            {isRange ? (
              <>
                <Grid item style={{ fontSize: "2.0rem", marginTop: "0.4rem" }}>
                  〜
                </Grid>
                <Grid item>
                  <KeyboardDatePicker
                    disableToolbar
                    className={classes.dateField}
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </Grid>
              </>
            ) : null}
          </MuiPickersUtilsProvider>
        </Grid>
      ) : null}
    </>
  );
};

export default DateFilter;

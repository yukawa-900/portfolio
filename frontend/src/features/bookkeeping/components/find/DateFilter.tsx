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
import { useDispatch, useSelector } from "react-redux";
import {
  changeFilteringParams,
  selectFilteringParams,
} from "../../filteringSlice";
import formatDate from "../utils/formatDate";

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
  const dispatch = useDispatch();
  const params = useSelector(selectFilteringParams);
  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  const performChange = (
    target: "dateBefore" | "dateAfter",
    date: Date | null
  ) => {
    if (date) {
      dispatch(changeFilteringParams({ [target]: formatDate(date) }));
    }
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
                value={params.dateAfter}
                onChange={(date) => {
                  performChange("dateAfter", date);
                }}
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
                    value={params.dateBefore}
                    onChange={(date) => {
                      performChange("dateBefore", date);
                    }}
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

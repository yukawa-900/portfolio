import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import formatDate from "../../../../utils/dateFormatter";
import {
  selectSelectedDate,
  selectSelectedDeptID,
  selectCostItems,
  selectDepartments,
  setState,
} from "../../../amebaSlice";

const DateField = ({ values, errors, setFieldValue }: any) => {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectSelectedDate);
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        disableToolbar
        autoComplete="off"
        variant="inline"
        inputVariant="outlined"
        format="yyyy-MM-dd"
        margin="normal"
        fullWidth
        id="date"
        // minDate={new Date("2018-03-01")}
        // maxDate={new Date("2025-06-01")}
        label="日付"
        value={values.date}
        onChange={(date: any) => {
          dispatch(
            setState({ target: "selectedDate", data: formatDate(date) })
          );
          setFieldValue("date", formatDate(date));
        }}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        error={Boolean(errors["date"])}
        helperText={errors["date"]}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateField;

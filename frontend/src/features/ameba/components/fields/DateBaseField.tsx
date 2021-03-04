import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import formatDate from "../../../utils/dateFormatter";
import {
  selectSelectedDate,
  selectSelectedDeptID,
  selectCostItems,
  selectDepartments,
  setState,
} from "../../amebaSlice";

const DateBaseField = ({ value, yupKey, errorMessage, handleChange }: any) => {
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
        id={yupKey}
        // minDate={new Date("2018-03-01")}
        // maxDate={new Date("2025-06-01")}
        label="日付"
        value={value}
        onChange={handleChange}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        error={Boolean(errorMessage)}
        helperText={errorMessage}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateBaseField;

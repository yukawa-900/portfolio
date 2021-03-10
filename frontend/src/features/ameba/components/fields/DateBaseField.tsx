import DateFnsUtils from "@date-io/date-fns";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React from "react";

const DateBaseField = ({
  value,
  yupKey,
  errorMessage,
  handleChange,
  size,
}: any) => {
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        disableToolbar
        autoComplete="off"
        variant="inline"
        size={size}
        inputVariant="outlined"
        format={isXSDown ? "MM-dd" : "yyyy-MM-dd"}
        fullWidth
        id={yupKey}
        // minDate={new Date("2018-03-01")}
        // maxDate={new Date("2025-06-01")}
        label="日付"
        value={value}
        onChange={handleChange}
        // KeyboardButtonProps={{
        //   "aria-label": "change date",
        // }}
        error={Boolean(errorMessage)}
        helperText={errorMessage}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateBaseField;

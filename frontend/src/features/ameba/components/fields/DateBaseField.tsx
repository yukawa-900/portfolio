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
  isMonth,
}: any) => {
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        disableToolbar
        autoComplete="off"
        autoOk={true} // クリック時に閉じる
        variant="inline"
        size={size}
        views={isMonth ? ["year", "month"] : ["year", "month", "date"]}
        openTo={isMonth ? "year" : "date"}
        inputVariant="outlined"
        format={isMonth ? "yyyy年 MM月" : isXSDown ? "MM-dd" : "yyyy-MM-dd"}
        fullWidth
        id={yupKey}
        minDate={new Date("2018-01-01")}
        maxDate={new Date("2024-12-31")}
        label={isMonth ? "月" : "日付"}
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

DateBaseField.defaultProps = {
  isMonth: false,
};

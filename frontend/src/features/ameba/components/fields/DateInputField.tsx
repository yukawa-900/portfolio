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
import DateBaseField from "./DateBaseField";

const DateField = ({ values, yupKey, errors, setFieldValue }: any) => {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectSelectedDate);
  const handleChange = (date: any) => {
    dispatch(setState({ target: "selectedDate", data: formatDate(date) }));
    setFieldValue(yupKey, formatDate(date));
  };
  const errorMessage = errors[yupKey];
  const value = values[yupKey];

  return (
    <DateBaseField
      value={value}
      yupKey={yupKey}
      errorMessage={errorMessage}
      handleChange={handleChange}
    />
  );
};

export default DateField;

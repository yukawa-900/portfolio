import React from "react";
import { useDispatch, useSelector } from "react-redux";
import formatDate from "../../../utils/dateFormatter";
import { selectSelectedDate, setState } from "../../amebaSlice";
import DateBaseField from "./DateBaseField";

const DateField = ({ values, yupKey, errors, setFieldValue, size }: any) => {
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
      size={size}
      errorMessage={errorMessage}
      handleChange={handleChange}
    />
  );
};

export default DateField;

DateField.defaultProps = {
  size: "medium",
};

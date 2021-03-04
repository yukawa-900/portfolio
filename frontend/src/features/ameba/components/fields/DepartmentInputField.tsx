import React, { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
// import TextField from "@material-ui/core/TextField";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import {
  selectSelectedDate,
  selectSelectedDeptID,
  selectCostItems,
  selectDepartments,
  setState,
} from "../../amebaSlice";
import {
  GET_ALL_SALES_UNITS,
  GET_ALL_EMPLOYEES,
} from "../../operations/queries";
import DepartmentBaseField from "./DepartmentBaseFied";

const DepartmentField = ({ values, yupKey, setFieldValue }: any) => {
  const dispatch = useDispatch();
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const departments = useSelector(selectDepartments);

  const value = values[yupKey];

  const [
    getAllSalesUnits,
    { data: dataSalesUnits, error: errorSalesUnits },
  ] = useLazyQuery(GET_ALL_SALES_UNITS, {
    fetchPolicy: "cache-and-network",
  });
  const [
    getAllEmployees,
    { data: dataEmployees, error: errorEmployees },
  ] = useLazyQuery(GET_ALL_EMPLOYEES, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (dataSalesUnits) {
      dispatch(
        setState({
          target: "salesUnits",
          data: dataSalesUnits?.allSalesUnits.edges,
        })
      );
    }
    if (dataEmployees) {
      dispatch(
        setState({
          target: "employees",
          data: dataEmployees?.allEmployees.edges,
        })
      );
    }
  }, [dataEmployees, dataSalesUnits]);

  const handleChange = (e: any) => {
    dispatch(setState({ target: "selectedDeptID", data: e.target.value }));
    setFieldValue(yupKey, e.target.value);

    // departmentに紐づくfieldを初期化（UX向上）
    setFieldValue("employee", "");
    setFieldValue("item", "");
  };

  const handleBlur = () => {
    getAllSalesUnits({
      variables: {
        departments: [selectedDepetID],
      },
    });
    getAllEmployees({
      variables: {
        department: selectedDepetID,
      },
    });
  };

  return (
    <DepartmentBaseField
      value={value}
      yupKey={yupKey}
      handleChange={handleChange}
      handleBlur={handleBlur}
    />
  );
};

export default DepartmentField;

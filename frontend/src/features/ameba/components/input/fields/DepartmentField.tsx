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
} from "../../../amebaSlice";
import {
  GET_ALL_SALES_UNITS,
  GET_ALL_EMPLOYEES,
} from "../../../operations/queries";

const DepartmentField = ({ values, setFieldValue }: any) => {
  const dispatch = useDispatch();
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const departments = useSelector(selectDepartments);
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

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name="department"
      label="部門"
      type="text"
      margin="normal"
      variant="outlined"
      fullWidth
      value={values.department}
      onChange={async (e: any) => {
        dispatch(setState({ target: "selectedDeptID", data: e.target.value }));
        setFieldValue("department", e.target.value);
      }}
      onBlur={() => {
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
      }}
    >
      {departments?.map((option: any) => (
        <MenuItem key={option.node.id} value={option.node.id}>
          {option.node.name}
        </MenuItem>
      ))}
    </Field>
  );
};

export default DepartmentField;

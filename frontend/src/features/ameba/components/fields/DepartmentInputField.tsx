import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDepartments,
  selectGetAllCostItems,
  selectGetAllEmployees,
  selectGetAllSalesCategories,
  selectGetAllSalesUnits,
  selectSelectedDeptID,
  setState,
} from "../../amebaSlice";
import DepartmentBaseField from "./DepartmentBaseField";

const DepartmentField = ({
  values,
  yupKey,
  setFieldValue,
  size,
  margin,
  label,
  willRefetchRelatedData,
}: any) => {
  const dispatch = useDispatch();
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const [deptId, setDeptId] = useState(selectedDepetID);
  const departments = useSelector(selectDepartments);

  const refSelectedDeptID = useRef(selectedDepetID);

  const value = values[yupKey];

  const getAllEmployees = useSelector(selectGetAllEmployees);
  const getAllSalesUnits = useSelector(selectGetAllSalesUnits);
  const getAllSalesCategories = useSelector(selectGetAllSalesCategories);
  const getAllCostItems = useSelector(selectGetAllCostItems);

  const handleChange = async (e: any) => {
    if (e.target.value) {
      setFieldValue(yupKey, e.target.value);
      if (willRefetchRelatedData) {
        localStorage.setItem("selectedDeptID", e.target.value);
        dispatch(setState({ target: "selectedDeptID", data: e.target.value }));
        // getRelatedData(e.target.value);
      }
    }

    // departmentに紐づくfieldを初期化（UX向上）
    setFieldValue("employee", "");
    setFieldValue("item", "");
  };

  // useEffect(() => {
  //   getRelatedData(selectedDepetID);
  // }, []);

  const getRelatedData = (deptID: String) => {
    getAllSalesUnits({
      variables: {
        departments: [deptID],
      },
    });
    getAllEmployees({
      variables: {
        departments: [deptID],
      },
    });
    getAllCostItems({
      variables: {
        departments: [deptID],
      },
    });
    getAllSalesCategories({
      variables: {
        departments: [deptID],
      },
    });
  };

  return (
    <DepartmentBaseField
      value={value}
      yupKey={yupKey}
      size={size}
      label={label}
      handleChange={handleChange}
    />
  );
};

export default DepartmentField;

DepartmentField.defaultProps = {
  size: "medium",
  margin: "normal",
  autoFocus: true,
  label: "部門",
  willRefetchRelatedData: true,
};

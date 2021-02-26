import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import { useMutation } from "@apollo/client";
import { CREATE_SALES_BY_NUM } from "../../../operations/mutations";
import DateField from "../fields/DateField";
import DepartmentField from "../fields/DepartmentField";
import SalesUnitField from "../fields/SalesUnitField";
import SalesNumField from "../fields/SalesNumField";
import FormTemplate from "./FormTemplate";

const CostForm = () => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  const [createSales] = useMutation(CREATE_SALES_BY_NUM);

  const initialValues = {
    date: selectedDate,
    department: selectedDepetID,
    item: "",
    num: "",
  };
  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required("空欄です");

  const validationSchema = Yup.object().shape({
    date: yupObject,
    department: yupObject,
    item: yupObject,
    num: Yup.number().typeError("数字で入力してください").required("空欄です"),
  });
  return (
    <FormTemplate
      key="salesByNum"
      initialValues={initialValues}
      validationSchema={validationSchema}
      performCreate={createSales}
      fields={[DateField, DepartmentField, SalesUnitField, SalesNumField]}
    />
  );
};

export default CostForm;

import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import DateInputField from "../../../components/fields/DateInputField";
import DepartmentInputField from "../../../components/fields/DepartmentInputField";
import MoneyField from "../../../components/fields/MoneyField";
import SalesCategoryField from "../../../components/fields/SalesCategoryField";
import FormTemplate from "./FormTemplate";

const SalesByCategory = (props: any) => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  const initialValues = props?.initialValues
    ? props.initialValues
    : {
        date: selectedDate,
        department: selectedDepetID,
        category: "",
        money: "",
      };
  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required("空欄です");

  const validationSchema = Yup.object().shape({
    date: yupObject,
    department: yupObject,
    category: yupObject,
    money: Yup.number()
      .required("空欄です")
      .min(0.01, "最小0.01円です")
      .max(99999999, "8桁までで入力してください"),
  });
  return (
    <FormTemplate
      initialValues={initialValues}
      validationSchema={validationSchema}
      performMutate={props.performMutate}
      fieldMap={[
        { props: { yupKey: "date" }, field: DateInputField },
        { props: { yupKey: "department" }, field: DepartmentInputField },
        { props: { yupKey: "category" }, field: SalesCategoryField },
        { props: { yupKey: "money" }, field: MoneyField },
      ]}
    />
  );
};

export default SalesByCategory;

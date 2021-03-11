import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import CostItemField from "../../../components/fields/CostItemField";
import DateInputField from "../../../components/fields/DateInputField";
import DepartmentInputField from "../../../components/fields/DepartmentInputField";
import MoneyField from "../../../components/fields/MoneyField";
import FormTemplate from "./FormTemplate";

const CostForm = (props: any) => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  const initialValues = props?.initialValues
    ? props.initialValues
    : {
        date: selectedDate,
        department: selectedDepetID,
        item: "",
        money: "",
      };

  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required("空欄です");

  const validationSchema = Yup.object().shape({
    date: yupObject,
    department: yupObject,
    item: yupObject,
    money: Yup.number()
      .required("空欄です")
      .min(0.01, "最小0.01円です")
      .max(99999999, "8桁までで入力してください"),
  });

  return (
    <FormTemplate
      key="cost"
      initialValues={initialValues}
      validationSchema={validationSchema}
      performMutate={props.performMutate}
      fieldMap={[
        { props: { yupKey: "date" }, field: DateInputField },
        { props: { yupKey: "department" }, field: DepartmentInputField },
        { props: { yupKey: "item" }, field: CostItemField },
        { props: { yupKey: "money" }, field: MoneyField },
      ]}
    />
  );
};

export default CostForm;

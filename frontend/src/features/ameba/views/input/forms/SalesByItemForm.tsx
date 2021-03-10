import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import DateInputField from "../../../components/fields/DateInputField";
import DepartmentInputField from "../../../components/fields/DepartmentInputField";
import SalesNumField from "../../../components/fields/SalesNumField";
import SalesUnitField from "../../../components/fields/SalesUnitField";
import FormTemplate from "./FormTemplate";

const SalesByItem = (props: any) => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  console.log(props.initialValues);
  const initialValues = props?.initialValues
    ? props.initialValues
    : {
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
    num: Yup.number()
      .typeError("数字で入力してください")
      .required("空欄です")
      .min(1, "最小1です")
      .max(99999, "最大99999です"),
  });
  return (
    <FormTemplate
      initialValues={initialValues}
      validationSchema={validationSchema}
      performMutate={props.performMutate}
      fieldMap={[
        { props: { yupKey: "date" }, field: DateInputField },
        { props: { yupKey: "department" }, field: DepartmentInputField },
        { props: { yupKey: "item" }, field: SalesUnitField },
        { props: { yupKey: "num" }, field: SalesNumField },
      ]}
    />
  );
};

export default SalesByItem;

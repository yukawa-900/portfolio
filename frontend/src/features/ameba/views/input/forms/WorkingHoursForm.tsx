import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import DateInputField from "../../../components/fields/DateInputField";
import DepartmentInputField from "../../../components/fields/DepartmentInputField";
import EmployeeField from "../../../components/fields/EmployeeField";
import HoursField from "../../../components/fields/HoursField";
import FormTemplate from "./FormTemplate";

const WorkingHoursForm = (props: any) => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  console.log(props.initialValues);
  const initialValues = props?.initialValues
    ? props.initialValues
    : {
        date: selectedDate,
        department: selectedDepetID,
        employee: "",
        hours: "",
      };

  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required("空欄です");

  const validationSchema = Yup.object().shape({
    date: yupObject,
    department: yupObject,
    employee: yupObject,
    hours: Yup.number()
      .typeError("数字で入力してください")
      .required("空欄です")
      .max(24, "最大24時間です")
      .min(0, "最小0時間です"),
  });

  // departmetは、mutationの中ではinputとして利用していない
  // 理由 → employee が department と紐づいているので、department は inputとしては必要なし
  return (
    <FormTemplate
      initialValues={initialValues}
      validationSchema={validationSchema}
      performMutate={props.performMutate}
      fieldMap={[
        { props: { yupKey: "date" }, field: DateInputField },
        { props: { yupKey: "department" }, field: DepartmentInputField },
        { props: { yupKey: "employee" }, field: EmployeeField },
        { props: { yupKey: "hours" }, field: HoursField },
      ]}
    />
  );
};

export default WorkingHoursForm;

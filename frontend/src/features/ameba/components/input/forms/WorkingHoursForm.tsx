import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import formatDate from "../../../../utils/dateFormatter";
import { useMutation } from "@apollo/client";
import { CREATE_WORKING_HOURS } from "../../../operations/mutations";
import DateField from "../fields/DateField";
import DepartmentField from "../fields/DepartmentField";
import CostItemField from "../fields/CostItemField";
import MoneyField from "../fields/MoneyField";
import HoursField from "../fields/HoursField";
import EmployeeField from "../fields/EmployeeField";
import FormTemplate from "./FormTemplate";

const WorkingHoursForm = () => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  const [createWorkingHours] = useMutation(CREATE_WORKING_HOURS);

  const initialValues = {
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
      performCreate={createWorkingHours}
      fields={[DateField, DepartmentField, EmployeeField, HoursField]}
    />
  );
};

export default WorkingHoursForm;

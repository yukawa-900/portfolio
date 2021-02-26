import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import formatDate from "../../../../utils/dateFormatter";
import { useMutation } from "@apollo/client";
import { CREATE_COST } from "../../../operations/mutations";
import DateField from "../fields/DateField";
import DepartmentField from "../fields/DepartmentField";
import CostItemField from "../fields/CostItemField";
import MoneyField from "../fields/MoneyField";
import FormTemplate from "./FormTemplate";

const CostForm = () => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  const [createCost] = useMutation(CREATE_COST);

  const initialValues = {
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
    money: yupObject,
  });

  return (
    <FormTemplate
      key="cost"
      initialValues={initialValues}
      validationSchema={validationSchema}
      performCreate={createCost}
      fields={[DateField, DepartmentField, CostItemField, MoneyField]}
    />
  );
};

export default CostForm;

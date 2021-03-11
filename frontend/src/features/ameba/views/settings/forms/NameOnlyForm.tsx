import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import NameField from "../../../components/fields/NameField";
import FormTemplate from "../../input/forms/FormTemplate";

// default props　アリ
const NameOnlyForm = ({
  initialValues,
  maxLength,
  performMutate,
}: {
  initialValues: {
    id: String;
    name: String;
  };
  maxLength: number;
  performMutate: any;
}) => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required("空欄です");

  const validationSchema = Yup.object().shape({
    name: yupObject.max(maxLength, `最大${maxLength}文字です`),
  });
  console.log(initialValues);
  return (
    <FormTemplate
      initialValues={initialValues}
      validationSchema={validationSchema}
      performMutate={performMutate}
      fieldMap={[{ props: { yupKey: "name" }, field: NameField }]}
    />
  );
};

export default NameOnlyForm;

NameOnlyForm.defaultProps = {
  maxLength: 100,
  initialValues: {
    name: "",
    id: "",
  },
};

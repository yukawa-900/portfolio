import React from "react";
import * as Yup from "yup";
import MultipleDepartmentsField from "../../../components/fields/MultipleDepartmentsField";
import NameField from "../../../components/fields/NameField";
import { yupStringObject } from "../../../components/yup/Main";
import FormTemplate from "../../input/forms/FormTemplate";

// default props　アリ
const NameDeptForm = ({
  initialValues,
  maxLength,
  performMutate,
}: {
  initialValues: {
    id: String;
    name: String;
    departments: String[];
  };
  maxLength: number;
  performMutate: any;
}) => {
  const validationSchema = Yup.object().shape({
    name: yupStringObject.max(maxLength, `最大${maxLength}文字です`),
    departments: Yup.array().of(yupStringObject).required("空欄です"),
  });

  return (
    <FormTemplate
      initialValues={initialValues}
      validationSchema={validationSchema}
      performMutate={performMutate}
      fieldMap={[
        { props: { yupKey: "name" }, field: NameField },
        { props: { yupKey: "departments" }, field: MultipleDepartmentsField },
      ]}
    />
  );
};

export default NameDeptForm;

NameDeptForm.defaultProps = {
  maxLength: 100,
  initialValues: {
    name: "",
    id: "",
    departments: [],
  },
};

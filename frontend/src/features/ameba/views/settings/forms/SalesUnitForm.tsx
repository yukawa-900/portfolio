import LocalDiningIcon from "@material-ui/icons/LocalDining";
import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import MoneyField from "../../../components/fields/MoneyField";
import MultipleDepartmentsField from "../../../components/fields/MultipleDepartmentsField";
import NameField from "../../../components/fields/NameField";
import PhotoField from "../../../components/fields/PhotoField";
import SalesCategoryField from "../../../components/fields/SalesCategoryField";
import {
  yupNumberObject,
  yupPhotoObject,
  yupStringObject,
} from "../../../components/yup/Main";
import FormTemplate from "../../input/forms/FormTemplate";
// import PhotoCropView from "../../../components/photoCrop/CropperDialog";

const EmployeeForm = (props: any) => {
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);

  let initialValues;

  if (props?.initialValues) {
    initialValues = {
      ...props?.initialValues,
      photo: null,
    };
  } else {
    initialValues = {
      // 新規作成
      name: "",
      category: "",
      departments: [],
      unitPrice: "",
      photo: null,
    };
  }

  const validationSchema = Yup.object().shape({
    name: yupStringObject,
    category: yupStringObject,
    departments: Yup.array().of(yupStringObject).required("空欄です"),
    unitPrice: yupNumberObject
      .min(0, "数字が小さすぎます")
      .max(99999, "数字が大きすぎます"),
    photo: yupPhotoObject,
  });

  const fieldMap = [
    {
      props: {
        yupKey: "photo",
        photoUrl: props?.initialValues?.photo,
        UndefinedAvatar: LocalDiningIcon,
      },
      field: PhotoField,
      muiGridXS: 12,
    },
    {
      props: { yupKey: "name", label: "名前" },
      field: NameField,
      muiGridXS: 12,
    },
    {
      props: { yupKey: "unitPrice", label: "販売単価" },
      field: MoneyField,
      muiGridXS: 12,
    },
    {
      props: { yupKey: "category", label: "カテゴリー" },
      field: SalesCategoryField,
      muiGridXS: 12,
    },
    {
      props: {
        yupKey: "departments",
        label: "部門",
      },
      field: MultipleDepartmentsField,
      muiGridXS: 12,
    },
  ];

  return (
    <>
      <FormTemplate
        initialValues={initialValues}
        validationSchema={validationSchema}
        performMutate={props.performMutate}
        fieldMap={fieldMap}
      />
    </>
  );
};

export default EmployeeForm;

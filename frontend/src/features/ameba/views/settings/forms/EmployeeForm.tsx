// import PhotoCropView from "../../../components/photoCrop/CropperDialog";
import FaceIcon from "@material-ui/icons/Face";
import React from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { selectSelectedDate, selectSelectedDeptID } from "../../../amebaSlice";
import DepartmentInputField from "../../../components/fields/DepartmentInputField";
import EmployeePositionField from "../../../components/fields/EmployeePositionField";
import MoneyField from "../../../components/fields/MoneyField";
import NameField from "../../../components/fields/NameField";
import PhotoField from "../../../components/fields/PhotoField";
import {
  yupNumberObject,
  yupPhotoObject,
  yupStringObject,
} from "../../../components/yup/Main";
import FormTemplate from "../../input/forms/FormTemplate";

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
      firstName: "",
      lastName: "",
      furiganaFirstName: "",
      furiganaLastName: "",
      position: "",
      payment: "",
      photo: null,
    };
  }

  const validationSchema = Yup.object().shape({
    firstName: yupStringObject.max(30),
    lastName: yupStringObject.max(30),
    furiganaFirstName: yupStringObject.max(50),
    furiganaLastName: yupStringObject.max(50),
    position: Yup.number().oneOf([0, 1]),
    payment: yupNumberObject
      .min(0, "数字が小さすぎます")
      .max(99999, "最大99,999円までです"),
    photo: yupPhotoObject,
  });

  const fieldMap = [
    {
      props: {
        yupKey: "photo",
        photoUrl: props?.initialValues?.photo,
        UndefinedAvatar: FaceIcon,
      },
      field: PhotoField,
      muiGridXS: 12,
    },
    {
      props: { yupKey: "lastName", label: "姓" },
      field: NameField,
      muiGridXS: 6,
    },
    {
      props: { yupKey: "firstName", label: "名" },
      field: NameField,
      muiGridXS: 6,
    },

    {
      props: { yupKey: "furiganaLastName", label: "姓（ふりがな）" },
      field: NameField,
      muiGridXS: 6,
    },
    {
      props: { yupKey: "furiganaFirstName", label: "名（ふりがな）" },
      field: NameField,
      muiGridXS: 6,
    },
    {
      props: { yupKey: "position" },
      field: EmployeePositionField,
      muiGridXS: 6,
    },
    {
      props: { yupKey: "payment", label: "時給" },
      field: MoneyField,
      muiGridXS: 6,
    },
    {
      props: {
        yupKey: "department",
        label: "所属",
        willRefetchRelatedData: false,
      },
      field: DepartmentInputField,
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

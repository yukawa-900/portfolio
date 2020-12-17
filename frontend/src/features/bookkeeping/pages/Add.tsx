import React, { useEffect } from "react";
import Form from "../components/edit/Form";
import { Formik } from "formik";
import * as Yup from "yup";
import { PROPS_BOOKKEEPING_FIELD } from "../../types";
// import { useSelector, useDispatch } from "react-redux";
// import { selectAccountInfo, fetchAccountInfo } from "../bookkeepingSlice";

const Add = () => {
  // const dispatch = useDispatch();
  // const accountInfo = useSelector(selectAccountInfo);
  // // useEffect(() => {
  // //   dispatch(fetchAccountInfo());
  // // }, []);

  return (
    <div>
      <Form role={"create"} />
    </div>
  );
};

export default Add;

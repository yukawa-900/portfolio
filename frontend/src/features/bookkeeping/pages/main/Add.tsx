import React, { useEffect } from "react";
import Form from "../../components/edit/Form";
import { Formik } from "formik";
import * as Yup from "yup";
import { PROPS_BOOKKEEPING_FIELD } from "../../../types";
import { useSelector, useDispatch } from "react-redux";
import { initializeTransactionGroup } from "../../bookkeepingSlice";

const Add = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initializeTransactionGroup());
  }, []);

  return (
    <div>
      <Form role={"create"} />
    </div>
  );
};

export default Add;

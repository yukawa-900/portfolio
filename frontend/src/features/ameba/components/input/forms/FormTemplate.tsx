import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form } from "formik";
import * as Yup from "yup";
// import TextField from "@material-ui/core/TextField";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SnackBar from "../common/Snackbar";
import { Rifm } from "rifm";
import {
  numberAccept,
  parseNumber,
  formatFloatingPointNumber,
} from "../../../../utils/moneyFormatter";
import {
  selectIsError,
  selectMessage,
  selectSelectedDate,
  selectSelectedDeptID,
  selectCostItems,
  selectDepartments,
  setState,
} from "../../../amebaSlice";
import formatDate from "../../../../utils/dateFormatter";
import { useMutation } from "@apollo/client";
import { CREATE_COST } from "../../../operations/mutations";
import DateField from "../fields/DateField";
import DepartmentField from "../fields/DepartmentField";
import CostItemField from "../fields/CostItemField";
import MoneyField from "../fields/MoneyField";

const useStyles = makeStyles((theme) => ({
  form: {
    margin: "10px auto",
    width: "90%",
    [theme.breakpoints.up("md")]: {
      maxWidth: "440px",
    },
  },
  submitButton: {
    display: "block",
    margin: "20px auto",
  },
}));

const FormTemplate = ({
  initialValues,
  validationSchema,
  performCreate,
  fields,
}: any) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const message = useSelector(selectMessage);
  const isError = useSelector(selectIsError);

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await performCreate({
              variables: values,
            });
            setSubmitting(false);
            resetForm({
              values: initialValues,
            });
            dispatch(setState({ target: "isError", data: false }));
            dispatch(setState({ target: "message", data: "送信されました" }));
          } catch (err) {
            // window.alert(err);
            dispatch(setState({ target: "isError", data: true }));
            dispatch(
              setState({ target: "message", data: "問題が発生しました" })
            );
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => {
          return (
            <Form onSubmit={handleSubmit} className={classes.form}>
              {fields.map((Field: any) => (
                <Field
                  values={values}
                  setFieldValue={setFieldValue}
                  errors={errors}
                />
              ))}
              {isSubmitting && <LinearProgress color="secondary" />}
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.submitButton}
                onClick={() => {
                  console.log(values);
                }}
              >
                送信する
              </Button>
            </Form>
          );
        }}
      </Formik>
      <SnackBar />
    </>
  );
};

export default FormTemplate;

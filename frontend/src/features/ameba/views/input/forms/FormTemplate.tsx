import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form } from "formik";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import { setState } from "../../../amebaSlice";

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
  performMutate,
  fieldMap,
}: any) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await performMutate({
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
              {fieldMap.map((fieldInfo: any) => (
                <fieldInfo.field
                  values={values}
                  yupKey={fieldInfo.yupKey}
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
              >
                送信する
              </Button>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default FormTemplate;

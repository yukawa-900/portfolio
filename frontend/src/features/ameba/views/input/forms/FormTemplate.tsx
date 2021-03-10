import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Form, Formik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
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
  const theme = useTheme();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        console.log(values);
        // photo : null を削除
        for (const [key, value] of Object.entries(values)) {
          if (value === null) {
            delete values[key];
          }
        }

        try {
          console.log("hello from onSubmit");
          console.log(values);
          console.log(performMutate);
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
          dispatch(setState({ target: "message", data: "問題が発生しました" }));
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
            <Grid container direction="row" spacing={3}>
              {fieldMap.map((fieldInfo: any) => (
                <Grid item xs={fieldInfo?.muiGridXS ? fieldInfo.muiGridXS : 12}>
                  <fieldInfo.field
                    // value={values[fieldinfo.yupKey]} とすると、うまくいかない
                    values={values}
                    {...fieldInfo.props}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    // size={isXSDown ? "small" : "medium"}
                    size={"medium"}
                  />
                </Grid>
              ))}
            </Grid>

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
  );
};

export default FormTemplate;

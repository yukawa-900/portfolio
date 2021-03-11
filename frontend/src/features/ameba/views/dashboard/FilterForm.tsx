import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import formatDate from "../../../utils/dateFormatter";
import { selectSelectedDeptID } from "../../amebaSlice";
import DateBaseField from "../../components/fields/DateBaseField";
import DepartmentBaseField from "../../components/fields/DepartmentBaseFied";

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    textAlign: "center",
  },
  cardContent: {
    display: "flex",
    justifyContent: "center",
  },
  form: {
    width: 400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const FilterForm = ({ handleSubmit }: any) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selectedDeptID = useSelector(selectSelectedDeptID);

  const [isDateRange, setIsDateRange] = useState(false);

  const today = new Date();
  const before7Days = new Date(new Date().setDate(today.getDate() - 7));
  const initialValues = {
    dateBefore: formatDate(today),
    dateAfter: formatDate(before7Days),
    department: selectedDeptID,
  };
  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required("空欄です");

  const validationSchema = Yup.object().shape({
    dateBefore: yupObject,
    dateAfter: yupObject,
    department: yupObject,
  });
  const handleDateRangeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDateRange(event.target.checked);
  };

  return (
    <Card>
      <CardHeader title="検索条件" className={classes.cardHeader} />
      <CardContent className={classes.cardContent}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values: any) => {
            if (!isDateRange) {
              values.dateAfter = values.dateBefore;
            }
            await handleSubmit(values);
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
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className={classes.form}
              >
                <Grid
                  container
                  spacing={3}
                  direction="column"
                  alignItems="center"
                  justify="center"
                >
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isDateRange}
                          onChange={handleDateRangeChange}
                        />
                      }
                      label="範囲検索"
                    />
                  </Grid>

                  {isDateRange ? (
                    <Grid container item justify="space-between" spacing={2}>
                      <Grid item xs={5} md={5}>
                        <DateBaseField
                          yupKey="dateAfter"
                          value={values.dateAfter}
                          errorMessage={errors.dateAfter}
                          handleChange={(date: any) =>
                            setFieldValue("dateAfter", formatDate(date))
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        container
                        xs={2}
                        md={2}
                        justify="center"
                        style={{ fontSize: "1.6rem", marginTop: "0.4rem" }}
                      >
                        <Grid item>〜</Grid>
                      </Grid>

                      <Grid item xs={5} md={5}>
                        <DateBaseField
                          yupKey="dateBefore"
                          value={values.dateBefore}
                          errorMessage={errors.dateBefore}
                          handleChange={(date: any) =>
                            setFieldValue("dateBefore", formatDate(date))
                          }
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid item xs={12} style={{ width: "100%" }}>
                      <DateBaseField
                        yupKey="dateBefore"
                        value={values.dateBefore}
                        errorMessage={errors.dateBefore}
                        handleChange={(date: any) => {
                          // after と before を両方変更する
                          setFieldValue("dateBefore", formatDate(date));
                          setFieldValue("dateAfter", formatDate(date));
                        }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} style={{ width: "100%" }}>
                    <DepartmentBaseField
                      yupKey="department"
                      value={values.department}
                      handleChange={(
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        handleChange(e);
                        localStorage.setItem("selectedDeptID", e.target.value);
                      }}
                      handleBlur={handleBlur}
                    />
                  </Grid>
                </Grid>
                {isSubmitting && <LinearProgress color="secondary" />}
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  className={classes.submitButton}
                >
                  検索する
                </Button>
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default FilterForm;

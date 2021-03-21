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
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import formatDate from "../../../utils/dateFormatter";
import {
  selectSelectedDeptID,
  selectDepartments,
  // selectFilterVariables,
  setState,
  selectGraphFilterVariables,
} from "../../amebaSlice";
import DateBaseField from "../../components/fields/DateBaseField";
import DepartmentInputField from "../../components/fields/DepartmentInputField";
import Loading from "../../../auth/Loading";

const useStyles = makeStyles((theme) => ({
  card: {
    minHeight: 354,
    position: "relative",
  },
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
  const departments = useSelector(selectDepartments);
  const [isDateRange, setIsDateRange] = useState(false);

  const today = new Date();
  const before7Days = new Date(new Date().setDate(today.getDate() - 7));

  const [initialValues, setInitialValues] = useState({
    dateBefore: formatDate(today),
    dateAfter: formatDate(before7Days),
    department: departments[0]?.node?.id,
  });

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

  const handleFormikSubmit = async (values: any) => {
    if (!isDateRange) {
      values.dateAfter = values.dateBefore;
    }
    dispatch(
      setState({
        target: "graphFilterVariables",
        data: {
          displayed: "profitPerHour",
          dataType: "general",
        },
      })
    );
    await handleSubmit(values);
  };

  useEffect(() => {
    if (!localStorage.getItem("departments")) {
      setInitialValues({
        ...initialValues,
        department: departments[0]?.node?.id,
      });
    }
  }, [departments]);

  useEffect(() => {
    // ロード時にいきなりsubmitする
    // 本来は必要ないかもしれないが、ポートフォリオ としては親切だと思う
    if (initialValues.department) {
      handleFormikSubmit(initialValues);
    }
  }, [initialValues.department]);

  return (
    <Card className={classes.card}>
      <CardHeader title="検索条件" className={classes.cardHeader} />
      <CardContent className={classes.cardContent}>
        {initialValues.department ? (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormikSubmit}
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
                    dispatch(
                      setState({
                        target: "selectedDate",
                        data: values.dateBefore,
                      })
                    );
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
                      <DepartmentInputField
                        yupKey="department"
                        values={values}
                        setFieldValue={setFieldValue}
                        label={"部門"}
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
        ) : (
          <Loading size="2rem" />
        )}
      </CardContent>
    </Card>
  );
};

export default FilterForm;

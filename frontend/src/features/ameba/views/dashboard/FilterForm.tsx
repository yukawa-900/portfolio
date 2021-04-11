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
import FormGroup from "@material-ui/core/FormGroup";
import { yupStringObject, yupBooleanObject } from "../../components/yup/Main";

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
  // const [isMonth, setIsMonth] = useState(false);

  const today = new Date();
  const before7Days = new Date(new Date().setDate(today.getDate() - 7));

  const [initialValues, setInitialValues] = useState({
    dateBefore: formatDate(today),
    dateAfter: formatDate(before7Days),
    department: departments[0]?.node?.id,
    isMonth: false,
  });

  const validationSchema = Yup.object().shape({
    dateBefore: yupStringObject,
    dateAfter: yupStringObject,
    department: yupStringObject,
    isMonth: yupBooleanObject,
  });
  const handleDateRangeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDateRange(event.target.checked);
  };
  // const handleIsMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setIsMonth(event.target.checked);
  // };

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
    if (localStorage.getItem("selectedDeptID")) {
      setInitialValues({
        ...initialValues,
        department: localStorage.getItem("selectedDeptID"),
      });
    } else {
      const sampleDept = departments[0]?.node?.id;
      setInitialValues({
        ...initialValues,
        department: sampleDept,
      });
      dispatch(setState({ target: "selectedDeptID", data: sampleDept }));
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
                    <Grid item xs>
                      {!isDateRange && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.isMonth}
                              onChange={() => {
                                dispatch(
                                  setState({
                                    target: "isMonth",
                                    data: !values.isMonth,
                                  })
                                );
                                setFieldValue("isMonth", !values.isMonth);
                              }}
                            />
                          }
                          label="月次"
                        />
                      )}
                      {!values.isMonth && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isDateRange}
                              onChange={handleDateRangeChange}
                            />
                          }
                          label="範囲"
                        />
                      )}
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
                            console.log(values);
                          }}
                          isMonth={values.isMonth}
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

import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import { DataGrid, GridCellParams, GridColDef } from "@material-ui/data-grid";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import EditIcon from "@material-ui/icons/Edit";
import FaceIcon from "@material-ui/icons/Face";
import LocalDiningIcon from "@material-ui/icons/LocalDining";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../auth/Loading";
import {
  selectCostItems,
  selectDepartments,
  selectEmployees,
  selectIsLoading,
  selectIsPhotoEdited,
  selectSalesCategories,
  selectSalesUnits,
  selectSelectedDeptID,
  setState,
} from "../../amebaSlice";
import DepartmentInputField from "../../components/fields/DepartmentInputField";
import SnackBar from "../../components/snackbars/Snackbar";
import {
  CREATE_COST_ITEM,
  CREATE_DEPARTMENT,
  CREATE_EMPLOYEE,
  CREATE_SALES_CATEGORY,
  CREATE_SALES_UNIT,
  DELETE_COST_ITEM,
  DELETE_DEPARTMENT,
  DELETE_EMPLOYEE,
  DELETE_SALES_CATEGORY,
  DELETE_SALES_UNIT,
  getUpdateEmployeeMutation,
  getUpdateSalesUnitMutation,
  UPDATE_COST_ITEM,
  UPDATE_DEPARTMENT,
  UPDATE_SALES_CATEGORY,
} from "../../operations/mutations";
import {
  GET_ALL_AMEBA_DEPARTMENTS,
  GET_ALL_COST_ITEMS,
  GET_ALL_EMPLOYEES,
  GET_ALL_SALES_CATEGORIES,
  GET_ALL_SALES_UNITS,
  GET_SINGLE_COST_ITEM,
  GET_SINGLE_DEPARTMENT,
  GET_SINGLE_EMPLOYEE,
  GET_SINGLE_SALES_CATEGORY,
  GET_SINGLE_SALES_UNIT,
} from "../../operations/queries";
import { typeSelectedSettingsItem } from "../../types";
import Dialog from "../dashboard/Dialog";
import { employeePositionFormatter, yenFormatter } from "../valueFormatter";
import EmployeeForm from "./forms/EmployeeForm";
import NameOnlyForm from "./forms/NameOnlyForm";
import SalesUnitForm from "./forms/SalesUnitForm";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const useStyles = makeStyles((theme) => ({
  card: {
    width: "100%",
    maxWidth: 680,
    margin: "0 auto",
    marginTop: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(1),
    },
  },
  headerAction: {
    margin: theme.spacing(2, 4, 0, 0),
  },
  form: {
    margin: theme.spacing(0, 2),
    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(1, 1, 0, 0),
    },
  },
  datagridContainer: {
    width: "100%",
    maxWidth: 1000,
    margin: "0 auto",
    [theme.breakpoints.up("sm")]: {
      minHeight: 400,
    },
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    [theme.breakpoints.down("xs")]: {
      width: theme.spacing(5),
      height: theme.spacing(5),
    },
  },
  createButton: {
    margin: theme.spacing(2, 0, 2, 0),
  },
}));

const Table = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));
  const isMDDown = useMediaQuery(theme.breakpoints.down("md"));

  const [formRole, setFormRole] = useState<"edit" | "create">("edit");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const isLoading = useSelector(selectIsLoading);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleClickCreateButton = () => {
    setFormRole("create");
    setIsDialogOpen(true);
  };

  const performCreate = async (args: any) => {
    await getDataSets(dataType).create(args);
    await handleDialogClose();
  };

  const performUpdate = async (args: any) => {
    await getDataSets(dataType).update(args);
    await handleDialogClose();
  };

  const performMutate = formRole === "create" ? performCreate : performUpdate;

  const handleDelete = async () => {
    const datasets = getDataSets(dataType);
    const id = datasets.retrievedID;

    try {
      if (id) {
        await datasets.delete({
          variables: { id: id },
        });
      }
      dispatch(setState({ target: "isError", data: false }));
      dispatch(setState({ target: "message", data: "削除しました" }));
    } catch (err) {
      dispatch(setState({ target: "isError", data: true }));
      dispatch(setState({ target: "message", data: "削除できませんでした" }));
    }

    handleDialogClose();
  };

  const [dataType, setDataType] = useState<typeSelectedSettingsItem>(
    "salesUnit"
  );
  const departments = useSelector(selectDepartments);
  const costItems = useSelector(selectCostItems);
  const salesCategories = useSelector(selectSalesCategories);
  const salesUnits = useSelector(selectSalesUnits);
  const employees = useSelector(selectEmployees);
  const selectedDeptID = useSelector(selectSelectedDeptID);

  const refetchSalesUnits = {
    query: GET_ALL_SALES_UNITS,
    variables: { departments: [selectedDeptID] },
  };

  const refetchEmployees = {
    query: GET_ALL_EMPLOYEES,
    variables: { department: selectedDeptID },
  };

  const isPhotoEdited = useSelector(selectIsPhotoEdited);

  const [
    getSingleSalesUnit,
    {
      data: dataSingleSalesUnit,
      loading: loadingSingleSalesUnit,
      error: errorSingleSalesUnit,
    },
  ] = useLazyQuery(GET_SINGLE_SALES_UNIT, {
    fetchPolicy: "network-only",
  });
  const [
    getSingleSalesCategory,
    {
      data: dataSingleSalesCategory,
      loading: loadingSingleSalesCategory,
      error: errorSingleSalesCategory,
    },
  ] = useLazyQuery(GET_SINGLE_SALES_CATEGORY, {
    fetchPolicy: "network-only",
  });
  const [
    getSingleCostItem,
    {
      data: dataSingleCostItem,
      loading: loadingSingleCostItem,
      error: errorSingleCostItem,
    },
  ] = useLazyQuery(GET_SINGLE_COST_ITEM, {
    fetchPolicy: "network-only",
  });
  const [
    getSingleEmployee,
    {
      data: dataSingleEmployee,
      loading: loadingSingleEmployee,
      error: errorSingleEmployee,
    },
  ] = useLazyQuery(GET_SINGLE_EMPLOYEE, {
    fetchPolicy: "network-only",
  });
  const [
    getSingleDepartment,
    {
      data: dataSingleDepartment,
      loading: loadingSingleDepartment,
      error: errorSingleDepartment,
    },
  ] = useLazyQuery(GET_SINGLE_DEPARTMENT, {
    fetchPolicy: "network-only",
  });

  const [createCostItem] = useMutation(CREATE_COST_ITEM, {
    refetchQueries: [{ query: GET_ALL_COST_ITEMS }],
  });

  const [createSalesCategory] = useMutation(CREATE_SALES_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_SALES_CATEGORIES }],
  });

  const [createDepartment] = useMutation(CREATE_DEPARTMENT, {
    refetchQueries: [{ query: GET_ALL_AMEBA_DEPARTMENTS }],
  });
  const [createSalesUnit] = useMutation(CREATE_SALES_UNIT, {
    refetchQueries: [refetchSalesUnits],
  });
  const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
    refetchQueries: [refetchEmployees],
  });

  const [updateCostItem] = useMutation(UPDATE_COST_ITEM, {
    refetchQueries: [{ query: GET_ALL_COST_ITEMS }],
  });

  const [updateSalesCategory] = useMutation(UPDATE_SALES_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_SALES_CATEGORIES }],
  });

  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT, {
    refetchQueries: [{ query: GET_ALL_AMEBA_DEPARTMENTS }],
  });

  const [updateSalesUnit] = useMutation(
    getUpdateSalesUnitMutation(isPhotoEdited),
    {
      refetchQueries: [refetchSalesUnits],
    }
  );

  const [updateEmployee] = useMutation(
    getUpdateEmployeeMutation(isPhotoEdited),
    {
      refetchQueries: [refetchEmployees],
    }
  );

  const [deleteCostItem] = useMutation(DELETE_COST_ITEM, {
    refetchQueries: [{ query: GET_ALL_COST_ITEMS }],
  });

  const [deleteSalesCategory] = useMutation(DELETE_SALES_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_SALES_CATEGORIES }],
  });

  const [deleteDepartment] = useMutation(DELETE_DEPARTMENT, {
    refetchQueries: [{ query: GET_ALL_AMEBA_DEPARTMENTS }],
  });
  const [deleteSalesUnit] = useMutation(DELETE_SALES_UNIT, {
    refetchQueries: [refetchSalesUnits],
  });
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    refetchQueries: [refetchEmployees],
  });

  const initialValues: {
    dataType: typeSelectedSettingsItem;
    department: String;
  } = {
    dataType: "salesUnit",
    department: selectedDeptID,
  };

  const idColumn: GridColDef = {
    field: "id",
    headerName: "編集",
    width: 80,
    renderCell: (params: GridCellParams) => (
      <IconButton
        aria-label="edit"
        size="small"
        onClick={async () => {
          setFormRole("edit");
          await getDataSets(dataType).retrieve({
            variables: {
              id: params.value,
            },
          });

          dispatch(setState({ target: "isPhotoEdited", data: false })); // 初期化
          setIsDialogOpen(true);
        }}
      >
        <EditIcon />
      </IconButton>
    ),
  };
  const nameColumn: GridColDef = {
    field: "name",
    headerName: "名前",
    width: 200,
  };
  const photoColumn: GridColDef = {
    field: "photo",
    headerName: "画像",
    width: 80,
    renderCell: (params: GridCellParams) => (
      <Avatar
        src={params.value ? String(params.value) : undefined}
        className={classes.avatar}
      />
    ),
  };

  const costItemColumns: GridColDef[] = [idColumn, nameColumn];
  const salesCategoryColumns: GridColDef[] = [idColumn, nameColumn];
  const departmentColumns: GridColDef[] = [idColumn, nameColumn];
  const salesUnitColumns: GridColDef[] = [
    idColumn,
    {
      ...photoColumn,
      renderCell: (params: GridCellParams) => (
        <Avatar
          src={params.value ? String(params.value) : undefined}
          className={classes.avatar}
        >
          <LocalDiningIcon />
        </Avatar>
      ),
    },
    nameColumn,
    {
      field: "unitPrice",
      headerName: "単価",
      width: 140,
      type: "number",
      valueFormatter: yenFormatter,
    },
  ];
  const employeeColumns: GridColDef[] = [
    idColumn,
    {
      ...photoColumn,
      renderCell: (params: GridCellParams) => (
        <Avatar
          src={params.value ? String(params.value) : undefined}
          className={classes.avatar}
        >
          <FaceIcon />
        </Avatar>
      ),
    },
    {
      field: "fullName",
      headerName: "名前",
      width: 140,
    },
    {
      field: "fullFurigana",
      headerName: "ふりがな",
      width: 140,
    },
    {
      field: "position",
      headerName: "区分",
      width: 140,
      valueFormatter: employeePositionFormatter,
    },
  ];

  const costItemRows: GridCellParams[] = costItems.map((i: any) => i.node);
  const salesCategoryRows: GridCellParams[] = salesCategories.map(
    (i: any) => i.node
  );
  const departmentRows: GridCellParams[] = departments.map((i: any) => i.node);
  const salesUnitRows: GridCellParams[] = salesUnits.map((i: any) => ({
    ...i.node,
    photo: `${apiUrl}${i.node.photo}`,
  }));
  const employeeRows: GridCellParams[] = employees.map((i: any) => ({
    ...i.node,
    photo: `${apiUrl}${i.node.photo}`,
  }));

  const getDataSets = (dataType: typeSelectedSettingsItem) => {
    if (dataType === "costItem") {
      return {
        columns: costItemColumns,
        rows: costItemRows,
        retrievedID: dataSingleCostItem?.costItem?.id,
        loading: loadingSingleCostItem,
        retrieve: getSingleCostItem,
        create: createCostItem,
        update: updateCostItem,
        delete: deleteCostItem,
      };
    } else if (dataType === "salesCategory") {
      return {
        columns: salesCategoryColumns,
        rows: salesCategoryRows,
        retrievedID: dataSingleSalesCategory?.salesCategory?.id,
        loading: loadingSingleSalesCategory,
        retrieve: getSingleSalesCategory,
        create: createSalesCategory,
        update: updateSalesCategory,
        delete: deleteSalesCategory,
      };
    } else if (dataType === "salesUnit") {
      return {
        columns: salesUnitColumns,
        rows: salesUnitRows,
        retrievedID: dataSingleSalesUnit?.salesUnit?.id,
        loading: loadingSingleSalesUnit,
        retrieve: getSingleSalesUnit,
        create: createSalesUnit,
        update: updateSalesUnit,
        delete: deleteSalesUnit,
      };
    } else if (dataType === "employee") {
      return {
        columns: employeeColumns,
        rows: employeeRows,
        retrievedID: dataSingleEmployee?.employee?.id,
        loading: loadingSingleEmployee,
        retrieve: getSingleEmployee,
        create: createEmployee,
        update: updateEmployee,
        delete: deleteEmployee,
      };
    } else {
      // if (dataType==="department")
      return {
        columns: departmentColumns,
        rows: departmentRows,
        retrievedID: dataSingleDepartment?.department?.id,
        loading: loadingSingleDepartment,
        retrieve: getSingleDepartment,
        create: createDepartment,
        update: updateDepartment,
        delete: deleteDepartment,
      };
    }
  };

  return (
    <>
      <Card className={classes.card}>
        <CardHeader
          title="設定"
          subheader="Settings"
          action={
            <Formik initialValues={initialValues} onSubmit={() => {}}>
              {({ values, setFieldValue }) => {
                return (
                  <Form className={classes.form}>
                    <Grid
                      container
                      spacing={isXSDown ? 2 : 4}
                      direction={isXSDown ? "column" : "row"}
                      style={{ marginTop: 1 }}
                    >
                      {(values.dataType === "salesUnit" ||
                        values.dataType === "employee") && (
                        <Grid item xs>
                          <DepartmentInputField
                            autoFocus={false}
                            values={values}
                            yupKey={"department"}
                            setFieldValue={setFieldValue}
                            size={isXSDown ? "small" : "medium"}
                          />
                        </Grid>
                      )}
                      <Grid item xs>
                        <Field
                          component={TextField}
                          select
                          autoFocus
                          autoComplete="off"
                          name="dataType"
                          label="設定項目"
                          type="text"
                          variant="outlined"
                          value={values.dataType}
                          size={isXSDown ? "small" : "medium"}
                          onChange={(e: any) => {
                            setFieldValue("dataType", e.target.value);
                            setDataType(e.target.value);
                          }}
                        >
                          <MenuItem value={"salesUnit"}>商品/メニュー</MenuItem>
                          <MenuItem value={"salesCategory"}>
                            売上カテゴリー
                          </MenuItem>
                          <MenuItem value={"costItem"}>費用項目</MenuItem>
                          <MenuItem value={"employee"}>従業員</MenuItem>
                          <MenuItem value={"department"}>部門</MenuItem>
                        </Field>
                      </Grid>
                    </Grid>
                  </Form>
                );
              }}
            </Formik>
          }
        />
        <CardContent
        // className={classes.cardContent}
        >
          <div className={classes.datagridContainer}>
            {isLoading ? (
              <Loading size={"3rem"} />
            ) : (
              <DataGrid
                autoHeight
                disableSelectionOnClick
                scrollbarSize={30}
                pageSize={isXSDown ? 5 : 10}
                density={"standard"}
                rowHeight={isXSDown ? 56 : 70} // default 52
                rows={getDataSets(dataType).rows}
                columns={getDataSets(dataType).columns}
              />
            )}
          </div>
          <Grid container justify="center">
            <Grid item>
              <Button
                color="primary"
                startIcon={<ArrowRightIcon />}
                size="large"
                // variant="contained"
                className={classes.createButton}
                onClick={handleClickCreateButton}
              >
                新規作成
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        formRole={formRole}
        isOpen={isDialogOpen}
        handleClose={handleDialogClose}
        handleDelete={handleDelete}
      >
        {getDataSets(dataType).loading ? (
          <Loading size="3rem" />
        ) : ["department", "salesCategory", "costItem"].includes(dataType) ? (
          <NameOnlyForm
            initialValues={
              formRole === "edit"
                ? {
                    name:
                      dataType === "department"
                        ? dataSingleDepartment?.department?.name
                        : dataType === "salesCategory"
                        ? dataSingleSalesCategory?.salesCategory?.name
                        : dataType === "costItem"
                        ? dataSingleCostItem?.costItem?.name
                        : "",
                    id: getDataSets(dataType).retrievedID,
                  }
                : undefined
            }
            performMutate={performMutate}
          />
        ) : dataType === "employee" ? (
          <EmployeeForm
            performMutate={performMutate}
            initialValues={
              formRole === "edit"
                ? {
                    ...dataSingleEmployee?.employee,
                    payment: String(dataSingleEmployee?.employee?.payment),
                    position: Number(
                      dataSingleEmployee?.employee?.position?.slice(-1)
                    ),
                    department: dataSingleEmployee?.employee?.department?.id,
                  }
                : undefined
            }
          />
        ) : dataType === "salesUnit" ? (
          <SalesUnitForm
            performMutate={performMutate}
            initialValues={
              formRole === "edit"
                ? {
                    ...dataSingleSalesUnit?.salesUnit,
                    category: dataSingleSalesUnit?.salesUnit?.category?.id,
                    departments: dataSingleSalesUnit?.salesUnit?.departments?.edges?.map(
                      (dept: any) => dept.node.id
                    ),
                    photo: dataSingleSalesUnit?.salesUnit?.photo,
                    unitPrice: String(
                      dataSingleSalesUnit?.salesUnit?.unitPrice
                    ),
                  }
                : undefined
            }
          />
        ) : null}
      </Dialog>
      <SnackBar autoHideDuration={2500} />
    </>
  );
};

export default Table;

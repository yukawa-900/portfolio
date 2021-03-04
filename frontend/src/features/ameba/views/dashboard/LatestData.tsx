import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-deferred";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  makeStyles,
  colors,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Loading from "../../../auth/Loading";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { useSelector } from "react-redux";
import { selectIsDarkMode } from "../../../auth/authSlice";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridCellParams,
  GridSortDirection,
  GridSortModelParams,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import Dialog from "./Dialog";
import CostForm from "../input/forms/CostForm";
import SalesByItemForm from "../input/forms/SalesByItemForm";
import SalesByCategoryForm from "../input/forms/SalesByCategoryForm";
import WorkingHoursForm from "../input/forms/WorkingHoursForm";
import { useLazyQuery, useMutation, QueryLazyOptions } from "@apollo/client";
import {
  GET_SINGLE_COST,
  GET_SINGLE_SALES_BY_ITEM,
  GET_SINGLE_SALES_BY_CATEGORY,
  GET_SINGLE_WORKING_HOURS,
  GET_INPUT_DATA,
} from "../../operations/queries";
import {
  DELETE_COST,
  DELETE_SALES_BY_CATEGORY,
  DELETE_SALES_BY_ITEM,
  DELETE_WORKING_HOURS,
  UPDATE_COST,
  UPDATE_SALES_BY_CATEGORY,
  UPDATE_SALES_BY_ITEM,
  UPDATE_WORKING_HOURS,
} from "../../operations/mutations";
import { setState } from "../../amebaSlice";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  headerAction: {
    margin: theme.spacing(2, 2, 0, 0),
  },
}));

type typeDataType = "cost" | "salesByItem" | "salesByCategory" | "workingHours";

const moneyFormatter = (params: ValueFormatterParams) =>
  formatFloatingPointNumber(String(params.value), 0, "JPY");

const LatestData = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [dataType, setDataType] = useState<typeDataType>("cost");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const [
    getSingleCost,
    {
      data: dataSingleCost,
      loading: loadingSingleCost,
      error: errorSingleCost,
    },
  ] = useLazyQuery(GET_SINGLE_COST, {
    fetchPolicy: "network-only",
  });

  const [
    getSingleSalesByItem,
    {
      data: dataSingleSalesByItem,
      loading: loadingSingleSalesByItem,
      error: errorSingleSalesByItem,
    },
  ] = useLazyQuery(GET_SINGLE_SALES_BY_ITEM, {
    fetchPolicy: "network-only",
  });

  const [
    getSingleSalesByCategory,
    {
      data: dataSingleSalesByCategory,
      loading: loadingSingleSalesByCategory,
      error: errorSingleSalesByCategory,
    },
  ] = useLazyQuery(GET_SINGLE_SALES_BY_CATEGORY, {
    fetchPolicy: "network-only",
  });

  const [
    getSingleWorkingHours,
    {
      data: dataSingleWorkingHours,
      loading: loadingSingleWorkingHours,
      error: errorSingleWorkingHours,
    },
  ] = useLazyQuery(GET_SINGLE_WORKING_HOURS, {
    fetchPolicy: "network-only",
  });

  const [deleteCost] = useMutation(DELETE_COST, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });

  const [deleteSalesByItem] = useMutation(DELETE_SALES_BY_ITEM, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });

  const [deleteSalesByCategory] = useMutation(DELETE_SALES_BY_CATEGORY, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });

  const [deleteWorkingHours] = useMutation(DELETE_WORKING_HOURS, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });

  const [updateCost] = useMutation(UPDATE_COST, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });
  const [updateSalesByItem] = useMutation(UPDATE_SALES_BY_ITEM, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });
  const [updateSalesByCategory] = useMutation(UPDATE_SALES_BY_CATEGORY, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });
  const [updateWorkingHours] = useMutation(UPDATE_WORKING_HOURS, {
    refetchQueries: [{ query: GET_INPUT_DATA }],
  });

  const performUpdate = async (args: any) => {
    await getDataSets(dataType).update(args);
    await handleDialogClose();
  };

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
      dispatch(setState({ target: "isError", data: false }));
      dispatch(setState({ target: "message", data: "削除できませんでした" }));
    }

    handleDialogClose();
  };

  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "編集",
      width: 80,
      renderCell: (params: GridCellParams) => (
        <IconButton
          aria-label="edit"
          size="small"
          onClick={async () => {
            await getDataSets(dataType).retrieve({
              variables: {
                id: params.value,
              },
            });
            setIsDialogOpen(true);
          }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    { field: "date", headerName: "日付", type: "date", width: 140 },
  ];

  const columnsSalesByItem: GridColDef[] = baseColumns.concat([
    { field: "name", headerName: "メニュー名", width: 140 },
    {
      field: "unitPrice",
      headerName: "販売単価",
      width: 140,
      type: "number",
      valueFormatter: moneyFormatter,
    },
    { field: "num", headerName: "売上個数", width: 140, type: "number" },
    {
      field: "money",
      headerName: "売上金額",
      width: 140,
      type: "number",
      valueFormatter: moneyFormatter,
    },
  ]);

  const columnsSalesByCategory: GridColDef[] = baseColumns.concat([
    { field: "category", headerName: "売上カテゴリー", width: 180 },
    {
      field: "money",
      headerName: "売上金額",
      width: 180,
      type: "number",
      valueFormatter: moneyFormatter,
    },
  ]);

  const columnsCost: GridColDef[] = baseColumns.concat([
    { field: "name", headerName: "費用項目", width: 180 },
    {
      field: "money",
      headerName: "金額",
      width: 180,
      type: "number",
      valueFormatter: moneyFormatter,
    },
  ]);

  const columnsWorkingHours: GridColDef[] = baseColumns.concat([
    { field: "employeeName", headerName: "従業員", width: 180 },
    { field: "employeePosition", headerName: "区分", width: 180 },
    { field: "hours", headerName: "労働時間", width: 180, type: "number" },
  ]);

  const rowsSalesByItem = data?.allSalesByItem?.edges.map((i: any) => ({
    ...i.node,
    name: i.node.item.name,
    unitPrice: i.node.item.unitPrice,
  }));
  const rowsSalesByCategory = data?.allSalesByCategory?.edges.map((i: any) => ({
    ...i.node,
    category: i.node.category.name,
  }));
  const rowsCost = data?.allCost?.edges.map((i: any) => ({
    ...i.node,
    name: i.node.item.name,
  }));
  const rowsWorkingHours = data?.allWorkingHours?.edges.map((i: any) => ({
    ...i.node,
    employeeName: i.node.employee.fullName,
    employeePosition: i.node.employee.position,
  }));

  const getDataSets = (dataType: typeDataType) => {
    if (dataType === "cost") {
      return {
        rows: rowsCost,
        columns: columnsCost,
        retrievedID: dataSingleCost?.cost?.id,
        update: updateCost,
        retrieve: getSingleCost,
        delete: deleteCost,
      };
    } else if (dataType === "salesByItem") {
      return {
        rows: rowsSalesByItem,
        columns: columnsSalesByItem,
        retrievedID: dataSingleSalesByItem?.salesByItem?.id,
        update: updateSalesByItem,
        retrieve: getSingleSalesByItem,
        delete: deleteSalesByItem,
      };
    } else if (dataType === "salesByCategory") {
      return {
        rows: rowsSalesByCategory,
        columns: columnsSalesByCategory,
        retrievedID: dataSingleSalesByCategory?.salesByCategory?.id,
        update: updateSalesByCategory,
        retrieve: getSingleSalesByCategory,
        delete: deleteSalesByCategory,
      };
    } else {
      // if (dataType === "workingHours")
      return {
        rows: rowsWorkingHours,
        columns: columnsWorkingHours,
        retrievedID: dataSingleWorkingHours?.workingHours?.id,
        update: updateWorkingHours,
        retrieve: getSingleWorkingHours,
        delete: deleteWorkingHours,
      };
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="入力一覧"
          subheader="Input Data"
          action={
            <FormControl>
              <Select
                className={classes.headerAction}
                value={dataType}
                onChange={(e: React.ChangeEvent<any>) => {
                  setDataType(e.target.value);
                }}
              >
                <MenuItem value={"cost"}>支出</MenuItem>
                <MenuItem value={"salesByItem"}>収入（メニュー入力）</MenuItem>
                <MenuItem value={"salesByCategory"}>
                  収入（カテゴリー入力）
                </MenuItem>
                <MenuItem value={"workingHours"}>労働時間</MenuItem>
              </Select>
            </FormControl>
          }
        ></CardHeader>
        <CardContent
          style={{ minHeight: 200, width: "100%", position: "relative" }}
        >
          {
            // columns → rows （wrokingHoursが最後）の順番で作成する
            // つまりすべての columns, rows が完成するまでは、<Loading />を表示する
            // ↓のisLoadingは、refetchQueris用（update/deleteした後に<Loading />が表示される）

            isLoading ? (
              <Loading size="3rem" />
            ) : rowsWorkingHours ? (
              <DataGrid
                autoHeight
                disableSelectionOnClick
                scrollbarSize={30}
                pageSize={10}
                sortModel={[
                  {
                    field: "date",
                    sort: "desc" as GridSortDirection,
                  },
                ]}
                rows={getDataSets(dataType).rows}
                columns={getDataSets(dataType).columns}
              />
            ) : null
          }
        </CardContent>
      </Card>
      <Dialog
        isOpen={isDialogOpen}
        handleClose={handleDialogClose}
        handleDelete={handleDelete}
      >
        {(loadingSingleCost ||
          loadingSingleSalesByCategory ||
          loadingSingleSalesByItem ||
          loadingSingleWorkingHours) && <Loading size={"3rem"} />}
        {dataType === "cost" && dataSingleCost && (
          <CostForm
            initialValues={{
              id: dataSingleCost.cost.id,
              date: dataSingleCost.cost.date,
              item: dataSingleCost.cost.item.id,
              department: dataSingleCost.cost.department.id,
              money: String(dataSingleCost.cost.money),
            }}
            performMutate={performUpdate}
          />
        )}
        {dataType === "salesByItem" && dataSingleSalesByItem && (
          <SalesByItemForm
            initialValues={{
              id: dataSingleSalesByItem.salesByItem.id,
              date: dataSingleSalesByItem.salesByItem.date,
              item: dataSingleSalesByItem.salesByItem.item.id,
              department: dataSingleSalesByItem.salesByItem.department.id,
              num: String(dataSingleSalesByItem.salesByItem.num),
            }}
            performMutate={performUpdate}
          />
        )}
        {dataType === "salesByCategory" && dataSingleSalesByCategory && (
          <SalesByCategoryForm
            initialValues={{
              id: dataSingleSalesByCategory.salesByCategory.id,
              date: dataSingleSalesByCategory.salesByCategory.date,
              category: dataSingleSalesByCategory.salesByCategory.category.id,
              department:
                dataSingleSalesByCategory.salesByCategory.department.id,
              money: String(dataSingleSalesByCategory.salesByCategory.money),
            }}
            performMutate={performUpdate}
          />
        )}
        {dataType === "workingHours" && dataSingleWorkingHours && (
          <WorkingHoursForm
            initialValues={{
              id: dataSingleWorkingHours.workingHours.id,
              date: dataSingleWorkingHours.workingHours.date,
              employee: dataSingleWorkingHours.workingHours.employee.id,
              department:
                dataSingleWorkingHours.workingHours.employee.department.id,
              hours: String(dataSingleWorkingHours.workingHours.hours),
            }}
            performMutate={performUpdate}
          />
        )}
      </Dialog>
    </>
  );
};

export default LatestData;

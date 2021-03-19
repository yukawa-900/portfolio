import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@material-ui/core";
import { useTheme, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import FilterForm from "./FilterForm";
import Aggregation from "./Aggregation";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import EmojiEventsIcon from "@material-ui/icons/EmojiEvents";
import { colors } from "@material-ui/core";
import PieChart from "./PieChart";
import GraphProfitPerHour from "./GraphProfitPerHour";
import { useLazyQuery } from "@apollo/client";
import {
  GET_AGGREGATIONS,
  GET_ALL_AGGREGATIONS_BY_DAY,
  GET_COST_AGGREGATIONS_BY_DAY,
  GET_SALES_BY_CATEGORY_AGGREGATIONS_BY_DAY,
  GET_SALES_BY_ITEM_AGGREGATIONS_BY_DAY,
  GET_INPUT_DATA,
} from "../../operations/queries";
import CircularProgress from "@material-ui/core/CircularProgress";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import SnackBar from "../../components/snackbars/Snackbar";
import LatestData from "./LatestData";
import Ranking from "./Ranking";
import { setState } from "../../amebaSlice";
import { useDispatch } from "react-redux";
import Loading from "../../../auth/Loading";

const useStyles = makeStyles((theme) => ({
  aggregationGridContainer: {
    minHeight: 130,
    [theme.breakpoints.down("lg")]: {},
  },
  aggregationGridItem: {},
}));

const Main = () => {
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));
  const dispatch = useDispatch();

  const [summary, setSummary] = useState({
    sales: "",
    cost: "",
    hours: "",
    profitByHour: "",
  });
  const [
    getAggregations,
    {
      data: dataAggregations,
      loading: loadingAggregations,
      error: errorAggregations,
    },
  ] = useLazyQuery(GET_AGGREGATIONS, {
    fetchPolicy: "cache-and-network",
  });

  const [
    getGeneralAggregationsByDay,
    {
      data: dataGeneralAggregationsByDay,
      loading: loadingGeneralAggregationsByDay,
      error: errorGeneralAggregationsByDay,
    },
  ] = useLazyQuery(GET_ALL_AGGREGATIONS_BY_DAY, {
    fetchPolicy: "cache-and-network",
  });

  const [
    getSalesByItemAggregationsByDay,
    {
      data: dataSalesByItemAggregationsByDay,
      loading: loadingSalesByItemAggregationsByDay,
      error: errorSalesByItemAggregationsByDay,
    },
  ] = useLazyQuery(GET_SALES_BY_ITEM_AGGREGATIONS_BY_DAY, {
    fetchPolicy: "cache-first",
  });

  const [
    getSalesByCategoryAggregationsByDay,
    {
      data: dataSalesByCategoryAggregationsByDay,
      loading: loadingSalesByCategoryAggregationsByDay,
      error: errorSalesByCategoryAggregationsByDay,
    },
  ] = useLazyQuery(GET_SALES_BY_CATEGORY_AGGREGATIONS_BY_DAY, {
    fetchPolicy: "cache-first",
  });

  const [
    getCostAggregationsByDay,
    {
      data: dataCostAggregationsByDay,
      loading: loadingCostAggregationsByDay,
      error: errorCostAggregationsByDay,
    },
  ] = useLazyQuery(GET_COST_AGGREGATIONS_BY_DAY, {
    fetchPolicy: "cache-first",
  });

  const [
    getInputData,
    { data: dataInputData, loading: loadingInputData, error: errorInputData },
  ] = useLazyQuery(GET_INPUT_DATA, {
    fetchPolicy: "cache-and-network",
  });

  const handleSubmit = async (values: any) => {
    try {
      await getAggregations({
        variables: values,
      });

      await getGeneralAggregationsByDay({
        variables: {
          days: 30,
          date: values.dateBefore,
          department: values.department,
        },
      });

      await getInputData({
        variables: values,
      });

      dispatch(setState({ target: "isError", data: false }));
      dispatch(
        setState({
          target: "message",
          data: "正常にデータを取得しました",
        })
      );
    } catch (err) {
      dispatch(setState({ target: "isError", data: true }));
      dispatch(setState({ target: "message", data: "問題が発生しました" }));
    }
  };

  useEffect(() => {
    let sales = 0;
    let cost = 0;
    let hours = 0;
    let profitByHour = 0;

    dataAggregations?.costAggregation.forEach((data: any) => {
      cost += Number(data.money);
    });

    dataAggregations?.salesByCategoryAggregation.forEach((data: any) => {
      sales += Number(data.money);
    });

    dataAggregations?.workingHoursAggregation.forEach((data: any) => {
      hours += Number(data.hours);
    });

    profitByHour = hours ? (sales - cost) / hours : 0;

    const formattedProfitByHour =
      profitByHour >= 0
        ? formatFloatingPointNumber(String(Math.round(profitByHour)), 2, "JPY")
        : "− " +
          formatFloatingPointNumber(
            String(-Math.round(profitByHour)),
            2,
            "JPY"
          );

    setSummary({
      sales: formatFloatingPointNumber(String(Math.round(sales)), 2, "JPY"),
      cost: formatFloatingPointNumber(String(Math.round(cost)), 2, "JPY"),
      hours: String(hours) + " 時間",
      profitByHour: formattedProfitByHour + " /時間",
    });

    console.log(dataAggregations);
  }, [dataAggregations]);

  return (
    <>
      <Grid
        container
        spacing={isXSDown ? 1 : 3}
        justify="center"
        alignItems="flex-start"
      >
        <Grid item xs={12}>
          <FilterForm handleSubmit={handleSubmit} />
        </Grid>

        <Grid item xs={12} style={{ position: "relative" }}>
          {/* {loadingAggregations ? (
            <Loading size={"3rem"} />
          ) : ( */}
          <Grid container spacing={1} justify="center" alignItems="center">
            <Grid item xs={12} md={3}>
              <Aggregation
                title="収入"
                value={summary.sales}
                Icon={AddIcon}
                iconColor={colors.blue[400]}
                loading={loadingAggregations}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Aggregation
                title="支出"
                value={summary.cost}
                Icon={RemoveIcon}
                iconColor={colors.red[400]}
                loading={loadingAggregations}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Aggregation
                title="労働時間"
                value={summary.hours}
                Icon={QueryBuilderIcon}
                iconColor={colors.lightGreen[400]}
                loading={loadingAggregations}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Aggregation
                title="時間当たり付加価値"
                value={summary.profitByHour}
                Icon={EmojiEventsIcon}
                iconColor={colors.amber[400]}
                loading={loadingAggregations}
              />
            </Grid>
          </Grid>
          {/* )} */}
        </Grid>
        <Grid item xs={12} md={6} justify="center">
          <PieChart data={dataAggregations} loading={loadingAggregations} />
        </Grid>
        <Grid item xs={12} md={6} justify="center">
          <Ranking data={dataAggregations} loading={loadingAggregations} />
        </Grid>
        <Grid item xs={12} xl={8}>
          <GraphProfitPerHour
            generalData={dataGeneralAggregationsByDay}
            costData={dataCostAggregationsByDay}
            salesByItemData={dataSalesByItemAggregationsByDay}
            salesByCategoryData={dataSalesByCategoryAggregationsByDay}
            getCostData={getCostAggregationsByDay}
            getSalesByItemData={getSalesByItemAggregationsByDay}
            getSalesByCategoryData={getSalesByCategoryAggregationsByDay}
            isLoading={
              loadingGeneralAggregationsByDay ||
              loadingCostAggregationsByDay ||
              loadingSalesByCategoryAggregationsByDay ||
              loadingSalesByItemAggregationsByDay
            }
          />
        </Grid>
        <Grid item xs={12} style={{ maxWidth: 900 }}>
          <LatestData data={dataInputData} isLoading={loadingInputData} />
        </Grid>
      </Grid>
      <SnackBar autoHideDuration={2000} />
    </>
  );
};

export default Main;

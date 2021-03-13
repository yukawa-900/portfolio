import React, { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@material-ui/core";
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
  GET_PROFIT_PEH_HOUR_BY_DAY,
  GET_INPUT_DATA,
} from "../../operations/queries";
import CircularProgress from "@material-ui/core/CircularProgress";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import SnackBar from "../../components/snackbars/Snackbar";
import LatestData from "./LatestData";
import { setState } from "../../amebaSlice";
import { useDispatch } from "react-redux";

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
    get30DaysProfitPerHour,
    {
      data: data30DaysProfitPerHour,
      loading: loading30DaysProfitPerHour,
      error: error30DaysProfitPerHour,
    },
  ] = useLazyQuery(GET_PROFIT_PEH_HOUR_BY_DAY, {
    fetchPolicy: "cache-and-network",
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

      await get30DaysProfitPerHour({
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
      profitByHour: formattedProfitByHour + " / 時間",
    });

    console.log(dataAggregations);
  }, [dataAggregations]);

  return (
    <>
      <Grid
        container
        spacing={isXSDown ? 1 : 3}
        justify="center"
        alignItems="center"
      >
        <Grid item xs={12}>
          <FilterForm handleSubmit={handleSubmit} />
        </Grid>

        <Grid item xs={12} md={6} xl={12}>
          {/* {loadingAggregation ? (
          <CircularProgress color="secondary" />
        ) : ( */}
          <Grid container spacing={1} justify="center" alignItems="center">
            <Grid item xs={12} xl={3}>
              <Aggregation
                title="収入"
                value={summary.sales}
                Icon={AddIcon}
                iconColor={colors.blue[400]}
              />
            </Grid>
            <Grid item xs={12} xl={3}>
              <Aggregation
                title="支出"
                value={summary.cost}
                Icon={RemoveIcon}
                iconColor={colors.red[400]}
              />
            </Grid>
            <Grid item xs={12} xl={3}>
              <Aggregation
                title="労働時間"
                value={summary.hours}
                Icon={QueryBuilderIcon}
                iconColor={colors.lightGreen[400]}
              />
            </Grid>
            <Grid item xs={12} xl={3}>
              <Aggregation
                title="時間当たり付加価値"
                value={summary.profitByHour}
                Icon={EmojiEventsIcon}
                iconColor={colors.amber[400]}
              />
            </Grid>
          </Grid>
          {/* )} */}
        </Grid>
        <Grid item xs={12} md={6} xl={4} justify="center">
          <PieChart data={dataAggregations} />
        </Grid>
        <Grid item xs={12} xl={8}>
          <GraphProfitPerHour
            data={data30DaysProfitPerHour}
            isLoading={loading30DaysProfitPerHour}
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

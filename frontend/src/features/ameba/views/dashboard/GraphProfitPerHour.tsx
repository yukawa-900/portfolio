import {
  Box,
  Card,
  CardContent,
  CardHeader,
  colors,
  Divider,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import "chartjs-plugin-deferred";
import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { selectIsDarkMode } from "../../../auth/authSlice";
import Loading from "../../../auth/Loading";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";

const useStyles = makeStyles((theme) => ({
  headerAction: {
    margin: theme.spacing(1, 2),
  },
}));

const GraphProfitPerHour = ({ data, isLoading }: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const [graphType, setGraphType] = useState<"bar" | "line">("bar");
  const isDarkMode = useSelector(selectIsDarkMode);

  const profitPerHour30days = data?.profitPerHourByDay;

  const profitPerHour14days = profitPerHour30days?.slice(-14);
  const lastWeekData = profitPerHour14days?.slice(0, 7);
  const thisWeekData = profitPerHour14days?.slice(7, 14);

  const barChartData = {
    datasets: [
      {
        backgroundColor: isDarkMode ? colors.yellow[600] : colors.indigo[500],
        data: thisWeekData?.map((data: any) => data?.profitPerHour),
        label: "This week",
      },
      {
        backgroundColor: isDarkMode ? colors.grey[600] : colors.grey[200],
        data: lastWeekData?.map((data: any) => data?.profitPerHour),
        label: "Last week",
      },
    ],
    labels: thisWeekData?.map((data: any) => data?.date),
  };

  const options = {
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: {
      labels: {
        fontSize: 14,
        fontColor: isDarkMode ? colors.grey[100] : colors.grey[700],
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [
        {
          barThickness: 12,
          maxBarThickness: 10,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          ticks: {
            fontColor: theme.palette.text.secondary,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: theme.palette.text.secondary,
            beginAtZero: true,
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: theme.palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: theme.palette.divider,
          },
        },
      ],
    },
    tooltips: {
      titleFontSize: 14,
      bodyFontSize: 16,
      backgroundColor: isDarkMode ? colors.grey[100] : colors.grey[700],
      bodyFontColor: isDarkMode ? colors.grey[900] : colors.grey[100],
      titleFontColor: isDarkMode ? colors.grey[900] : colors.grey[100],
      borderColor: theme.palette.divider,
      borderWidth: 1,
      mode: "index",
      callbacks: {
        label: (tooltipItem: any, label: any) => {
          return (
            " " +
            formatFloatingPointNumber(
              String(Math.floor(label.datasets[0].data[tooltipItem.index])),
              0,
              "JPY"
            )
          );
        },
      },
    },
    plugins: {
      deferred: {
        enabled: true,
        yOffset: "65%",
        delay: 100,
      },
    },
  };

  const lineChartData = {
    labels: profitPerHour30days?.map((data: any) =>
      data?.date.slice(5).replace("-", "/")
    ),
    datasets: [
      {
        label: "時間当たり付加価値",
        data: profitPerHour30days?.map((data: any) => data?.profitPerHour),
        fill: true,
        backgroundColor: isDarkMode
          ? "rgb(253, 216, 53, 0.2)"
          : "rgb(63, 81, 181, 0.2)", // ↓ を薄くした色
        borderColor: isDarkMode ? "rgb(253, 216, 53)" : "rgb(63, 81, 181)", // colors.indigo[500]と同じ
        lineTension: 0.4,
      },
    ],
  };

  return (
    <Card>
      <CardHeader
        subheader="Bar / Line Chart"
        action={
          <FormControl className={classes.headerAction}>
            <Select
              value={graphType}
              onChange={(e: React.ChangeEvent<any>) => {
                setGraphType(e.target.value);
              }}
            >
              <MenuItem value={"bar"}>7 days</MenuItem>
              <MenuItem value={"line"}>30 days</MenuItem>
            </Select>
          </FormControl>
        }
        title="時間当たり付加価値"
      />
      <Divider />
      <CardContent>
        <Box height={400} position="relative">
          {!data && isLoading && <Loading size="3rem" />}
          {data && graphType === "bar" && (
            <Bar data={barChartData} options={options} />
          )}
          {data && graphType === "line" && (
            <Line data={lineChartData} options={options} />
          )}
        </Box>
      </CardContent>
      <Divider />
      {/* <Box display="flex" justifyContent="flex-end" p={2}>
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          Overview
        </Button>
      </Box> */}
    </Card>
  );
};

export default GraphProfitPerHour;

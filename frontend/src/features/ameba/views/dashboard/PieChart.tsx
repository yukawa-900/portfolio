import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  colors,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import "chartjs-plugin-deferred";
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { selectIsDarkMode } from "../../../auth/authSlice";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import { selectDepartments } from "../../amebaSlice";
import Loading from "../../../auth/Loading";
import { getLabel } from "./utils";
import { chartColors } from "./chartColors";

const useStyles = makeStyles((theme) => ({
  card: {
    height: "100%",
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(2, 1),
    minWidth: 120,
  },
}));

const choices = ["収入", "支出", "労働時間"];

const PieChart = ({ data, loading }: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const isDarkMode = useSelector(selectIsDarkMode);
  const departments = useSelector(selectDepartments);
  const [selected, setSelected] = useState<string>(choices[0]);
  let pieChartColors = chartColors;
  const createChartData = (selected: string) => {
    let dataList = [];
    let labels = [];

    if (selected === "収入") {
      labels = data?.salesByCategoryAggregation.map((sales: any) =>
        getLabel(sales.category.name)
      );

      dataList = data?.salesByCategoryAggregation.map(
        (sales: any) => sales.money
      );
    }

    if (selected === "支出") {
      dataList = data?.costAggregation.map((cost: any) => cost.money);
      labels = data?.costAggregation.map((cost: any) =>
        getLabel(cost?.item?.name)
      );
    }

    if (selected === "労働時間") {
      dataList = data?.workingHoursAggregation.map(
        (workingHours: any) => workingHours.hours
      );
      labels = data?.workingHoursAggregation.map((workingHours: any) =>
        workingHours.position === 0 ? "正社員" : "アルバイト"
      );
    }

    while (pieChartColors.length < labels.length) {
      // labelの数が多いとき、色を重複させて対応する
      pieChartColors = pieChartColors.concat(pieChartColors);
    }

    const chartData = {
      datasets: [
        {
          data: dataList,
          backgroundColor: pieChartColors.slice(0, labels.length),
          borderWidth: 8,
          borderColor: isDarkMode ? colors.grey[800] : colors.common.white,
          hoverBorderColor: isDarkMode ? colors.grey[800] : colors.common.white,
        },
      ],
      labels: labels,
    };

    return chartData;
  };

  const labelCallback =
    selected === "労働時間"
      ? (tooltipItem: any, label: any) => {
          return "  " + label.datasets[0].data[tooltipItem.index] + " 時間";
        }
      : (tooltipItem: any, label: any) => {
          return (
            " " +
            formatFloatingPointNumber(
              label.datasets[0].data[tooltipItem.index],
              0,
              "JPY"
            )
          );
        };

  const options = {
    cutoutPercentage: 85,
    layout: { padding: 0 },
    maintainAspectRatio: false,
    legend: {
      labels: {
        fontSize: 16,
        fontColor: isDarkMode ? colors.grey[100] : colors.grey[700],
      },
    },
    responsive: true,
    tooltips: {
      callbacks: {
        label: labelCallback,
      },
      bodyFontSize: 14,
      bodySpacing: 5,
      backgroundColor: isDarkMode ? colors.grey[100] : colors.grey[700],
      bodyFontColor: isDarkMode ? colors.grey[900] : colors.grey[100],
      borderColor: theme.palette.divider,
      borderWidth: 1,
    },
    plugins: {
      deferred: {
        enabled: true,
        yOffset: "65%",
        delay: 100,
      },
    },
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title="内訳"
        subheader="Pie Chart"
        action={
          <FormControl className={classes.formControl}>
            <Select
              value={selected}
              onChange={(e) => {
                setSelected(String(e.target.value));
              }}
            >
              {choices.map((choice, index) => (
                <MenuItem value={choice} key={index}>
                  {choice}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <Divider />
      <CardContent>
        <Box height={420} position="relative">
          {loading ? (
            <Loading size={"3rem"} />
          ) : (
            data && (
              <Doughnut data={createChartData(selected)} options={options} />
            )
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;

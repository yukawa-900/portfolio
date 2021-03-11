import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
import "chartjs-plugin-deferred";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  colors,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { selectIsDarkMode } from "../../../auth/authSlice";
import { selectDepartments } from "../../amebaSlice";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { string } from "yup";
import SalesByCategory from "../input/forms/SalesByCategoryForm";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";

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

let chartColors = [
  colors.indigo[400],
  colors.red[600],
  colors.orange[600],
  colors.cyan[700],
  colors.purple[600],
  colors.deepOrange[500],
  colors.green[600],
  colors.pink[500],
  colors.amber[700],
  colors.blue[600],
  colors.deepPurple[700],
  colors.lightGreen[600],
  colors.lime[500],
  colors.yellow[600],
  colors.lightBlue[400],
  colors.cyan[600],
  colors.teal[600],
  colors.brown[400],
  colors.blueGrey[400],
];

const choices = ["収入", "支出", "労働時間"];

const PieChart = ({ data }: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const isDarkMode = useSelector(selectIsDarkMode);
  const departments = useSelector(selectDepartments);
  const [selected, setSelected] = useState<string>(choices[0]);

  const createChartData = (selected: string) => {
    let dataList = [];
    let labels = [];

    if (selected === "収入") {
      const itemLabels = data?.salesByItemAggregation.map(
        (sales: any) => sales.item.name
      );
      const categoryLabels = data?.salesByCategoryAggregation.map(
        (sales: any) => sales.category.name
      );

      const itemDataList = data?.salesByItemAggregation.map(
        (sales: any) => sales.money
      );

      const categoryDataList = data?.salesByCategoryAggregation.map(
        (sales: any) => sales.money
      );

      labels = itemLabels.concat(categoryLabels);
      dataList = itemDataList.concat(categoryDataList);
    }

    if (selected === "支出") {
      dataList = data?.costAggregation.map((cost: any) => cost.money);
      labels = data?.costAggregation.map((cost: any) => cost.item.name);
    }

    if (selected === "労働時間") {
      dataList = data?.workingHoursAggregation.map(
        (workingHours: any) => workingHours.hours
      );
      labels = data?.workingHoursAggregation.map((workingHours: any) =>
        workingHours.position === 0 ? "正社員" : "アルバイト"
      );
    }

    while (chartColors.length < labels.length) {
      // labelの数が多いとき、色を重複させて対応する
      chartColors = chartColors.concat(chartColors);
    }

    const chartData = {
      datasets: [
        {
          data: dataList,
          backgroundColor: chartColors.slice(0, labels.length),
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
        <Box height={400} position="relative">
          {data && (
            <Doughnut data={createChartData(selected)} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;

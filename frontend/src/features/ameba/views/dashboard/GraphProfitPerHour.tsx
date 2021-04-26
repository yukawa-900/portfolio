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
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import "chartjs-plugin-deferred";
import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { selectIsDarkMode } from "../../../auth/authSlice";
import Loading from "../../../auth/Loading";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import { fade } from "@material-ui/core/styles/colorManipulator";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Chip from "@material-ui/core/Chip";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import {
  selectSelectedDeptID,
  selectSelectedDate,
  selectSalesCategories,
  selectSalesUnits,
  selectCostItems,
  selectGraphFilterVariables,
  selectIsMonth,
} from "../../amebaSlice";
import { chartColors } from "./chartColors";

const useStyles = makeStyles((theme) => ({
  headerAction: {
    margin: theme.spacing(1, 2),
  },
  formControl: {
    margin: theme.spacing(2, 1),
    minWidth: 120,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  bottomCard: {
    padding: theme.spacing(2, 2, 2, 2),
  },
  formHelpers: {
    marginRight: "auto",
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
}));

type typeGeneralDisplayed =
  | "profitPerHour"
  | "totalCost"
  | "totalSalesMoney"
  | "totalHours";

type typeDataTypeChoices =
  | "general"
  | "salesByItemMoney"
  | "salesByItemNum"
  | "salesByCategory"
  | "cost";

const dataTypeChoices = {
  general: "総合",
  salesByItemMoney: "メニュー(金額)",
  salesByItemNum: "メニュー(個数)",
  salesByCategory: "売上カテゴリー",
  cost: "費用",
};

const generalChoices = {
  profitPerHour: "時間当たり付加価値",
  totalSalesMoney: "売上高",
  totalCost: "費用",
  totalHours: "労働時間",
};

const GraphProfitPerHour = ({
  generalData,
  isLoading,
  costData,
  salesByItemData,
  salesByCategoryData,
  getCostData,
  getSalesByItemData,
  getSalesByCategoryData,
}: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMonth = useSelector(selectIsMonth);
  const selectedDeptID = useSelector(selectSelectedDeptID);
  const selectedDate = useSelector(selectSelectedDate);
  const salesCategories = useSelector(selectSalesCategories);
  const salesUnits = useSelector(selectSalesUnits);
  const costItems = useSelector(selectCostItems);
  const graphFilterVariables = useSelector(selectGraphFilterVariables);
  const [graphType, setGraphType] = useState<"bar" | "line">("bar");
  const [dataType, setDataType] = useState<typeDataTypeChoices>("general");
  const [displayedList, setDisplayedList] = useState<Array<any>>([
    "profitPerHour",
  ]);

  const getData = (newDataType: typeDataTypeChoices) => {
    const arg = {
      variables: {
        department: selectedDeptID,
        delta: isMonth ? 12 : 30,
        date: selectedDate,
        isMonth: isMonth,
      },
    };

    if (newDataType === "cost") {
      getCostData(arg);
    } else if (newDataType === "salesByCategory") {
      getSalesByCategoryData(arg);
    } else if (
      newDataType === "salesByItemMoney" ||
      newDataType === "salesByItemNum"
    ) {
      getSalesByItemData(arg);
    } else {
      console.log("general!");
    }
  };

  const choices = (dataType: typeDataTypeChoices) =>
    dataType === "general"
      ? Object.keys(generalChoices)
      : dataType === "salesByCategory"
      ? salesCategories
      : dataType === "salesByItemMoney" || dataType === "salesByItemNum"
      ? salesUnits
      : dataType === "cost"
      ? costItems
      : [];

  const handleChangeDisplayed = (e: React.ChangeEvent<{ value: unknown }>) => {
    if (graphType === "line") {
      setDisplayedList(e.target.value as Array<typeGeneralDisplayed>);
    } else {
      setDisplayedList([e.target.value as typeGeneralDisplayed]);
    }
  };

  const getNameFromId = (id: string) => {
    return choices(dataType).filter((option: any) => option.node.id === id)[0]
      ?.node?.name;
  };

  const handleChangeDataType = (e: React.ChangeEvent<any>) => {
    const newDataType = e.target.value as typeDataTypeChoices;
    setDataType(newDataType);

    if (newDataType === "general") {
      setDisplayedList(["profitPerHour"]);
    } else {
      console.log(choices(newDataType)[0]);
      setDisplayedList([choices(newDataType)[0]?.node?.id]);
    }

    getData(newDataType);

    if (chartColors.length < choices(newDataType).length) {
      pieChartColors = pieChartColors.concat(chartColors);
    } else {
      pieChartColors = chartColors;
    }
  };
  const isDarkMode = useSelector(selectIsDarkMode);
  let pieChartColors = chartColors;

  const allDatasets =
    dataType === "general"
      ? generalData?.allAggregationsByDay
      : dataType === "cost"
      ? costData?.costAggregationsByDay
      : dataType === "salesByCategory"
      ? salesByCategoryData?.salesByCategoryAggregationsByDay
      : dataType === "salesByItemMoney" || dataType === "salesByItemNum"
      ? salesByItemData?.salesByItemAggregationsByDay
      : null;

  const datasets14days = allDatasets?.slice(-14);
  const lastWeekData = datasets14days?.slice(0, 7);
  const thisWeekData = datasets14days?.slice(7, 14);

  const getChartData = ({
    range,
    displayed,
  }: {
    range: "12months" | "lastWeek" | "thisWeek" | "30days";
    displayed: typeGeneralDisplayed;
  }) => {
    let dataList = [];
    if (range === "thisWeek") {
      dataList = thisWeekData;
    } else if (range === "lastWeek") {
      dataList = lastWeekData;
    } else if (range === "30days") {
      dataList = allDatasets;
    } else if (range === "12months") {
      dataList = allDatasets?.slice(-12);
    }

    if (dataType === "general") {
      return dataList?.map((data: any) => data[displayed]);
    } else {
      let sum_of: "money" | "num";
      let node: "category" | "item";
      if (dataType === "salesByCategory") {
        node = "category";
        sum_of = "money";
      } else if (dataType === "salesByItemMoney") {
        node = "item";
        sum_of = "money";
      } else if (dataType === "salesByItemNum") {
        node = "item";
        sum_of = "num";
      } else if (dataType === "cost") {
        node = "item";
        sum_of = "money";
      }

      return dataList?.map(
        (data: any) =>
          data.aggregation.filter(
            (agg: any) => agg[node].id === displayed
          )[0]?.[sum_of]
      );
    }
  };

  const getLabelInfo = (displayed: string, index = 0) => {
    const colorNum = isDarkMode ? 400 : 600;
    if (dataType === "general") {
      if (displayed === "profitPerHour") {
        return {
          name: "時間当たり採算",
          color: colors.amber[colorNum],
        };
      } else if (displayed === "totalSalesMoney") {
        return {
          name: "売上高",
          color: colors.blue[colorNum],
        };
      } else if (displayed === "totalCost") {
        return {
          name: "費用",
          color: colors.red[colorNum],
        };
      } else if (displayed === "totalHours") {
        return {
          name: "労働時間",
          color: colors.lightGreen[colorNum],
        };
      } else {
        return {
          name: "未分類",
          color: "rgb(253, 216, 53, 0.2)",
        };
      }
    } else {
      return {
        name: getNameFromId(displayed),
        color: pieChartColors[index],
      };
    }
  };

  React.useEffect(() => {
    console.log(choices(dataType));
    console.log(choices(dataType)?.indexOf(displayedList[0]));
  }, []);

  const barChartData = {
    datasets: isMonth
      ? [
          {
            backgroundColor: getLabelInfo(
              displayedList[0],
              dataType === "general" ||
                choices(dataType)
                  .map((d: any) => d.node.id)
                  .indexOf(displayedList[0])
            ).color,
            data: getChartData({
              range: "12months",
              displayed: displayedList[0],
            }),
            label: "12ヶ月",
            barThickness: 12,
            barPercentage: 0.5,
          },
        ]
      : [
          {
            backgroundColor: getLabelInfo(
              displayedList[0],
              dataType === "general" ||
                choices(dataType)
                  .map((d: any) => d.node.id)
                  .indexOf(displayedList[0])
            ).color,
            data: getChartData({
              range: "thisWeek",
              displayed: displayedList[0],
            }),
            label: "This week",
            barThickness: 12,
            barPercentage: 0.5,
          },
          {
            backgroundColor: isDarkMode ? colors.grey[600] : colors.grey[300],
            data: getChartData({
              range: "lastWeek",
              displayed: displayedList[0],
            }),
            label: "Last week",
            barThickness: 12,
            barPercentage: 0.5,
          },
        ],
    labels: isMonth
      ? allDatasets?.map((month: any) => month?.date)
      : thisWeekData?.map((data: any) => data?.date),
  };

  const options = {
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: {
      labels: {
        fontSize: 14,
        fontColor: isDarkMode ? colors.grey[100] : colors.grey[700],
        generateLabels: function (chart: any) {
          return chart.data.datasets.map(function (dataset: any, i: number) {
            return {
              text: dataset.label,
              fillStyle:
                graphType === "bar"
                  ? barChartData.datasets[i].backgroundColor
                  : lineChartData.datasets[i].backgroundColor, // 凡例の色を切り替えるため、ここを変更した
              hidden: !chart.isDatasetVisible(i),
              lineCap: dataset.borderCapStyle,
              lineDash: [],
              lineDashOffset: 0,
              lineJoin: dataset.borderJoinStyle,
              lineWidth: dataset.pointBorderWidth,
              strokeStyle: dataset.borderColor,
              pointStyle: dataset.pointStyle,
              datasetIndex: i,
            };
          });
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            fontColor: theme.palette.text.secondary,
            beginAtZero: true,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            color: isDarkMode ? colors.grey[50] : colors.grey[600],
            borderDash: [2], // 点線にする。間隔1。
            borderDashOffset: 3,
            lineWidth: 0.3,
            zeroLineColor: isDarkMode ? colors.grey[300] : colors.grey[600],
            // zeroLineBorderDash: [2],
            zeroLineWidth: 0.3,
          },
          ticks: {
            fontColor: theme.palette.text.secondary,
            beginAtZero: true,
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
          let base =
            label.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

          if (!base) {
            base = 0;
          }

          if (
            dataType === "general" &&
            ((graphType === "bar" &&
              displayedList.indexOf("totalHours") > -1) ||
              (graphType === "line" &&
                displayedList[tooltipItem.datasetIndex] === "totalHours"))
          ) {
            return " " + String(base) + "時間";
          } else if (dataType === "salesByItemNum") {
            return " " + String(base) + "個";
          } else {
            return (
              " " +
              formatFloatingPointNumber(String(Math.floor(base)), 0, "JPY")
            );
          }
        },
        // ticksの表示を、時間, Money, 個数 で分解できるようにする
        // getLabelに、formatterを登録する
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
    labels: allDatasets?.map((data: any) => {
      // if (data?.date.indexOf("月") > -1) {
      //   return data?.date;
      // }
      return data?.date.slice(5).replace("-", "/");
    }),
    datasets: displayedList.slice(0, 5).map((displayed, index) => {
      const labelInfo = getLabelInfo(displayed, index);
      return {
        label: labelInfo.name,
        data: getChartData({ range: "30days", displayed: displayed }),
        fill: true,
        backgroundColor: fade(labelInfo.color, 0.2),
        borderColor: labelInfo.color,
        lineTension: 0.4,
      };
    }),
  };

  React.useEffect(() => {
    const dataType = graphFilterVariables.dataType;
    const displayed = graphFilterVariables.displayed;
    if (dataType !== "general") {
      getData(dataType);
    }
    setDataType(dataType);
    setDisplayedList([displayed]);
  }, [graphFilterVariables]);

  React.useEffect(() => {
    if (isMonth) {
      setGraphType("bar");
    }
  }, [isMonth]);

  const isError = displayedList.length > 4;

  return (
    <Card id="graph">
      <CardHeader
        subheader="Bar / Line Chart"
        action={
          <FormControl className={classes.formControl}>
            <Select
              value={graphType}
              onChange={(e: React.ChangeEvent<any>) => {
                if (graphType === "line") {
                  setDisplayedList([displayedList[0]]);
                }
                setGraphType(e.target.value);
              }}
            >
              <MenuItem value={"bar"}>
                {isMonth ? "12 months" : "7 days"}
              </MenuItem>
              {!isMonth && <MenuItem value={"line"}>30 days</MenuItem>}
            </Select>
          </FormControl>
        }
        title={
          graphType === "bar"
            ? getLabelInfo(displayedList[0]).name
            : dataTypeChoices[dataType]
        }
      />
      <Divider />
      <CardContent>
        <Box height={400} position="relative">
          {isLoading ? (
            <Loading size="3rem" />
          ) : graphType === "bar" ? (
            <Bar data={barChartData} options={options} />
          ) : (
            graphType === "line" && (
              <Line data={lineChartData} options={options} />
            )
          )}
        </Box>
      </CardContent>
      <Divider />
      <Grid
        container
        justify="flex-end"
        alignItems="flex-end"
        spacing={4}
        className={classes.bottomCard}
      >
        <Grid item className={classes.formHelpers}>
          <FormHelperText>※ グラフ上部の凡例クリックで非表示化</FormHelperText>
          <FormHelperText error={isError}>
            ※ 線グラフは最大4つまで描写可能
          </FormHelperText>
        </Grid>
        <Grid item>
          <FormControl>
            <Select value={dataType} onChange={handleChangeDataType}>
              {Object.keys(dataTypeChoices).map((key) => (
                <MenuItem value={key} key={key}>
                  {dataTypeChoices[key as typeDataTypeChoices]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl error={isError}>
            <Select
              inputProps={{
                id: "select-displayed",
              }}
              value={graphType === "bar" ? displayedList[0] : displayedList}
              multiple={graphType === "line"}
              onChange={handleChangeDisplayed}
              renderValue={(selected: any) => (
                <div className={classes.chips}>
                  {Array.isArray(selected) ? (
                    (selected as Array<any>).map((key) => (
                      <Chip
                        key={key}
                        label={
                          dataType === "general"
                            ? generalChoices[key as typeGeneralDisplayed]
                            : getNameFromId(key)
                        }
                        className={classes.chip}
                      />
                    ))
                  ) : (
                    <Chip
                      label={
                        dataType === "general"
                          ? generalChoices[selected as typeGeneralDisplayed]
                          : getNameFromId(selected)
                      }
                      className={classes.chip}
                    />
                  )}
                </div>
              )}
            >
              {dataType === "general"
                ? Object.keys(generalChoices).map((key) => (
                    <MenuItem key={key} value={key}>
                      <Checkbox
                        checked={
                          displayedList.indexOf(key as typeGeneralDisplayed) >
                          -1
                        }
                      />
                      <ListItemText
                        primary={generalChoices[key as typeGeneralDisplayed]}
                      />
                    </MenuItem>
                  ))
                : choices(dataType).map((option: any) => (
                    <MenuItem key={option.node.id} value={option.node.id}>
                      <Checkbox
                        checked={displayedList.indexOf(option.node.id) > -1}
                      />
                      <ListItemText>{option.node.name}</ListItemText>
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Card>
  );
};

export default GraphProfitPerHour;

import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { selectSelectedDate, selectSelectedDeptID } from "../../amebaSlice";
import Typography from "@material-ui/core/Typography";
import CustomTabs from "../../../bookkeeping/components/utils/CustomTabs";
import CostForm from "./forms/CostForm";
import SalesByNumForm from "./forms/SlaesByNumForm";
import WorkingHoursForm from "./forms/WorkingHoursForm";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";

const labels = [
  { label: "支出", icon: RemoveIcon },
  { label: "収入", icon: AddIcon },
  { label: "労働時間", icon: QueryBuilderIcon },
];
// CustomTabsを使う

const useStyles = makeStyles(() => ({
  title: {
    paddingTop: 60,
  },
}));

const Main = () => {
  const classes = useStyles();
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);
  return (
    <CustomTabs name="ameba-input" labels={labels}>
      <>
        <Typography variant="h4" align="center" className={classes.title}>
          支出
        </Typography>
        <CostForm />
      </>
      <>
        <Typography variant="h4" align="center" className={classes.title}>
          収入
        </Typography>
        <SalesByNumForm />
      </>
      <>
        <Typography variant="h4" align="center" className={classes.title}>
          労働時間
        </Typography>
        <WorkingHoursForm />
      </>
    </CustomTabs>
  );
};

export default Main;

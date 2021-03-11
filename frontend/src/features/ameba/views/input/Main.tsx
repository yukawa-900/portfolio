import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { selectSelectedDate, selectSelectedDeptID } from "../../amebaSlice";
import Typography from "@material-ui/core/Typography";
import CustomTabs from "../../../bookkeeping/components/utils/CustomTabs";
import CostForm from "./forms/CostForm";
import SalesByItemForm from "./forms/SalesByItemForm";
import SalesByCategoryForm from "./forms/SalesByCategoryForm";
import WorkingHoursForm from "./forms/WorkingHoursForm";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import SnackBar from "../../components/snackbars/Snackbar";
import { useMutation } from "@apollo/client";
import {
  CREATE_COST,
  CREATE_SALES_BY_CATEGORY,
  CREATE_SALES_BY_ITEM,
  CREATE_WORKING_HOURS,
} from "../../operations/mutations";

const labels = [
  { label: "収入", icon: AddIcon },
  { label: "支出", icon: RemoveIcon },
  { label: "労働時間", icon: QueryBuilderIcon },
];
// CustomTabsを使う

const useStyles = makeStyles(() => ({
  title: {
    paddingTop: 60,
  },
  titlePaddingBottom: {
    paddingBottom: 38,
  },
  switchContainer: {
    display: "flex",
    justifyContent: "center",
  },
}));

const Main = () => {
  const classes = useStyles();
  const [isSalesByCategory, setIsSalesByCategory] = useState(false);
  const selectedDate = useSelector(selectSelectedDate);
  const selectedDepetID = useSelector(selectSelectedDeptID);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSalesByCategory(event.target.checked);
  };

  const [createCost] = useMutation(CREATE_COST);
  const [createSalesByItem] = useMutation(CREATE_SALES_BY_ITEM);
  const [createSalesByCategory] = useMutation(CREATE_SALES_BY_CATEGORY);
  const [createWorkingHours] = useMutation(CREATE_WORKING_HOURS);

  return (
    <>
      <CustomTabs swipable={false} name="ameba-input" labels={labels}>
        <>
          <Typography
            variant="h4"
            align="center"
            className={classes.title}
            gutterBottom
          >
            収入
          </Typography>
          <div className={classes.switchContainer}>
            <FormControlLabel
              control={
                <Switch checked={isSalesByCategory} onChange={handleChange} />
              }
              label={"カテゴリー入力"}
            />
          </div>
          {isSalesByCategory ? (
            <SalesByCategoryForm performMutate={createSalesByCategory} />
          ) : (
            <SalesByItemForm performMutate={createSalesByItem} />
          )}
        </>
        <>
          <Typography
            variant="h4"
            align="center"
            className={`${classes.title} ${classes.titlePaddingBottom}`}
            gutterBottom
          >
            支出
          </Typography>
          <CostForm performMutate={createCost} />
        </>
        <>
          <Typography
            variant="h4"
            align="center"
            className={`${classes.title} ${classes.titlePaddingBottom}`}
            gutterBottom
          >
            労働時間
          </Typography>
          <WorkingHoursForm performMutate={createWorkingHours} />
        </>
      </CustomTabs>
      <SnackBar autoHideDuration={2500} />
    </>
  );
};

export default Main;

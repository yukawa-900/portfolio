import "date-fns";
import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DateFilter from "../../components/find/DateFilter";
import SlipNumFilter from "../../components/find/SlipNumFilter";
import PDFFilter from "../../components/find/PDFFilter";
import Checkboxes from "../../components/find/Checkboxes";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import {
  filterTransactionGroup,
  selectFilteringParams,
  selectFilteredTransactionGroup,
  selectIsLoading,
} from "../../filteringSlice";
import Table from "../../components/read/BaseTable";
import _ from "lodash";
import CustomLinearProgress from "../../components/utils/CustomLinearProgress";
import { headCells } from "../../components/utils/TransacHeadCells";
import TransacRow from "../../components/utils/TransacRow";
import TransacTableHead from "../../components/utils/TransacTableHead";
import TransacTable from "../../components/utils/TransacTable";

const useStyles = makeStyles((theme) => ({
  dateField: {
    width: 180,
  },
}));

const Find = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const params = useSelector(selectFilteringParams);
  const isLoading = useSelector(selectIsLoading);
  const rows = useSelector(selectFilteredTransactionGroup);

  const [checked, setChecked] = useState({
    date: true,
    dateRange: false,
    slipNum: false,
    pdfName: false,
  });

  const handleClick = () => {
    const sentParams = _.cloneDeep(params);

    type checkedType = typeof checked;

    for (const key of Object.keys(checked) as (keyof checkedType)[]) {
      if (key == "date" && checked[key] == false) {
        sentParams["dateBefore"] = "";
        sentParams["dateAfter"] = "";
      } else if (key == "dateRange" && checked[key] == false) {
        sentParams["dateBefore"] = sentParams["dateAfter"];
      } else if (checked[key] == false) {
        sentParams[key] = "";
      }
    }

    console.log(sentParams);
    dispatch(filterTransactionGroup(sentParams));
  };

  return (
    <Grid
      container
      direction="column"
      style={{ maxWidth: 1000, margin: "0 auto" }}
    >
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        検索する
      </Typography>
      <Grid container>
        <Grid item xs={12} md={5}>
          <Checkboxes checked={checked} setChecked={setChecked} />
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          container
          direction="column"
          spacing={3}
          justify="center"
          alignItems="center"
        >
          <DateFilter isDate={checked.date} isRange={checked.dateRange} />
          <SlipNumFilter isSlipNum={checked.slipNum} />
          <PDFFilter isPDF={checked.pdfName} />
        </Grid>
        <Grid item xs={12} container justify="center">
          <Grid item xs={8} sm={6} md={4}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              style={{ marginTop: 50 }}
              onClick={handleClick}
            >
              検索する
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item container xs={12} style={{ marginTop: 50 }}>
        {isLoading ? (
          <CircularProgress
            color="secondary"
            thickness={2.4}
            style={{ margin: "60px auto" }}
            size={140}
          />
        ) : (
          <TransacTable rows={rows} />
        )}
      </Grid>
    </Grid>
  );
};

export default Find;

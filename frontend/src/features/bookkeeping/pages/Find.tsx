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
import DateFilter from "../find-components/DateFilter";
import SlipNumFilter from "../find-components/SlipNumFilter";
import PDFFilter from "../find-components/PDFFilter";
import Checkboxes from "../find-components/Checkboxes";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  dateField: {
    width: 180,
  },
}));

const Find = () => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(
    new Date("2014-08-18T21:11:54")
  );

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  const [checked, setChecked] = useState({
    date: true,
    dateRange: false,
    slipNum: false,
    pdf: false,
  });

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
          <PDFFilter isPDF={checked.pdf} />
        </Grid>
        <Grid item xs={12} container justify="center">
          <Grid item xs={8} sm={6} md={4}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              style={{ marginTop: 100 }}
            >
              検索する
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Find;

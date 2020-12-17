import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Checkbox from "@material-ui/core/Checkbox";
import { DateRange } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    margin: "30px auto",
  },
}));

type propsType = {
  checked: {
    date: boolean;
    dateRange: boolean;
    slipNum: boolean;
    pdf: boolean;
  };
  setChecked: React.Dispatch<
    React.SetStateAction<{
      date: boolean;
      dateRange: boolean;
      slipNum: boolean;
      pdf: boolean;
    }>
  >;
};

const CheckboxesGroup: React.FC<propsType> = ({ checked, setChecked }) => {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({ ...checked, [event.target.name]: event.target.checked });
  };

  const handleChangeDateRange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setChecked({
        ...checked,
        date: true,
        dateRange: true,
      });
    } else {
      setChecked({ ...checked, dateRange: false });
    }
  };

  const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setChecked({ ...checked, date: true });
    } else {
      setChecked({
        ...checked,
        date: false,
        dateRange: false,
      });
    }
  };

  const { date, dateRange, slipNum, pdf } = checked;

  return (
    <div className={classes.root}>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">検索フィールドを選択</FormLabel>
        <FormGroup>
          <FormGroup row={true}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={date}
                  onChange={handleChangeDate}
                  name="date"
                />
              }
              label="日付から検索"
            />
            <FormControlLabel
              control={
                <Checkbox
                  color="default"
                  size="small"
                  name="dateRange"
                  onChange={handleChangeDateRange}
                  checked={dateRange}
                />
              }
              label={
                <span style={{ fontSize: "1rem", marginTop: "-0.2rem" }}>
                  範囲
                </span>
              }
              labelPlacement="end"
            />
          </FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={slipNum}
                onChange={handleChange}
                name="slipNum"
              />
            }
            label="伝票番号から検索"
          />
          <FormControlLabel
            control={
              <Checkbox checked={pdf} onChange={handleChange} name="pdf" />
            }
            label="PDF名から検索"
          />
        </FormGroup>
        <FormHelperText>複数選択OK</FormHelperText>
      </FormControl>
    </div>
  );
};

export default CheckboxesGroup;

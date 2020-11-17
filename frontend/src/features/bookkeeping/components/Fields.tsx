import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import Popper from "@material-ui/core/Popper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import NoteIcon from "@material-ui/icons/Note";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { PROPS_BOOKKEEPING_FIELD } from "../../types";
import { useSelector, useDispatch } from "react-redux";
import { selectAccountInfo, fetchAccountInfo } from "../bookkeepingSlice";
import { INFO_OBJECT } from "../../types";
import {
  Autocomplete as FormikAutoComplete,
  AutocompleteRenderInputParams,
} from "formik-material-ui-lab";

import InputAdornment from "@material-ui/core/InputAdornment";
import { TextField as FormikTextField } from "formik-material-ui";
import { Rifm } from "rifm";

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
  },
  option: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  optionName: {
    fontSize: 18,
  },
  optionFurigana: {
    fontSize: 6,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 1.6,
  },
  accountInput: {
    "& input": {
      textAlign: "center",
      // Autocomplete ✖️ TextFieldでは、inputPropsが上手く機能しないため、このような書き方になった
      //（inputではなく、divにスタイルが当たってしまう・・）
    },
  },
  memoButton: {
    margin: theme.spacing(0, 0, 0, -1.2),
    width: "2.8rem",
    height: "2.8rem",
  },
  memoIcon: {
    fontSize: "1.4rem",
  },
  memoPopover: {
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
  },
  memoTextArea: {
    width: 300,
  },
}));

const CustomPopper = function (props: any) {
  return <Popper {...props} style={{ width: 500 }} placement="bottom-start" />;
};

const blankMessage = "空欄です";

/*  === Rifmのexampleを流用 === */
const integerAccept = /\d+/g;
const parseInteger = (string: string) =>
  (string.match(integerAccept) || []).join("");

const formatInteger = (string: string) => {
  const parsed = parseInteger(string);
  const number = Number.parseInt(parsed, 10);
  if (Number.isNaN(number)) {
    return "";
  }
  return number.toLocaleString("ja-JP", {
    style: "currency",
    currency: "JPY",
  });
};
/*  === Rifmのexampleを流用 === */

const Fields: React.FC<PROPS_BOOKKEEPING_FIELD> = ({ index }) => {
  const accountInfo = useSelector(selectAccountInfo);
  const dispatch = useDispatch();
  const classes = useStyles();

  const validationSchema = Yup.object().shape({
    account: Yup.string()
      .typeError("正しく入力してください")
      .required(blankMessage),
    money: Yup.string()
      .typeError("正しく入力してください")
      .required(blankMessage)
      .min(1, "正の値を入力してください"),
    memo: Yup.string().max(500, "最大500文字までにしてください"),
  });

  /*  === メモ用Popover === */
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMemoClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMemoClose = () => {
    setAnchorEl(null);
  };
  const isOpen = Boolean(anchorEl);
  /*  === メモ用Popover === */

  return (
    <Formik
      initialValues={{
        account: "", // UUIDが入る。
        money: "",
        memo: "",
      }}
      validationSchema={validationSchema}
      onSubmit={() => {}} // onSubmitが無いと、TypeScriptのエラーになる
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        handleChange,
        handleBlur,
      }) => {
        const isError = (name: "account" | "money") => {
          if (
            // 両方が空白の場合、エラーを出す必要がない！
            errors["account"] == blankMessage &&
            errors["money"] == blankMessage
          ) {
            return false;
          } else {
            return !!touched[name] && !!errors[name];
          }
        };

        return (
          <Grid
            id={String(index)}
            container
            alignItems="flex-start"
            spacing={2}
          >
            <Grid item>
              <Field
                name="autocomplete" // このnameが無いと、コンソール上でエラーが出る模様
                component={FormikAutoComplete}
                PopperComponent={CustomPopper}
                autoHighlight
                groupBy={(option: INFO_OBJECT) => option.categoryName}
                // rederGroup={(option: any) => <div>{option.categoryName}</div>}
                // ↓optionsのリストを、ソートすれば順番を制御できる
                options={accountInfo}
                getOptionLabel={(option: INFO_OBJECT) => option?.name}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                  newValue: INFO_OBJECT
                ) => {
                  setFieldValue("account", newValue?.id);
                  console.log(newValue);
                }}
                style={{ width: 200 }}
                renderOption={(option: INFO_OBJECT) => (
                  <>
                    <Grid
                      container
                      direction="row"
                      justify="space-between"
                      className={classes.option}
                    >
                      <Grid item xs={4}>
                        <Typography
                          variant="h5"
                          component="p"
                          className={classes.optionName}
                          color="primary"
                        >
                          {option.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          className={classes.optionFurigana}
                        >
                          {option.furigana}
                        </Typography>
                      </Grid>
                      <Divider orientation="vertical" flexItem />
                      <Grid item xs={7}>
                        <Typography
                          variant="caption"
                          className={classes.optionDescription}
                        >
                          {option.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                )}
                renderInput={(params: AutocompleteRenderInputParams) => (
                  <TextField
                    name="account"
                    {...params}
                    autoComplete="off"
                    label="勘定科目"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      ...params.InputProps,
                      className: classes.accountInput,
                    }}
                    error={isError("account")}
                    helperText={isError("account") ? errors.account : null}
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Rifm
                format={formatInteger}
                value={values.money}
                onChange={(v) => setFieldValue("money", v)}
              >
                {({ value, onChange }) => (
                  <TextField
                    type="tel"
                    name="money"
                    autoComplete="off"
                    label="金額"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      style: { textAlign: "right" },
                    }}
                    onBlur={handleBlur}
                    onChange={onChange}
                    value={value}
                    error={isError("money")}
                    helperText={isError("money") ? errors.money : null}
                  />
                )}
              </Rifm>
            </Grid>
            <Grid item style={{ alignSelf: "center" }}>
              <IconButton
                className={classes.memoButton}
                onClick={handleMemoClick}
              >
                <NoteIcon
                  color={values.memo === "" ? "disabled" : "primary"}
                  className={classes.memoIcon}
                />
              </IconButton>
            </Grid>
            <Popover
              PaperProps={{ className: classes.memoPopover }}
              open={isOpen}
              anchorEl={anchorEl}
              onClose={handleMemoClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Typography variant="subtitle1" align="center">
                メモを追加
              </Typography>
              <TextField
                name="memo"
                className={classes.memoTextArea}
                multiline
                rows={6}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.memo}
                placeholder={"ここにメモを追加できます"}
                variant="outlined"
              />
            </Popover>
            <Button
              onClick={() => {
                console.log(values);
                console.log(errors);
              }}
            >
              Click
            </Button>
          </Grid>
        );
      }}
    </Formik>
  );
};

export default Fields;

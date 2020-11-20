import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import Button from "@material-ui/core/Button";
import Popper from "@material-ui/core/Popper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import NoteIcon from "@material-ui/icons/Note";
import DeleteIcon from "@material-ui/icons/Delete";
import BlockIcon from "@material-ui/icons/Block";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { PROPS_BOOKKEEPING_FIELD } from "../../types";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAccountInfo,
  selectCreatedTransactions,
  // selectEditedTransactions,
  changeCreatedTransaction,
} from "../bookkeepingSlice";
import { INFO_OBJECT } from "../../types";
import {
  Autocomplete as FormikAutoComplete,
  AutocompleteRenderInputParams,
} from "formik-material-ui-lab";
import Tooltip from "@material-ui/core/Tooltip";

import InputAdornment from "@material-ui/core/InputAdornment";
import { TextField as FormikTextField } from "formik-material-ui";
import { Rifm } from "rifm";
import { ContactsOutlined } from "@material-ui/icons";
import { SelectField } from "material-ui";

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
    position: "relative",
    width: 340,
    padding: theme.spacing(1, 2, 1.4, 2),
    borderRadius: theme.spacing(1),
  },
  memoTextArea: {
    width: 300,
  },
  memoDeleteButton: {
    position: "absolute",
    bottom: 5,
    right: 26,
    width: 30,
    height: 30,
    "&:hover": {
      color: theme.palette.error.light,
    },
  },
  memoDeleteIcon: {
    fontSize: 20,
  },
}));

const CustomPopper = (props: any) => {
  return <Popper {...props} style={{ width: 500 }} placement="bottom-start" />;
};

const blankMessage = "空欄です";

/* === 勘定科目リストを、漢字・ひらがな両方で検索できるようにする === */

const getOptionLabel = (option: INFO_OBJECT) => option?.name;

// 「ひらがなのみ」にマッチするパターン
function isHiragana(str: string) {
  str = str == null ? "" : str;
  if (str.match(/^[ぁ-んー]+$/)) {
    return true;
  } else {
    return false;
  }
}
/* ======================================================== */

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

const Fields: React.FC<PROPS_BOOKKEEPING_FIELD> = ({ index, role }) => {
  const accountInfo = useSelector(selectAccountInfo);
  const createdTransactions = useSelector(selectCreatedTransactions);
  // const editedTransactions = useSelector(selectEditedTransactions);
  const dispatch = useDispatch();
  const classes = useStyles();
  const [inputValue, setInputValue] = useState("");
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
  const isMemoOpen = Boolean(anchorEl);
  /*  === メモ用Popover === */

  const handleChange = (params: {
    target: "account" | "money" | "memo";
    value: string;
  }): void => {
    if (role === "create") {
      const data = {
        index: String(index),
        target: params.target,
        [params.target]: params.value,
      };
      console.log(data);
      dispatch(changeCreatedTransaction(data));
    }
  };

  return (
    <Formik
      initialValues={{
        account: "8057b013-d83a-4d69-8ce9-ef4b0cc2cc07", // UUID
        money: "",
        memo: "", // string

        // サンプル
        // account: "8057b013-d83a-4d69-8ce9-ef4b0cc2cc07"
        // memo: "これはメモです"
        // money: "￥342,341"
      }}
      validationSchema={validationSchema}
      onSubmit={() => {}} // onSubmitが無いと、TypeScriptのエラーになる
    >
      {({ values, errors, touched, setFieldValue, handleBlur }) => {
        const isError = (name: "account" | "money") => {
          if (
            // 両方が空白の場合、エラーを出す必要がない！
            errors["account"] == blankMessage &&
            errors["money"] == blankMessage
            // UXの観点から、メモの空欄ではエラーを出さないことにした
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
            item
            xs={6}
            alignItems="flex-start"
            spacing={2}
          >
            <Grid item>
              <Field
                name="autocomplete" // このnameが無いと、コンソール上でエラーが出る模様
                component={FormikAutoComplete}
                PopperComponent={CustomPopper}
                autoHighlight
                autoSelect
                groupBy={(option: INFO_OBJECT) => option.categoryName}
                options={accountInfo}
                getOptionLabel={getOptionLabel}
                filterOptions={(options: any, state: any) => {
                  const inputValue = state.inputValue;
                  if (isHiragana(inputValue)) {
                    const resultOptions = options.filter((option: any) =>
                      option?.furigana.includes(inputValue)
                    );
                    return resultOptions;
                  } else {
                    const resultOptions = options.filter((option: any) =>
                      option?.name.includes(inputValue)
                    );
                    return resultOptions;
                  }
                }}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                  newValue: INFO_OBJECT
                ) => {
                  setFieldValue("account", newValue?.id);
                  handleChange({
                    target: "account",
                    value: newValue?.id,
                  });
                  console.log(values.account);
                }}
                inputValue={inputValue}
                onInputChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                  newInputValue: any
                ) => {
                  // UX向上用。ユーザーが誤って空白文字を入力することを想定している
                  setInputValue(String(newInputValue).trim());
                }}
                style={{ width: 200 }}
                renderOption={(option: INFO_OBJECT) => {
                  return (
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
                  );
                }}
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
                    onBlur={handleBlur}
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
                onChange={(v) => {
                  setFieldValue("money", v);
                  // handleChange({ target: "money", value: values.money });
                }}
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
                    onBlur={(event) => {
                      handleBlur(event);
                      handleChange({ target: "money", value: values.money });
                    }}
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
                aria-label="open memo"
                tabIndex={-1}
              >
                <NoteIcon
                  color={
                    values.memo === ""
                      ? "disabled"
                      : Boolean(errors["memo"])
                      ? "error"
                      : "primary"
                  }
                  className={classes.memoIcon}
                />
              </IconButton>
            </Grid>
            <Popover
              // findDOMNode is deprecated in StrictMode.というWraningが出るが、
              // Material-UI側の問題？らしい。Drawer等でもWraningが出る模様。
              PaperProps={{ className: classes.memoPopover }}
              open={isMemoOpen}
              anchorEl={anchorEl}
              onClose={handleMemoClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: 220,
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
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue("memo", event.target.value);
                }}
                onBlur={(event) => {
                  handleBlur(event);
                  handleChange({ target: "memo", value: values.memo });
                }}
                value={values.memo}
                placeholder={"ここにメモを追加できます"}
                variant="outlined"
                error={Boolean(errors["memo"])} // 500文字を超えるとエラー
                helperText={"最大500文字です"}
              />
              <Tooltip title="メモを消去する" placement="left-end">
                <IconButton
                  aria-label="delete memo"
                  className={classes.memoDeleteButton}
                  onClick={() => {
                    setFieldValue("memo", "");
                    handleChange({ target: "memo", value: "" });
                  }}
                >
                  <BlockIcon
                    className={classes.memoDeleteIcon}
                    color="inherit"
                  />
                </IconButton>
              </Tooltip>
            </Popover>
          </Grid>
        );
      }}
    </Formik>
  );
};

export default Fields;

import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Popper from "@material-ui/core/Popper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import { Field } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { selectAccounts } from "../../activeListSlice";
import { selectActiveAccounts } from "../../settingsSlice";
import { ACCOUNT_OBJECT } from "../../../types";
import {
  Autocomplete as FormikAutoComplete,
  AutocompleteRenderInputParams,
} from "formik-material-ui-lab";
import { values } from "lodash";

const useStyles = makeStyles((theme) => ({
  option: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  optionName: {
    fontSize: 18,
    color: theme.palette.primary.light,
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
}));

const CustomPopper = (props: any) => {
  return <Popper {...props} style={{ width: 500 }} placement="bottom-start" />;
};

/* === 勘定科目リストを、漢字・ひらがな両方で検索できるようにする === */

const getOptionLabel = (option: ACCOUNT_OBJECT) => option?.name;

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

const AccountField: React.FC<any> = ({
  //   initialAccountName,
  values,
  errors,
  isError,
  initialAccount,
  initialAccountName,
  setFieldValue,
  handleChange,
  handleBlur,
}) => {
  const classes = useStyles();
  const accountInfo = useSelector(selectActiveAccounts);
  // const [value, setValue] = useState(initialAccountName); //初期値: initialValues.initialAccountName これはStoreに入れてもいいね
  const [inputValue, setInputValue] = useState(initialAccountName); // 初期値:initialValues.initialAccountName
  return (
    <Field
      name="autocomplete" // このnameが無いと、コンソール上でエラーが出る模様
      component={FormikAutoComplete}
      PopperComponent={CustomPopper}
      autoHighlight
      groupBy={(option: ACCOUNT_OBJECT) => option.categoryName}
      options={accountInfo}
      // getOptionLabel={(option: ACCOUNT_OBJECT) => option.name}
      getOpetionLabel={values.account}
      filterOptions={(options: ACCOUNT_OBJECT[], state: any) => {
        const inputValue = state.inputValue;
        if (isHiragana(inputValue)) {
          const resultOptions = options.filter((option: ACCOUNT_OBJECT) =>
            option?.furigana.includes(inputValue)
          );
          return resultOptions;
        } else {
          const resultOptions = options.filter((option: ACCOUNT_OBJECT) =>
            option?.name.includes(inputValue)
          );
          return resultOptions;
        }
      }}
      value={values.account}
      onChange={(
        event: React.ChangeEvent<HTMLInputElement>,
        newValue: ACCOUNT_OBJECT
      ) => {
        setFieldValue("account", newValue?.name);
        handleChange({
          target: "account",
          value: newValue?.id, // storeに保存するのは、id
        });
        handleChange({
          target: "accountName",
          value: newValue?.name, // storeに保存するのは、id
        });
        // setValue(newValue?.name);
      }}
      inputValue={inputValue}
      onInputChange={(
        event: React.ChangeEvent<HTMLInputElement>,
        newInputValue: any
      ) => {
        // UX向上用。ユーザーが誤って空白文字を入力することを想定している
        setInputValue(String(newInputValue).trim()); // String(newInputValue).trim()
      }}
      style={{ width: 190 }}
      renderOption={(option: ACCOUNT_OBJECT) => {
        return (
          <Grid
            container
            direction="row"
            justify="space-between"
            className={classes.option}
            key={option.id}
          >
            <Grid item xs={4}>
              <Typography
                variant="h5"
                component="p"
                className={classes.optionName}
              >
                {option.name}
              </Typography>
              <Typography variant="caption" className={classes.optionFurigana}>
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
          // InputLabelProps={{
          //   shrink: true,
          // }}
          InputProps={{
            ...params.InputProps,
            className: classes.accountInput,
          }}
          onBlur={handleBlur}
          // error={isError("account")}
          // helperText={isError("account") ? errors.account : null}
        />
      )}
    />
  );
};

export default AccountField;

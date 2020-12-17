import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Formik } from "formik";
import * as Yup from "yup";
import { PROPS_BOOKKEEPING_FIELD } from "../../types";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTransactionGroup,
  selectTransactions,
  // selectEditedTransactions,
  changeTransactions,
  deleteTransaction,
  insertTransaction,
  selectCurrency,
} from "../bookkeepingSlice";
import AccountField from "./AccountField";
import MoneyField from "./MoneyField";
import MemoField from "./MemoField";
import DebitCreditField from "./DebitCreditField";
import TaxField from "./TaxField";
import ReadOnlyMoneyField from "./ReadOnlyMoneyField";
import IconButton from "@material-ui/core/IconButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { HighlightTwoTone } from "@material-ui/icons";
import classes from "*.module.sass";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
  iconButton: {
    color: theme.palette.text.secondary,
  },
  endInsertButton: {
    visibility: "hidden",
  },
}));

const blankMessage = "空欄です";

const Fields: React.FC<any> = ({
  transac,
  role,
  // handleDelete,
  // handleInsert,
}) => {
  const createdTransactions = useSelector(selectTransactionGroup);
  const currency = useSelector(selectCurrency);
  const transactions = useSelector(selectTransactions);
  const dispatch = useDispatch();
  const classes = useStyles();

  const isEnd = transactions.slice(-1)[0].order == transac.order;

  const yupObject = Yup.string()
    .typeError("正しく入力してください")
    .required(blankMessage);

  const validationSchema = Yup.object().shape({
    // debitCreditを入れる。 memoを無くす
    account: yupObject,
    money: yupObject,
    // memo: Yup.string().max(500, "最大500文字までにしてください"),
    debitCredit: yupObject,
  });

  const handleChange = (params: {
    target: "account" | "money" | "debitCredit" | "tax";
    value: string;
  }): void => {
    const data = {
      id: transac.id,
      [params.target]: params.value,
    };
    dispatch(changeTransactions(data));
  };

  const handleInsert = () => {
    dispatch(insertTransaction({ id: transac.id }));
  };

  const handleDelete = () => {
    dispatch(deleteTransaction({ id: transac.id }));
  };

  return (
    <Formik
      initialValues={{
        account: transac.accountName, // UUID
        money: transac.money,
        debitCredit: transac.debitCredit,
        tax: transac.tax,
        // サンプル
        // account: "8057b013-d83a-4d69-8ce9-ef4b0cc2cc07"
        // memo: "これはメモです"
        // money: "￥342,341"
      }}
      validationSchema={validationSchema}
      onSubmit={() => {}} // onSubmitが無いと、TypeScriptのエラーになる
    >
      {({ values, errors, touched, setFieldValue, handleBlur }) => {
        const isError = (name: "account" | "money" | "debitCredit") => {
          if (
            // 両方が空白の場合、エラーを出す必要がない！
            errors["account"] == blankMessage &&
            errors["money"] == blankMessage &&
            errors["debitCredit"] == blankMessage
          ) {
            return false;
          } else {
            console.log(name);
            console.log(touched[name]);
            console.log(errors[name]);
            return touched[name] && errors[name];
          }
        };

        return (
          <>
            <Grid
              id={transac.id}
              container
              item
              xs={12}
              justify="center"
              alignItems="center"
              spacing={2}
            >
              <Grid
                item
                style={{
                  alignSelf: "flex-end",
                  padding: 0,
                  marginBottom: -24,
                  marginRight: 6,
                }}
              >
                <IconButton
                  // className={classes.deleteIcon}
                  onClick={handleInsert}
                  tabIndex={-1}
                  className={
                    isEnd ? classes.endInsertButton : classes.iconButton
                  }
                >
                  <NavigateNextIcon />
                </IconButton>
              </Grid>

              <Grid item>
                <DebitCreditField
                  handleChange={handleChange}
                  values={values}
                  setFieldValue={setFieldValue}
                  errors={errors}
                />
              </Grid>
              <Grid item>
                <AccountField
                  errors={errors}
                  isError={isError}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Grid>
              <Grid item>
                <MoneyField
                  errors={errors}
                  isError={isError}
                  values={values}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Grid>
              {currency != "JPY" ? (
                <Grid item>
                  <ReadOnlyMoneyField money={transac.money} />
                </Grid>
              ) : null}
              <Grid item>
                <TaxField
                  handleChange={handleChange}
                  values={values}
                  setFieldValue={setFieldValue}
                />
              </Grid>
              <Grid item>
                <IconButton
                  className={classes.iconButton}
                  onClick={handleDelete}
                  tabIndex={-1}
                >
                  <HighlightOffIcon />
                </IconButton>
              </Grid>
            </Grid>
          </>
        );
      }}
    </Formik>
  );
};

export default Fields;

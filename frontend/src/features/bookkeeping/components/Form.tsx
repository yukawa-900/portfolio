import React, { ReactNode, useState, useEffect, useRef } from "react";
import Field from "./Fields";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import CustomDatePicker from "./DatePicker";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import { PROPS_FORM, POST_TRANSACTON } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import {
  postTransactions,
  getTransactions,
  selectCreatedTransactions,
  selectEditedTransactions,
  selectEditedDate,
} from "../bookkeepingSlice";
import { AccountBalance } from "@material-ui/icons";
import _, { initial } from "lodash";

const useStyles = makeStyles((theme) => ({
  list: {
    margin: theme.spacing(4, 0, 1, 0),
  },
  submit: {
    margin: theme.spacing(4, 0, 1, 0),
    width: 400,
  },
  expand: {
    // width: 50,
    // height: 50,
  },
}));

const isError = (data: { [key: string]: string }) => {
  if (!data.account || !data.money) {
    return true;
  } else {
    return false;
  }
};

const Form: React.FC<PROPS_FORM> = ({ role }) => {
  // const [date, setDate] = useState(initialDate);
  const dispatch = useDispatch();
  const createdData = useSelector(selectCreatedTransactions);
  const editedData = useSelector(selectEditedTransactions);
  console.log(editedData);
  const date = useSelector(selectEditedDate);
  const classes = useStyles();
  const [list, setList] = useState<number[]>([...Array(12)].map((_, i) => i));

  const handleExpand = () => {
    const numbers = [...Array(6)].map((_, i) => i + list.length);
    setList((prev) => [...prev, ...numbers]);
  };

  useEffect(() => {
    if (role === "edit") {
      dispatch(getTransactions(date));
    }
  }, [date]);

  const handleSubmit = () => {
    let postDebitData: POST_TRANSACTON[] = [];
    let postCreditData: POST_TRANSACTON[] = [];

    // 送信するデータの作成
    for (let index in createdData.items) {
      const order = Math.floor(Number(index) / 2);
      const debitCredit = Number(index) % 2;
      console.log(createdData.items[index].money.replace(/,/g, ""));
      const numMoney = Number(
        createdData.items[index].money.replace(/,/g, "").replace(/￥/g, "")
      );
      console.log(numMoney);
      if (!isError(createdData.items[index])) {
        const d: POST_TRANSACTON = {
          order: order,
          debitCredit: debitCredit,
          date: createdData.date,
          account: createdData.items[index].account,
          money: numMoney,
          memo: createdData.items[index].memo,
        };

        if (debitCredit === 0) {
          postDebitData.push(d);
        } else {
          postCreditData.push(d);
        }
      }
    }

    //並び替え
    _.orderBy(postDebitData, "order");
    _.orderBy(postCreditData, "order");

    // orderを再割り当て（ユーザーが空白を作っている場合への対応）
    let i = 0;
    while (i < postDebitData.length) {
      postDebitData[i].order = i++;
    }

    let j = 0;
    while (j < postCreditData.length) {
      postCreditData[j].order = j++;
    }

    //借方・貸方の配列を結合
    const postData: POST_TRANSACTON[] = postDebitData.concat(postCreditData);
    console.log(postData);
    dispatch(postTransactions(postData));
  };

  return (
    <form autoComplete="off">
      <CustomDatePicker role={role} />
      <Grid
        container
        spacing={2}
        justify="center"
        className={classes.list}
        style={{ maxWidth: 1060, margin: "30px auto" }}
      >
        {role === "create"
          ? list.map((i) => (
              <Field
                index={i}
                key={i}
                role={role}
                initialValues={{
                  account: "", // UUID
                  initialAccountName: "",
                  money: "",
                  memo: "", // string
                }}
              />
            ))
          : role === "edit"
          ? Object.keys(editedData.items).map((key) => (
              <Field
                index={Number(key)}
                key={key}
                role={role}
                initialValues={editedData.items[key]}
              />
            ))
          : null}
      </Grid>
      <Grid container justify="center" direction="column" alignItems="center">
        <Grid item>
          <IconButton className={classes.expand} onClick={handleExpand}>
            <ExpandMoreIcon style={{ fontSize: 60 }} color="disabled" />
          </IconButton>
        </Grid>
        <Button
          className={classes.submit}
          variant="contained"
          color="secondary"
          startIcon={<CloudUploadIcon />}
          onClick={handleSubmit}
        >
          Upload
        </Button>
      </Grid>
    </form>
  );
};

export default Form;

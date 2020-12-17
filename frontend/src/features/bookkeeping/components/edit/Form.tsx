import React, { ReactNode, useState, useEffect, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import CustomDatePicker from "./DatePicker";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import TypoGraphy from "@material-ui/core/Typography";
import CustomLinearProgress from "../utils/CustomLinearProgress";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import {
  PROPS_FORM,
  POST_TRANSACTON,
  TRANSACTION_OBJECT,
} from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import {
  closeMessage,
  getSlipNum,
  postTransactionGroup,
  deleteTransaction,
  insertTransaction,
  getTransactions,
  selectStatus,
  selectSlipNum,
  expandTransactions,
  selectTransactionGroup,
  selectTransactions,
  changeTransactions,
  changeTransactionGroup,
  initializeTransactionGroup,
  postPDF,
  // selectEditedTransactions,
  // selectEditedDate,
} from "../../bookkeepingSlice";
import { AccountBalance } from "@material-ui/icons";
import _, { initial, random } from "lodash";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Alert from "@material-ui/lab/Alert";
import Transaction from "./Transaction";
import MemoField from "./MemoField";
import PDFField from "./PDFField";
import DepartmentField from "./DepartmentField";
import CurrencyField from "./CurrencyField";

const useStyles = makeStyles((theme) => ({
  messageBox: {
    width: "50%",
    margin: "10px auto",
    [theme.breakpoints.down("sm")]: {
      width: "80%",
    },
  },
  formContainer: {
    marginTop: 10,
    width: "100%",
  },
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
  extraInfo: {
    maxWidth: 200,
  },
}));

const Form: React.FC<PROPS_FORM> = ({ role }) => {
  const slipNum = useSelector(selectSlipNum);
  const dispatch = useDispatch();
  const transactionGroup = useSelector(selectTransactionGroup);
  const transactions = useSelector(selectTransactions);
  const status = useSelector(selectStatus);
  const classes = useStyles();
  const [PDF, setPDF] = useState<File | null>(null);

  const transaction = (transac: TRANSACTION_OBJECT) => {
    return <Transaction key={transac.id} transac={transac} role={role} />;
  };

  const handleExpand = () => {
    dispatch(expandTransactions({ expandNum: 2 }));
  };

  // const handleSubmitPDF = () => {
  //   console.log(transactionGroup.idz)
  //   dispatch(postPDF({ id: transactionGroup.id, pdf: PDF }));
  // };

  const handleSubmit = async () => {
    const postData = _.cloneDeep(transactionGroup);
    const transacLength = transactions.length;
    for (let i = 0; i < transacLength; i++) {
      // orderを順番につけかえ
      postData.transactions[i].order = i;
    }
    if (postData.currency == "JPY") {
      postData.currency = null;
    }

    // const pdf = postData.pdf; // pdf を退避
    // postData.pdf = null;

    const res = await dispatch(
      postTransactionGroup({ postData: postData, pdf: PDF })
    );

    // pdfアップロード
    // await handleSubmitPDF();

    // 初期化
    // await dispatch(initializeTransactionGroup());
  };

  return (
    <form autoComplete="off">
      <CustomDatePicker role={role} />
      {status.message ? (
        <Collapse in={status.messageOpen}>
          <Alert
            variant="outlined"
            severity={status.isError ? "error" : "success"}
            className={classes.messageBox}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  dispatch(closeMessage());
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {status.message}
          </Alert>
        </Collapse>
      ) : null}
      <Grid
        container
        justify="center"
        alignItems="center"
        spacing={10}
        className={classes.formContainer}
      >
        <Grid item>
          <TypoGraphy variant="h5" component="p">
            伝票番号: {slipNum}
          </TypoGraphy>
        </Grid>
        <Grid item>
          <CurrencyField />
        </Grid>
      </Grid>
      <Grid container spacing={2} justify="center" className={classes.list}>
        {transactions?.map((transac: TRANSACTION_OBJECT) =>
          transaction(transac)
        )}
      </Grid>
      <Grid container justify="center" direction="column" alignItems="center">
        <Grid item>
          <IconButton className={classes.expand} onClick={handleExpand}>
            <ExpandMoreIcon style={{ fontSize: 50 }} color="disabled" />
          </IconButton>
        </Grid>
        <Grid container justify="center" spacing={3} style={{ marginTop: 30 }}>
          <Grid
            container
            item
            xs
            className={classes.extraInfo}
            direction="column"
          >
            <DepartmentField />
          </Grid>

          <MemoField />
          <PDFField PDF={PDF} setPDF={setPDF} />
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
        {status.isLoading ? <CustomLinearProgress /> : null}
      </Grid>
    </form>
  );
};

export default Form;

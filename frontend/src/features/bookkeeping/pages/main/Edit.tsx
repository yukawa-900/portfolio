import React, { useEffect } from "react";
import Alert from "@material-ui/lab/Alert";
import { useDispatch, useSelector } from "react-redux";
import Form from "../../components/edit/Form";
import Table from "../../components/read/BaseTable";
import Button from "@material-ui/core/Button";
import {
  selectIsLoading,
  selectEditableTransactionGroup,
  fetchEditableTransactionGroup,
} from "../../filteringSlice";
import TransacTable from "../../components/utils/TransacTable";

const Edit = () => {
  // ✖️ storeから取り出し、Formに渡す
  // ○FormにEditかAddかを伝え、Form側で振り分ける
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const rows = useSelector(selectEditableTransactionGroup);

  useEffect(() => {
    dispatch(fetchEditableTransactionGroup());
  }, []);

  return (
    <div>
      <Alert severity="info" variant="outlined" style={{ marginBottom: 50 }}>
        編集できるのは、今日入力した取引だけです
      </Alert>

      {!isLoading ? <TransacTable rows={rows} /> : null}
      <Button
        color="secondary"
        variant="contained"
        size="large"
        style={{ display: "block", margin: "40px auto" }}
        onClick={() => dispatch(fetchEditableTransactionGroup())}
      >
        更新する
      </Button>
    </div>
  );
};

export default Edit;

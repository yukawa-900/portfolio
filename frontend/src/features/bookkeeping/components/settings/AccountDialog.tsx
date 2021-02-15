import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  retrieveItem,
  selectIsEdit,
  selectIsDialogOpen,
  selectAccount,
  selectAccountCategories,
  updateSettingsItem,
  createSettingsItem,
  handleDialogOpen,
  deleteSettingsItem,
} from "../../settingsSlice";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { ACCOUNT_CATEGORY_OBJECT } from "../../../types";

const useStyles = makeStyles((theme) => ({
  deleteButton: {
    color: theme.palette.error.main,
  },
}));
export default function AccountDialog(props: any) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const isDialogOpen: boolean = useSelector(selectIsDialogOpen);
  const initialValues = useSelector(selectAccount);
  const accountCategories = useSelector(selectAccountCategories);
  const isEdit = useSelector(selectIsEdit);

  const yupObject = Yup.string().typeError("正しく入力してください");

  const validationSchema = Yup.object().shape({
    name: yupObject,
    furigana: yupObject,
    code: yupObject,
    category: yupObject,
    description: yupObject,
  });

  const handleDialogClose = () => dispatch(handleDialogOpen(false));

  return (
    <div>
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isEdit) {
              dispatch(
                updateSettingsItem({
                  id: initialValues.id,
                  role: "accounts",
                  sentData: values,
                })
              );
            } else {
              dispatch(
                createSettingsItem({
                  role: "accounts",
                  sentData: values,
                })
              );
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => {
            return (
              <form onSubmit={handleSubmit}>
                <DialogTitle id="form-dialog-title">編集</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    id="name"
                    label="名前"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={values.name}
                    onChange={handleChange}
                  />
                  <TextField
                    autoFocus
                    id="furigana"
                    label="ふりがな"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={values.furigana}
                    onChange={handleChange}
                  />
                  <TextField
                    autoFocus
                    id="code"
                    label="科目コード"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={values.code}
                    onChange={handleChange}
                  />
                  <TextField
                    autoFocus
                    id="category"
                    label="カテゴリー"
                    type="text"
                    fullWidth
                    select
                    variant="outlined"
                    value={values.category}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue("category", event.target.value);
                      handleChange({
                        target: "category",
                        value: event.target.value, // storeに保存するのは、id
                      });
                    }}
                  >
                    {accountCategories.map(
                      (option: ACCOUNT_CATEGORY_OBJECT) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                  <TextField
                    autoFocus
                    id="description"
                    label="説明"
                    type="text"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                  />
                </DialogContent>
                <DialogActions>
                  <Grid container justify="space-around">
                    {isEdit ? (
                      <Grid item>
                        <Button
                          onClick={() => {
                            handleDialogClose();
                            dispatch(
                              deleteSettingsItem({
                                role: "accounts",
                                id: initialValues.id,
                              })
                            );
                          }}
                          className={classes.deleteButton}
                        >
                          消去する
                        </Button>
                      </Grid>
                    ) : null}

                    <Grid item>
                      <Button
                        type="submit"
                        onClick={handleDialogClose}
                        color="primary"
                      >
                        送信する
                      </Button>
                    </Grid>
                  </Grid>
                </DialogActions>
              </form>
            );
          }}
        </Formik>
      </Dialog>
    </div>
  );
}

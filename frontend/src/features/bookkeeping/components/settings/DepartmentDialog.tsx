import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  retrieveItem,
  selectIsDialogOpen,
  selectIsEdit,
  selectDepartment,
  updateSettingsItem,
  deleteSettingsItem,
  handleDialogOpen,
  createSettingsItem,
} from "../../settingsSlice";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";

const useStyles = makeStyles((theme) => ({
  deleteButton: {
    color: theme.palette.error.main,
  },
}));

export default function DepartmentDialog(props: any) {
  const dispatch = useDispatch();

  const classes = useStyles();

  const isDialogOpen: boolean = useSelector(selectIsDialogOpen);
  const isEdit = useSelector(selectIsEdit);
  const initialValues = useSelector(selectDepartment);

  const yupObject = Yup.string().typeError("正しく入力してください");

  const validationSchema = Yup.object().shape({
    name: yupObject,
    code: yupObject,
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
                  role: "departments",
                  sentData: values,
                })
              );
            } else {
              dispatch(
                createSettingsItem({
                  role: "departments",
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
                    id="code"
                    label="部門コード"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={values.code}
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
                                role: "departments",
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

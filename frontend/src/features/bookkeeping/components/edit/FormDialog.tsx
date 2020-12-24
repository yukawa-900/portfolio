import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Form from "./Form";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  title: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  content: {
    padding: theme.spacing(3, 1, 4, 1),
  },
}));

export default function FormDialog({ open, handleDialogClose }: any) {
  const classes = useStyles();

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" className={classes.title}>
          <Typography variant="h5" component="p">
            Edit
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <Form role={"edit"} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

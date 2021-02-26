import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import { useSelector, useDispatch } from "react-redux";
import { selectIsError, selectMessage, setState } from "../../../amebaSlice";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  close: {
    padding: theme.spacing(0.5),
  },
}));

type messageInfoType = {
  message: String;
  key: number;
};

export default function ConsecutiveSnackbars() {
  const dispatch = useDispatch();
  const message = useSelector(selectMessage);
  const isError = useSelector(selectIsError);
  // snackPackの中身 [{ message, key: new Date().getTime() }]
  const [snackPack, setSnackPack] = React.useState<messageInfoType[]>([]);
  const [open, setOpen] = React.useState(false);
  const [messageInfo, setMessageInfo] = React.useState<messageInfoType>();

  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  useEffect(() => {
    if (message) {
      setSnackPack((prev: messageInfoType[]) => [
        ...prev,
        { message, key: new Date().getTime() },
      ]);
    }
  }, [message]);

  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    // timeoutしたとき
    dispatch(setState({ target: "message", data: "" }));
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  const classes = useStyles();
  return (
    <div>
      {/* <Button onClick={handleClick("Message A")}>Show message A</Button>
      <Button onClick={handleClick("Message B")}>Show message B</Button> */}
      <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        TransitionComponent={Slide}
        open={open}
        autoHideDuration={2500} // 自動的にonCloseを呼ぶ
        onClose={handleClose}
        onExited={handleExited}
        // message={}
        action={
          <>
            <IconButton
              aria-label="close"
              color="inherit"
              className={classes.close}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      >
        <MuiAlert
          variant="filled"
          elevation={10}
          onClose={handleClose}
          severity={isError ? "error" : "success"}
        >
          {messageInfo ? messageInfo.message : undefined}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { colors } from "@material-ui/core";
import Loading from "../../../auth/Loading";
// import { TransitionProps } from "@material-ui/core/transitions";
// import Slide from "@material-ui/core/Slide";

// const Transition = React.forwardRef(function Transition(
//   props: TransitionProps & { children?: React.ReactElement<any, any> },
//   ref: React.Ref<unknown>
// ) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

export default function FormDialog({
  isOpen,
  handleClose,
  handleDelete,
  children,
}: {
  isOpen: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        transitionDuration={{ enter: 200, exit: 70 }}
        // TransitionComponent={Transition}
        // keepMounted
      >
        <DialogTitle id="form-dialog-title">編集</DialogTitle>
        <DialogContent
          style={{ minWidth: 490, minHeight: 440, position: "relative" }}
        >
          {children}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
            }}
            color="primary"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              if (window.confirm("本当に消去していいですか？")) {
                handleDelete();
                // dialog closeの処理は、handleDelete内に記載
              }
            }}
            style={{ color: colors.red[500] }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

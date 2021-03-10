import { colors, useMediaQuery, useTheme } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Slide from "@material-ui/core/Slide";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import { TransitionProps } from "@material-ui/core/transitions";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import React from "react";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 490,
    minHeight: 440,
    position: "relative",
    overflow: "scroll",
    [theme.breakpoints.down("xs")]: {
      position: "relative",
      minWidth: 260,
      minHeight: 360,
    },
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FormDialog({
  isOpen,
  handleClose,
  handleDelete,
  children,
  formRole,
}: {
  isOpen: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  children: React.ReactNode;
  formRole: "edit" | "create";
}) {
  const classes = useStyles();
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));
  const title = formRole === "edit" ? "編集" : "新規作成";
  return (
    <div>
      <Dialog
        open={isOpen}
        fullScreen={isXSDown ? true : false}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        transitionDuration={{ enter: 320, exit: 0 }}
        TransitionComponent={isXSDown ? Transition : undefined}
        // TransitionComponent={Transition}
        // keepMounted
      >
        {isXSDown ? (
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                {title}
              </Typography>
              {formRole === "edit" && (
                <Button
                  autoFocus
                  color="inherit"
                  onClick={handleDelete}
                  startIcon={<DeleteForeverIcon />}
                >
                  消去
                </Button>
              )}
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle id="form-dialog-title" disableTypography>
            <Typography align="center" variant="h5">
              {title}
            </Typography>
          </DialogTitle>
        )}

        <DialogContent className={classes.dialogContent}>
          <div>{children}</div>
        </DialogContent>
        {!isXSDown && (
          <DialogActions>
            <Button
              onClick={() => {
                handleClose();
              }}
              color="primary"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
            {formRole === "edit" && (
              <Button
                onClick={() => {
                  if (window.confirm("本当に消去していいですか？")) {
                    handleDelete();
                    // dialog closeの処理は、handleDelete内に記載
                  }
                }}
                style={{ color: colors.red[500] }}
                startIcon={<DeleteForeverIcon />}
              >
                Delete
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}

FormDialog.defaultProps = {
  formRole: "edit",
};

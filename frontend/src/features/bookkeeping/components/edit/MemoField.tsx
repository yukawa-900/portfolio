import React from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import NoteIcon from "@material-ui/icons/Note";
import BlockIcon from "@material-ui/icons/Block";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import Tooltip from "@material-ui/core/Tooltip";
import { useSelector, useDispatch } from "react-redux";
import { changeTransactionGroup, selectMemo } from "../../bookkeepingSlice";

const useStyles = makeStyles((theme) => ({
  memoButton: {
    margin: theme.spacing(0, 0, 0, -1.2),
    width: "2.8rem",
    height: "2.8rem",
  },
  memoIcon: {
    fontSize: "2.2rem",
  },
  memoPopover: {
    position: "relative",
    width: 340,
    padding: theme.spacing(1, 2, 1.4, 2),
    borderRadius: theme.spacing(1),
  },
  memoTextArea: {
    width: 300,
  },
  memoDeleteButton: {
    position: "absolute",
    bottom: 5,
    right: 26,
    width: 30,
    height: 30,
    "&:hover": {
      color: theme.palette.error.light,
    },
  },
  memoDeleteIcon: {
    fontSize: 20,
  },
}));

const MemoField: React.FC<any> = (
  {
    // values,
    // setFieldValue,
    // errors,
    // handleChange,
    // handleBlur,
  }
) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const memo = useSelector(selectMemo);
  const dispatch = useDispatch();

  const handleMemoClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMemoClose = () => {
    setAnchorEl(null);
  };
  const isMemoOpen = Boolean(anchorEl);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeTransactionGroup({ memo: event.target.value }));
  };

  const handleClear = () => {
    dispatch(changeTransactionGroup({ memo: "" }));
  };

  const isError = String(memo).length > 500;

  return (
    <>
      <Grid item style={{ alignSelf: "center" }}>
        <Tooltip title="摘要" placement="top">
          <IconButton
            className={classes.memoButton}
            onClick={handleMemoClick}
            aria-label="open memo"
            tabIndex={-1}
          >
            <NoteIcon
              color={memo === "" ? "inherit" : isError ? "error" : "primary"}
              className={classes.memoIcon}
            />
          </IconButton>
        </Tooltip>
      </Grid>
      <Popover
        // findDOMNode is deprecated in StrictMode.というWraningが出るが、
        // Material-UI側の問題？らしい。Drawer等でもWraningが出る模様。
        PaperProps={{ className: classes.memoPopover }}
        open={isMemoOpen}
        anchorEl={anchorEl}
        onClose={handleMemoClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: 220,
        }}
      >
        <Typography variant="subtitle1" align="center">
          摘要を追加
        </Typography>
        <TextField
          name="memo"
          className={classes.memoTextArea}
          multiline
          rows={6}
          onChange={handleChange}
          value={memo}
          placeholder={"ここにメモを追加できます"}
          variant="outlined"
          error={isError} // 500文字を超えるとエラー
          helperText={"最大500文字です"}
        />
        <Tooltip title="メモを消去する" placement="left-end">
          <IconButton
            aria-label="delete memo"
            className={classes.memoDeleteButton}
            onClick={handleClear}
          >
            <BlockIcon className={classes.memoDeleteIcon} color="inherit" />
          </IconButton>
        </Tooltip>
      </Popover>
    </>
  );
};

export default MemoField;

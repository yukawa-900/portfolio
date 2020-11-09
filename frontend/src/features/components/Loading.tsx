import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  progress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
}));

const Loading = () => {
  const classes = useStyles();
  return (
    <div className={classes.progress}>
      <CircularProgress size="6rem" />
    </div>
  );
};

export default Loading;

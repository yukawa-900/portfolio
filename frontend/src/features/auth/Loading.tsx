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

const Loading = ({ size }: { size: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.progress}>
      <CircularProgress size={size} />
    </div>
  );
};

export default Loading;

import React from "react";
import { makeStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Translate } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
}));
const Progress = () => {
  const classes = useStyles();
  return <CircularProgress className={classes.circularProgress} size={60} />;
};

export default Progress;

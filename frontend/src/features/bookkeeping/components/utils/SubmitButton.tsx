import React, { ReactNode, useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(4, 0, 1, 0),
    width: 400,
    [theme.breakpoints.down("xs")]: {
      width: "80%",
    },
  },
}));

const SubmitButton = ({ handleSubmit }: any) => {
  const classes = useStyles();
  return (
    <>
      <Button
        className={classes.submit}
        variant="contained"
        color="secondary"
        startIcon={<CloudUploadIcon />}
        onClick={handleSubmit}
      >
        Upload
      </Button>
    </>
  );
};

export default SubmitButton;

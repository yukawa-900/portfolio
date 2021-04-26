import { colors } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import { useSelector } from "react-redux";
import { selectIsDarkMode } from "../auth/authSlice";

const useStyles = makeStyles((theme) => ({
  appBar: {
    top: "auto",
    bottom: 0,
    height: 80,
    padding: 5,
  },
  toolbar: {
    margin: 10,
    height: 80,
  },
  tabs: {
    "& > MuiTab-root": {
      fontSize: "0.6rem",
    },
  },
}));

export default function SmartphoneMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const classes = useStyles();
  const isDarkMode = useSelector(selectIsDarkMode);

  return (
    <>
      <Toolbar className={classes.toolbar} />
      <AppBar
        position="fixed"
        color="default"
        className={classes.appBar}
        style={{
          backgroundColor: isDarkMode ? "#555" : colors.grey[200],
        }}
      >
        <Tabs
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="secondary"
          aria-label="smartphone-menu"
        >
          {children}
        </Tabs>
      </AppBar>
    </>
  );
}

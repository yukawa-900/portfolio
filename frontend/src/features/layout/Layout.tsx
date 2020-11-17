import React, { useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../app/store";
import { logout } from "../auth/authSlice";
import Loading from "../auth/Loading";

import Add from "../bookkeeping/pages/Add";
import Edit from "../bookkeeping/pages/Edit";
import Find from "../bookkeeping/pages/Find";
import SideList from "./SideList";

const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  appBarTitle: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const ResponsiveDrawer = (props: any) => {
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/signin";
    }
  });

  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dispatch: AppDispatch = useDispatch();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* サインインしているならメイン画面を表示、していない場合はロード画面を表示 */}
      {localStorage.getItem("token") ? (
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="fixed" className={classes.appBar}>
            {/* ヘッダー部分 */}
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" noWrap className={classes.appBarTitle}>
                Responsive drawer
              </Typography>

              <IconButton
                color="inherit"
                aria-label="logout"
                edge="start"
                onClick={() => dispatch(logout())}
              >
                <ExitToAppIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <nav className={classes.drawer} aria-label="mailbox folders">
            {/* サイドバー */}
            <Hidden lgUp implementation="js">
              <Drawer
                variant="temporary"
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                classes={{
                  paper: classes.drawerPaper,
                }}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
                <SideList />
              </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
              <Drawer
                classes={{
                  paper: classes.drawerPaper,
                }}
                variant="permanent"
                open
              >
                <SideList />
              </Drawer>
            </Hidden>
          </nav>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            {props.main === "add" ? (
              <Add />
            ) : props.main === "edit" ? (
              <Edit />
            ) : props.main === "find" ? (
              <Find />
            ) : null}
          </main>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default ResponsiveDrawer;

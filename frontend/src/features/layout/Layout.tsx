import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";
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
import Tooltip from "@material-ui/core/Tooltip";
import Add from "../bookkeeping/pages/main/Add";
import Edit from "../bookkeeping/pages/main/Edit";
import Find from "../bookkeeping/pages/main/Find";
import SideList from "./SideList";
import Brightness2Icon from "@material-ui/icons/Brightness2";
import BrightnessHighIcon from "@material-ui/icons/BrightnessHigh";
import { changeColorMode, selectIsDarkMode } from "../auth/authSlice";
import CurrencySettings from "../bookkeeping/pages/settings/CurrencySettings";
import DepartmentSettings from "../bookkeeping/pages/settings/DepartmentSettings";
import AccountSettings from "../bookkeeping/pages/settings/AccountSettings";

const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("lg")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    background: theme.palette.primary.dark,
    color: theme.palette.common.white,
    [theme.breakpoints.up("lg")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  appBarTitle: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("lg")]: {
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
  const token = localStorage.getItem("token");

  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dispatch: AppDispatch = useDispatch();
  const isDarkMode = useSelector(selectIsDarkMode);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleColorMode = () => {
    dispatch(changeColorMode());
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
                tabIndex={-1}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" noWrap className={classes.appBarTitle}>
                簿記アプリ
              </Typography>

              <Tooltip title="ダークモード切替" placement="bottom">
                <IconButton
                  color="inherit"
                  aria-label="change color mode"
                  edge="start"
                  onClick={handleColorMode}
                  tabIndex={-1}
                  style={{ marginRight: "20px" }}
                >
                  {isDarkMode ? <BrightnessHighIcon /> : <Brightness2Icon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="ログアウト" placement="bottom">
                <IconButton
                  color="inherit"
                  aria-label="logout"
                  edge="start"
                  onClick={() => dispatch(logout())}
                  tabIndex={-1}
                >
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <nav className={classes.drawer} aria-label="mailbox folders">
            {/* サイドバー */}
            <Hidden xlUp implementation="js">
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
            <Hidden mdDown implementation="css">
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
            ) : props.main === "settings-currency" ? (
              <CurrencySettings />
            ) : props.main === "settings-department" ? (
              <DepartmentSettings />
            ) : props.main === "settings-account" ? (
              <AccountSettings />
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

import React, { useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../app/store";
import { logout } from "../auth/authSlice";
import Loading from "../auth/Loading";
import Tooltip from "@material-ui/core/Tooltip";
import SideList from "./SideList";
import Brightness2Icon from "@material-ui/icons/Brightness2";
import BrightnessHighIcon from "@material-ui/icons/BrightnessHigh";
import { default as Tab, TabProps } from "@material-ui/core/Tab";
import PhoneIcon from "@material-ui/icons/Phone";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import { changeColorMode, selectIsDarkMode } from "../auth/authSlice";
import { useQuery } from "@apollo/react-hooks";
import { fetchAllActiveItems } from "../bookkeeping/settingsSlice";
import {
  GET_ALL_AMEBA_DEPARTMENTS,
  GET_ALL_COST_ITEMS,
  GET_ALL_SALES_CATEGORIES,
} from "../ameba/operations/queries";
import { setState } from "../ameba/amebaSlice";
import { useTheme, useMediaQuery } from "@material-ui/core";
import SmartphoneMenu from "./SmartphoneMenu";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import SearchIcon from "@material-ui/icons/Search";
import SettingsIcon from "@material-ui/icons/Settings";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import ViewListIcon from "@material-ui/icons/ViewList";
import AssignmentIcon from "@material-ui/icons/Assignment";
import { Link, LinkProps } from "react-router-dom";

const LinkTab: React.ComponentType<
  TabProps & LinkProps
> = Tab as React.ComponentType<TabProps & LinkProps>;

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
    // background: theme.palette.primary.dark,
    // color: theme.palette.common.white,
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
    maxWidth: "100%",
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1),
    },
  },
  tab: {
    fontSize: "1rem",
    textDecoration: "None",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.6rem",
    },
  },
}));

const ResponsiveDrawer = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isMDDown = useMediaQuery(theme.breakpoints.down("md"));
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

  const {
    loading: loadingDepts,
    data: dataDepts,
    error: errorDepts,
  } = useQuery(GET_ALL_AMEBA_DEPARTMENTS);

  const {
    loading: loadingCostItems,
    data: dataCostItems,
    error: errorCostItems,
  } = useQuery(GET_ALL_COST_ITEMS);

  const {
    loading: loadingSalesCategories,
    data: dataSalesCategories,
    error: errorSalesCategories,
  } = useQuery(GET_ALL_SALES_CATEGORIES);

  useEffect(() => {
    dispatch(fetchAllActiveItems());
  }, []);

  useEffect(() => {
    if (dataDepts) {
      dispatch(
        setState({
          target: "departments",
          data: dataDepts?.allDepartments.edges,
        })
      );
    }
  }, [dataDepts]);

  useEffect(() => {
    if (dataCostItems) {
      dispatch(
        setState({
          target: "costItems",
          data: dataCostItems?.allCostItems.edges,
        })
      );
    }
  }, [dataCostItems]);

  useEffect(() => {
    if (dataSalesCategories) {
      dispatch(
        setState({
          target: "salesCategories",
          data: dataSalesCategories?.allSalesCategories.edges,
        })
      );
    }
  }, [dataSalesCategories]);

  return (
    <>
      {/* サインインしているならメイン画面を表示、していない場合はロード画面を表示 */}
      {localStorage.getItem("token") ? (
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="fixed" color="default" className={classes.appBar}>
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
            {children}
          </main>
        </div>
      ) : (
        <Loading size={"6rem"} />
      )}
      {isMDDown &&
        (window.location.href.indexOf("ameba") != -1 ? (
          <SmartphoneMenu>
            <LinkTab
              icon={<AssignmentIcon />}
              label="採算表"
              className={classes.tab}
              component={Link}
              to="/app/ameba/dashboard"
              value="/app/ameba/dashboard"
            />

            <LinkTab
              component={Link}
              to="/app/ameba/input"
              value="/app/ameba/input"
              icon={<AddIcon />}
              label="入力"
              className={classes.tab}
            />
            <LinkTab
              component={Link}
              to="/app/ameba/settings"
              value="/app/ameba/settings"
              icon={<SettingsIcon />}
              label="設定"
              className={classes.tab}
            />
            <LinkTab
              component={Link}
              to="/app/bookkeeping/add"
              value="/app/bookkeeping/add"
              icon={<AccountBalanceWalletIcon />}
              label="簿記アプリ"
              className={classes.tab}
            />
          </SmartphoneMenu>
        ) : window.location.href.indexOf("bookkeeping") != -1 ? (
          <SmartphoneMenu>
            <LinkTab
              component={Link}
              to="/app/bookkeeping/add"
              value="/app/bookkeeping/add"
              icon={<AddIcon />}
              label="入力"
              className={classes.tab}
            />
            <LinkTab
              component={Link}
              to="/app/bookkeeping/find"
              value="/app/bookkeeping/find"
              icon={<SearchIcon />}
              label="検索"
              className={classes.tab}
            />
            <LinkTab
              component={Link}
              to="/app/bookkeeping/edit"
              value="/app/bookkeeping/edit"
              icon={<EditIcon />}
              label="編集"
              className={classes.tab}
            />
            <LinkTab
              component={Link}
              to="/app/ameba/dashboard"
              value="/app/ameba/dashboard"
              icon={<GroupWorkIcon />}
              label="簿記アプリ"
              className={classes.tab}
            />
          </SmartphoneMenu>
        ) : null)}
    </>
  );
};

export default ResponsiveDrawer;

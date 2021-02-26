import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FaceIcon from "@material-ui/icons/Face";
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
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  toolbar: theme.mixins.toolbar,
  link: {
    textDecoration: "none",
    color: "inherit",
  },
}));

// function GenericCustomComponent<C extends React.ElementType>(
//   props: TypographyProps<C, { component?: C }>
// ) {
//   /* ... */
// }

// function ThirdPartyComponent({ to }: { to: string }) {
//   return <div />;
// }
// <GenericCustomComponent component={ThirdPartyComponent} to="some value" />;

const SideList = () => {
  const classes = useStyles();
  // const [bookkeepingOpen, setBookkeepingOpen] = useState(false);
  // const [amebaOpen, setAmebaOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleClickSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <div>
      <div className={classes.toolbar} />
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Navigation
          </ListSubheader>
        }
        className={classes.root}
      >
        <Divider />
        <ListItem>
          <ListItemIcon>
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          <ListItemText primary="仕訳アプリ" />
        </ListItem>
        <List component="div" disablePadding>
          <Link
            to="/app/bookkeeping/add"
            className={classes.link}
            tabIndex={-1}
          >
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="新規追加" />
            </ListItem>
          </Link>
          <Link
            to="/app/bookkeeping/edit"
            className={classes.link}
            tabIndex={-1}
          >
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary="編集" />
            </ListItem>
          </Link>
          <Link
            to="/app/bookkeeping/find"
            className={classes.link}
            tabIndex={-1}
          >
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="検索" />
            </ListItem>
          </Link>
          <ListItem
            button
            onClick={handleClickSettings}
            className={classes.nested}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="設定" />
            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <Link
              to="/app/bookkeeping/settings/account"
              className={classes.link}
              tabIndex={-1}
            >
              <ListItem button className={classes.nested} tabIndex={-1}>
                <ListItemText primary="勘定科目" inset />
              </ListItem>
            </Link>
            <Link
              to="/app/bookkeeping/settings/department"
              className={classes.link}
              tabIndex={-1}
            >
              <ListItem button className={classes.nested} tabIndex={-1}>
                <ListItemText primary="部門" inset />
              </ListItem>
            </Link>
            <Link
              to="/app/bookkeeping/settings/currency"
              className={classes.link}
              tabIndex={-1}
            >
              <ListItem button className={classes.nested} tabIndex={-1}>
                <ListItemText primary="通貨" inset />
              </ListItem>
            </Link>
          </Collapse>
          <ListItem>
            <ListItemIcon>
              <GroupWorkIcon />
            </ListItemIcon>
            <ListItemText primary="アメーバ経営" />
          </ListItem>
          <Link
            to="/app/ameba/profit_per_hour"
            className={classes.link}
            tabIndex={-1}
          >
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="採算表" />
            </ListItem>
          </Link>
          <Link to="/app/ameba/input" className={classes.link} tabIndex={-1}>
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="入力" />
            </ListItem>
          </Link>
          <Link to="/app/ameba/list" className={classes.link} tabIndex={-1}>
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <ViewListIcon />
              </ListItemIcon>
              <ListItemText primary="一覧" />
            </ListItem>
          </Link>
          <Link to="/app/ameba/settings" className={classes.link} tabIndex={-1}>
            <ListItem button className={classes.nested} tabIndex={-1}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="設定" />
            </ListItem>
          </Link>
        </List>
        <Divider />
      </List>
    </div>
  );
};

export default SideList;

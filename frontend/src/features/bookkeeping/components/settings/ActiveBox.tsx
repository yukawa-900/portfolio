import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { ACTIVE_OBJECT } from "../../../types";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "auto",
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    minWidth: "25vw",
    height: "50vh",
    backgroundColor: theme.palette.background.paper,
    overflow: "auto",
  },
  listItem: {
    minWidth: 120,
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
}));

function not(a: Array<ACTIVE_OBJECT>, b: Array<ACTIVE_OBJECT>) {
  return a.filter((value: ACTIVE_OBJECT) => b.indexOf(value) === -1);
}

function intersection(a: Array<ACTIVE_OBJECT>, b: Array<ACTIVE_OBJECT>) {
  return a.filter((value: ACTIVE_OBJECT) => b.indexOf(value) !== -1);
}

function union(a: Array<ACTIVE_OBJECT>, b: Array<ACTIVE_OBJECT>) {
  return [...a, ...not(b, a)];
}

export default function Active({
  active,
  setActive,
  inactive,
  setInactive,
}: {
  active: Array<ACTIVE_OBJECT>;
  inactive: Array<ACTIVE_OBJECT>;
  setActive: any;
  setInactive: any;
}) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState<Array<ACTIVE_OBJECT>>([]);
  //   const [active, setActive] = React.useState([0, 1, 2, 3]);
  //   const [inactive, setInactive] = React.useState([4, 5, 6, 7]);

  const activeChecked = intersection(checked, active);
  const inactiveChecked = intersection(checked, inactive);

  const handleToggle = (value: ACTIVE_OBJECT) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: Array<ACTIVE_OBJECT>) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: Array<ACTIVE_OBJECT>) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setInactive(inactive.concat(activeChecked));
    setActive(not(active, activeChecked));
    setChecked(not(checked, activeChecked));
  };

  const handleCheckedLeft = () => {
    setActive(active.concat(inactiveChecked));
    setInactive(not(inactive, inactiveChecked));
    setChecked(not(checked, inactiveChecked));
  };

  const customList = (title: string, items: Array<ACTIVE_OBJECT>) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{ "aria-label": "all items selected" }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem
              className={classes.listItem}
              key={value.code}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.name} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid
      container
      spacing={2}
      justify="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid item>{customList("有効", active)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={activeChecked.length === 0}
            aria-label="move selected inactive"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={inactiveChecked.length === 0}
            aria-label="move selected active"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList("無効", inactive)}</Grid>
    </Grid>
  );
}

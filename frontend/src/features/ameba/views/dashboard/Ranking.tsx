import React, { useState } from "react";
import clsx from "clsx";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Loading from "../../../auth/Loading";
import { getLabel } from "./utils";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TimelineIcon from "@material-ui/icons/Timeline";
import { formatFloatingPointNumber } from "../../../utils/moneyFormatter";
import { useDispatch } from "react-redux";
import { setState } from "../../amebaSlice";
import { Link } from "react-scroll";

type typeChoices = "salesByItemMoney" | "salesByCategory" | "cost";

const choices: Array<typeChoices> = [
  "salesByItemMoney",
  "salesByCategory",
  "cost",
];

const choiceNames = {
  salesByItemMoney: "メニュー(金額順)",
  salesByCategory: "売上カテゴリー",
  cost: "費用",
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  image: {
    height: 48,
    width: 48,
  },
  formControl: {
    margin: theme.spacing(2, 1),
    minWidth: 120,
  },
  expandButton: {
    marginLeft: "auto",
    marginRight: theme.spacing(1),
  },
  expandIcon: {
    transform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandIconOpen: {
    transform: "rotate(180deg)",
  },
}));

const Ranking = ({ data, loading }: any) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(choices[0]);
  const salesByCategory = data?.salesByCategoryAggregation;
  const salesByItem = data?.salesByItemAggregation;
  const cost = data?.costAggregation;
  const workingHours = data?.workingHoursAggregation;

  const dataList =
    selected === "salesByItemMoney"
      ? salesByItem
      : selected === "salesByCategory"
      ? salesByCategory
      : selected === "cost"
      ? cost
      : workingHours;

  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        subheader="Ranking"
        title="ランキング"
        action={
          <FormControl className={classes.formControl}>
            <Select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value as typeChoices);
                setExpanded(false);
              }}
              renderValue={(value) => choiceNames[value as typeChoices]}
            >
              {choices.map((choice, index) => (
                <MenuItem value={choice} key={index}>
                  {choiceNames[choice]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <Divider />
      <CardContent>
        <Box minHeight={360} position="relative">
          {loading && <Loading size={"3rem"} />}
          {!loading && data && dataList && (
            <List>
              {dataList
                .slice(0, expanded ? dataList.length : 5)
                .map((data: any, i: number) => {
                  return (
                    <ListItem
                      divider={expanded ? i < dataList.length - 1 : i < 4}
                      key={i}
                    >
                      {data?.item?.photo && (
                        <ListItemAvatar>
                          <img
                            alt="Product"
                            className={classes.image}
                            src={data?.item?.photo}
                          />
                        </ListItemAvatar>
                      )}
                      <ListItemText
                        primary={data?.item?.name || data?.category?.name}
                        secondary={`${
                          data?.money
                            ? formatFloatingPointNumber(data.money, 0, "JPY")
                            : ""
                        } ${data?.num ? "/" + String(data?.num) + "個" : ""}`}
                      />
                      <Link
                        to="graph"
                        spy={true}
                        smooth={true}
                        offset={-80}
                        duration={500}
                      >
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => {
                            console.log("clicekd");
                            dispatch(
                              setState({
                                target: "graphFilterVariables",
                                data: {
                                  displayed:
                                    data?.item?.id || data?.category?.id,
                                  dataType: selected,
                                },
                              })
                            );
                          }}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Link>
                    </ListItem>
                  );
                })}
            </List>
          )}
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          onClick={handleExpandClick}
          color="primary"
          className={classes.expandButton}
          startIcon={
            <ExpandMoreIcon
              className={clsx(classes.expandIcon, {
                [classes.expandIconOpen]: expanded,
              })}
            />
          }
        >
          View All
        </Button>
        {/* <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton> */}
      </CardActions>
    </Card>
  );
};

export default Ranking;

import React, { useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useSelector, useDispatch } from "react-redux";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import DepartmentBaseField from "../../components/fields/DepartmentBaseField";
import DateBaseField from "../../components/fields/DateBaseField";
import { selectSelectedDeptID } from "../../amebaSlice";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import formatDate from "../../../utils/dateFormatter";
import { useLazyQuery } from "@apollo/client";
import { GET_AGGREGATIONS } from "../../operations/queries";
import Loading from "../../../auth/Loading";

const useStyles = makeStyles((theme) => ({
  card: {
    position: "relative",
    minHeight: 130,
    [theme.breakpoints.down("lg")]: {
      minHeight: 180,
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: 100,
    },
  },
  title: {
    fontFamily: "Noto Sans JP",
  },
  avatar: {
    height: 50,
    width: 50,
  },
  icon: {
    height: 36,
    width: 36,
  },
}));

const Aggregation = ({ Icon, title, value, iconColor, loading }: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const isSMDown = useMediaQuery(theme.breakpoints.down("sm"));
  const isLGDwon = useMediaQuery(theme.breakpoints.down("lg"));
  return (
    <Card className={classes.card}>
      {loading ? (
        <Loading size={"1.8rem"} />
      ) : (
        <CardContent>
          <Grid
            container
            direction={isSMDown ? "row" : isLGDwon ? "column" : "row"}
            justify="space-between"
            spacing={3}
          >
            <Grid item>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
                className={classes.title}
              >
                {title}
              </Typography>
              <Typography color="textPrimary" variant="h4">
                {value}
              </Typography>
            </Grid>
            <Grid item>
              <Avatar
                style={{ backgroundColor: iconColor }}
                className={classes.avatar}
              >
                <Icon className={classes.icon} />
              </Avatar>
            </Grid>
          </Grid>
        </CardContent>
      )}
    </Card>
  );
};

export default Aggregation;

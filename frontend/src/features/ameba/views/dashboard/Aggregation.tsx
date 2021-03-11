import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import DepartmentBaseField from "../../components/fields/DepartmentBaseFied";
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

const useStyles = makeStyles((theme) => ({
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

const Aggregation = ({ Icon, title, value, iconColor }: any) => {
  const classes = useStyles();
  return (
    <Card>
      <CardContent>
        <Grid container justify="space-between" spacing={3}>
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
    </Card>
  );
};

export default Aggregation;

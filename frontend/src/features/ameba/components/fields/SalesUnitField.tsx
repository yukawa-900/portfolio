import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { selectSalesUnits } from "../../amebaSlice";
import {
  numberAccept,
  parseNumber,
  formatFloatingPointNumber,
} from "../../../utils/moneyFormatter";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const useStyles = makeStyles((theme) => ({
  avatarWrapper: {
    paddingRight: theme.spacing(3),
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
  secondary: {
    display: "block",
  },
}));

const SalesUnitField = ({ values, yupKey, setFieldValue }: any) => {
  const classes = useStyles();
  const salesUnits = useSelector(selectSalesUnits);

  let initialSelectedName = "";
  if (values[yupKey]) {
    salesUnits.forEach((i: any) => {
      if (i.node.id === values[yupKey]) {
        initialSelectedName = i.node.name;
      }
    });
  }

  const [selectedName, setSelectedName] = useState(initialSelectedName);

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name={yupKey}
      label="売上項目"
      type="text"
      margin="normal"
      variant="outlined"
      fullWidth
      SelectProps={{
        renderValue: (value: any) => selectedName,
      }}
      value={values[yupKey]}
      onChange={(e: any) => setFieldValue("item", e.target.value)}
    >
      {salesUnits?.map((option: any) => (
        <MenuItem
          key={option.node.id}
          value={option.node.id}
          onClick={() => {
            setSelectedName(option.node.name);
          }}
        >
          <ListItem>
            <ListItemAvatar className={classes.avatarWrapper}>
              <Avatar
                className={classes.avatar}
                alt={`${option.node.name}の写真`}
                src={`${apiUrl}${option.node.photo}`}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  <Typography variant="h5" component="span">
                    {option.node.name}
                  </Typography>
                </>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="caption"
                    className={classes.secondary}
                    color="textSecondary"
                    gutterBottom
                  >
                    {`${formatFloatingPointNumber(
                      String(option.node.unitPrice),
                      0,
                      "JPY"
                    )}`}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
        </MenuItem>
      ))}
    </Field>
  );
};

export default SalesUnitField;

import Avatar from "@material-ui/core/Avatar";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectEmployees } from "../../amebaSlice";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "36ch",
    backgroundColor: theme.palette.background.paper,
  },
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

const EmployeeField = ({ values, yupKey, setFieldValue, size }: any) => {
  const classes = useStyles();
  const employees = useSelector(selectEmployees);

  let initialSelectedName = "";
  if (values[yupKey]) {
    employees.forEach((i: any) => {
      if (i.node.id === values[yupKey]) {
        initialSelectedName = i.node.fullName;
      }
    });
  }

  // option（写真なども含む） と TextField（文字のみ）を隔てるために利用
  const [selectedName, setSelectedName] = useState(initialSelectedName);

  // selectedNameの初期値はどうするか？
  // values[yupKKey] で、idは取れる
  // id から、名前を検索すればいい

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name={yupKey}
      label="従業員"
      type="text"
      margin="normal"
      variant="outlined"
      fullWidth
      size={size}
      value={values[yupKey]}
      onChange={(e: any) => {
        setFieldValue(yupKey, e.target.value);
      }}
      SelectProps={{
        renderValue: (value: any) => selectedName,
      }}
    >
      {employees?.map((option: any) => {
        return (
          <MenuItem
            key={option.node.id}
            value={option.node.id}
            onClick={() => {
              setSelectedName(option.node.fullName);
            }}
          >
            <ListItem>
              <ListItemAvatar className={classes.avatarWrapper}>
                <Avatar
                  className={classes.avatar}
                  alt={`${option.node.fullName}の写真`}
                  src={
                    option.node.photo
                      ? `${apiUrl}${option.node.photo}`
                      : undefined
                  }
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography variant="h5" component="span">
                      {option.node.fullName}
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
                      {option.node.fullFurigana}
                    </Typography>

                    <Typography
                      component="span"
                      variant="caption"
                      className={classes.secondary}
                      color="textSecondary"
                    >
                      {option.node.position === "A_0" ? "正社員" : "アルバイト"}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          </MenuItem>
        );
      })}
    </Field>
  );
};

export default EmployeeField;

EmployeeField.defaultProps = {
  size: "medium",
};

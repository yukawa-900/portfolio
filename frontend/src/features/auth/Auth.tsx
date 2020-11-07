import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import { Formik } from "formik";
import * as Yup from "yup";
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import { PROPS_AUTH_COMPONENT } from "../types";

import {
  login,
  register,
  startAuth,
  endAuth,
  selectIsAuthLoading,
  selectIsAuthRejected,
} from "./authSlice";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        portfolio
      </Link>
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const yupEmail = Yup.string()
  .email("メールアドレスの形式で入力してください")
  .required("必須項目です")
  .min(10, "短かすぎます")
  .max(100, "長すぎます");

const yupPassword = Yup.string()
  .required("必須項目です")
  .min(6, "短かすぎます")
  .max(100, "長すぎます");

const Auth: React.FC<PROPS_AUTH_COMPONENT> = ({ isSignup }) => {
  const classes = useStyles();
  const isAuthLoading = useSelector(selectIsAuthLoading);
  const isAuthRejected = useSelector(selectIsAuthRejected);

  const dispatch: AppDispatch = useDispatch();

  const validation = () => {
    if (isSignup) {
      return Yup.object().shape({
        email: yupEmail,
        password1: yupPassword,
        password2: yupPassword.oneOf(
          [Yup.ref("password1")],
          "passwordが一致しません。"
        ),
      });
    } else {
      return Yup.object().shape({
        email: yupEmail,
        password: yupPassword,
      });
    }
  };

  let initialValues: any; // 後にauthSliceで型をチェックしている。
  //initialValuesの型はanyにしないと、Yupが上手く働かない。

  if (isSignup) {
    initialValues = {
      email: "",
      password1: "",
      password2: "",
    };
  } else {
    initialValues = { email: "", password: "" };
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {isSignup ? "Sign up" : "Sign in"}
        </Typography>
        {isAuthRejected ? (
          <Alert severity="error">
            メールアドレスかパスワードが間違っています。
          </Alert>
        ) : null}
        {isAuthLoading ? <CircularProgress /> : null}
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => {
            dispatch(startAuth());
            if (isSignup) {
              const resultRegister = await dispatch(register(values));
              if (register.fulfilled.match(resultRegister)) {
                await dispatch(
                  login({ email: values.email, password: values.password1 })
                );
              }
              dispatch(endAuth());
            } else {
              const resultLogin = await dispatch(login(values));
              // if (login.fulfilled.match(result)) {

              // }
              dispatch(endAuth());
            }
          }}
          validationSchema={validation()}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <form className={classes.form} onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                error={Boolean(touched.email && errors.email)}
                helperText={errors.email}
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                name={isSignup ? "password1" : "password"}
                label="Password"
                type="password"
                id={isSignup ? "password1" : "password"}
                autoComplete="current-password"
                onBlur={handleBlur}
                onChange={handleChange}
                error={
                  isSignup
                    ? Boolean(touched.password1 && errors.password1)
                    : Boolean(touched.password && errors.password)
                }
                helperText={isSignup ? errors.password1 : errors.password}
                value={isSignup ? values.password1 : values.password}
              />
              {isSignup ? (
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  name="password2"
                  label="Password（確認）"
                  type="password"
                  id="password2"
                  autoComplete="current-password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password2}
                />
              ) : null}
              <Button
                type="submit"
                fullWidth
                disabled={!isValid}
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {isSignup ? "Sign up" : "Sign in"}
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    パスワードを忘れた方
                  </Link>
                </Grid>
                <Grid item>
                  <Link href={isSignup ? "/signin" : "/signup"} variant="body2">
                    {isSignup ? "ログインはこちら" : "新規登録はこちら"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default Auth;

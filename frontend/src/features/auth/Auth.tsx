import React, { useEffect } from "react";
import jwt_decode from "jwt-decode";
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
import TwitterIcon from "@material-ui/icons/Twitter";
// import GitHubIcon from "@material-ui/icons/GitHub";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import { Formik } from "formik";
import * as Yup from "yup";
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import { PROPS_AUTH_COMPONENT } from "../types";
import {
  fetchAccounts,
  fetchCurrencies,
  fetchDepartments,
  fetchTaxes,
} from "../bookkeeping/activeListSlice";
import { useHistory } from "react-router-dom";
import {
  login,
  register,
  startAuth,
  endAuth,
  selectIsAuthLoading,
  selectIsAuthRejected,
  fetchTwitterURL,
} from "./authSlice";
import { fetchAllActiveItems } from "../bookkeeping/settingsSlice";
import { useQuery } from "@apollo/react-hooks";
import {
  GET_ALL_AMEBA_DEPARTMENTS,
  GET_ALL_COST_ITEMS,
} from "../ameba/operations/queries";

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
  social: {},
  twitter: {
    textTransform: "none",
    color: "white",
    background: theme.palette.social.twitter,
    "&:hover": {
      background: theme.palette.social.twitter,
    },
    margin: theme.spacing(3, 0, 2, 0),
  },
  link: {
    color: theme.palette.primary.light,
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
  const history = useHistory();
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
  //initialValuesの型はanyにしないと、下記の条件分岐のせい(?)でYupが上手く働かない。

  if (isSignup) {
    initialValues = {
      email: "",
      password1: "",
      password2: "",
    };
  } else {
    initialValues = { email: "", password: "" };
  }

  const handleTwitterLogin = async () => {
    dispatch(startAuth());
    dispatch(fetchTwitterURL());
  };

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
          <Alert severity="error" variant="outlined">
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
            }
            const resultLogin = await dispatch(login(values));
            if (login.fulfilled.match(resultLogin)) {
              window.location.href = "/app/bookkeeping/add";
            }
            dispatch(endAuth());
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
            dirty,
            isSubmitting,
          }) => {
            const isErrorEmail = Boolean(touched.email && errors.email);
            const isErrorPassword = Boolean(
              touched.password && errors.password
            );
            const isErrorPassword1 = Boolean(
              touched.password1 && errors.password1
            );
            const isErrorPassword2 = Boolean(
              touched.password2 && errors.password2
            );

            return (
              <>
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
                    error={isErrorEmail}
                    helperText={isErrorEmail ? errors.email : null}
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
                    error={isSignup ? isErrorPassword1 : isErrorPassword}
                    helperText={
                      // ログイン or 新規登録
                      isSignup
                        ? isErrorPassword1 // エラーがあるか
                          ? errors.password1 // エラーメッセージ
                          : null
                        : isErrorPassword
                        ? errors.password
                        : null
                    }
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
                      error={isErrorPassword2}
                      helperText={isErrorPassword2 ? errors.password2 : null}
                    />
                  ) : null}
                  <Grid container>
                    <Grid item xs>
                      <Link href="#" variant="body2">
                        <span className={classes.link}>
                          パスワードを忘れた方
                        </span>
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link
                        href={isSignup ? "/signin" : "/signup"}
                        variant="body2"
                      >
                        <span className={classes.link}>
                          {isSignup ? "ログインはこちら" : "新規登録はこちら"}
                        </span>
                      </Link>
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={!dirty || isSubmitting}
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                  >
                    {isSignup ? "Sign up" : "Sign in"}
                  </Button>
                </form>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<TwitterIcon />}
                  className={`${classes.twitter}`}
                  onClick={handleTwitterLogin}
                >
                  Twitterで{isSignup ? "登録" : "ログイン"}
                </Button>
              </>
            );
          }}
        </Formik>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default Auth;

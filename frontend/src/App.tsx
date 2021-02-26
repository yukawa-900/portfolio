import React from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { ApolloProvider } from "@apollo/react-hooks";
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
// import theme from "./theme";
import Layout from "./features/layout/Layout";
import Auth from "./features/auth/Auth";
import SocialAuthWaiting from "./features/auth/SocialAuthWaiting";
import Add from "./features/bookkeeping/pages/main/Add";
import Edit from "./features/bookkeeping/pages/main/Edit";
import { changeColorMode, selectIsDarkMode } from "./features/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "./features/auth/authSlice";
import {
  blue,
  cyan,
  purple,
  yellow,
  amber,
  pink,
  orange,
  red,
} from "@material-ui/core/colors";
import Find from "./features/bookkeeping/pages/main/Find";
import CurrencySettings from "./features/bookkeeping/pages/settings/CurrencySettings";
import DepartmentSettings from "./features/bookkeeping/pages/settings/DepartmentSettings";
import AccountSettings from "./features/bookkeeping/pages/settings/AccountSettings";
import Input from "./features/ameba/components/input/Main";

const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const axiosUserContext: any = {};

axios.interceptors.request.use(async (request) => {
  const token = localStorage.getItem("token");
  if (
    request.url?.includes("refresh") ||
    request.url?.includes("twitter") ||
    request.url?.includes("api.exchangeratesapi.io") ||
    request.url?.includes("login") ||
    request.url?.includes("register")
  ) {
    return request;
  }
  if (token) {
    const decodedToken: any = jwt_decode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      await axiosUserContext.dispatch(
        refreshAccessToken({ refresh: localStorage.getItem("refresh") })
      );
      // ローカルストレージから、access token を再取得する必要がある
      request.headers.Authorization = `JWT ${localStorage.getItem("token")}`;
      return request;
    } else {
      // トークンが有効期限OKの場合
      if (!request.url?.includes("dj-rest-auth")) {
        request.headers.Authorization = `JWT ${token}`;
      }
      return request;
    }
  } else {
    // トークンが無い場合

    window.alert("トークンがありません");
    window.location.href = "/signin";
    throw new axios.Cancel(
      "トークンがないためリクエストはキャンセルされました"
    );
  }
});

const client = new ApolloClient<NormalizedCacheObject>({
  uri: `${apiUrl}api/v1/ameba/`,
  headers: {
    authorization: `JWT ${localStorage.getItem("token")}`,
  },
  cache: new InMemoryCache(),
});

function App() {
  // isDarkMode ? "dark" : "light",
  // const osDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const dispatch = useDispatch();
  axiosUserContext.dispatch = dispatch;
  // const localStorageDarkMode = localStorage.getItem("darkMode");
  const isDarkMode = useSelector(selectIsDarkMode);

  const theme = createMuiTheme({
    palette: {
      primary: {
        dark: isDarkMode ? "#555" : blue[700],
        main: isDarkMode ? amber[500] : blue[600],
        light: isDarkMode ? amber[400] : blue[800],
      },
      error: {
        main: isDarkMode ? "#ff3d00" : "#f44336",
      },
      // primary: isDarkMode ? purple : blue,
      secondary: {
        main: isDarkMode ? amber[600] : orange["A200"],
      },
      social: { github: "#171515", twitter: "#00aced" },
      type: isDarkMode ? "dark" : "light",
    },
    overrides: {
      MuiSelect: {
        select: {
          "&:focus": {
            backgroundColor: "inherit",
          },
        },
      },
      MuiPickersToolbar: {
        toolbar: {
          backgroundColor: isDarkMode ? amber[700] : blue[700],
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ApolloProvider client={client}>
          <Switch>
            <Route
              exact
              path="/signin"
              render={() => <Auth isSignup={false} />}
            />
            <Route
              exact
              path="/signup"
              render={() => <Auth isSignup={true} />}
            />
            <Route
              path="/socialauth-waiting"
              render={() => <SocialAuthWaiting />}
            />
            <Route
              path="/app/bookkeeping/edit"
              render={() => (
                <Layout>
                  <Edit />
                </Layout>
              )}
            />
            <Route
              path="/app/bookkeeping/add"
              render={() => (
                <Layout>
                  <Add />
                </Layout>
              )}
            />
            <Route
              path="/app/bookkeeping/find"
              render={() => (
                <Layout>
                  <Find />
                </Layout>
              )}
            />
            <Route
              path="/app/bookkeeping/settings/currency"
              render={() => (
                <Layout>
                  <CurrencySettings />
                </Layout>
              )}
            />
            <Route
              path="/app/bookkeeping/settings/department"
              render={() => (
                <Layout>
                  <DepartmentSettings />
                </Layout>
              )}
            />
            <Route
              path="/app/bookkeeping/settings/account"
              render={() => (
                <Layout>
                  <AccountSettings />
                </Layout>
              )}
            />
            <Route
              path="/app/ameba/input"
              render={() => (
                <Layout>
                  <Input />
                </Layout>
              )}
            />

            {/* pathを指定しない場合、404 Page Not Foundに使われる */}
          </Switch>
        </ApolloProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

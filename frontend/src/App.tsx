import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/react-hooks";
import { amber, blue, indigo, orange } from "@material-ui/core/colors";
import {
  createMuiTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@material-ui/core/styles";
import { createUploadLink } from "apollo-upload-client";
import axios from "axios";
import jwt_decode from "jwt-decode";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NotFound from "./404";
import Dashboard from "./features/ameba/views/dashboard/Main";
import Input from "./features/ameba/views/input/Main";
import AmebaSettings from "./features/ameba/views/settings/Main";
import Auth from "./features/auth/Auth";
import {
  refreshAccessToken,
  selectIsDarkMode,
} from "./features/auth/authSlice";
import SocialAuthWaiting from "./features/auth/SocialAuthWaiting";
import Add from "./features/bookkeeping/pages/main/Add";
import Edit from "./features/bookkeeping/pages/main/Edit";
import Find from "./features/bookkeeping/pages/main/Find";
import AccountSettings from "./features/bookkeeping/pages/settings/AccountSettings";
import CurrencySettings from "./features/bookkeeping/pages/settings/CurrencySettings";
import DepartmentSettings from "./features/bookkeeping/pages/settings/DepartmentSettings";
// import theme from "./theme";
import Layout from "./features/layout/Layout";

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
  // uri: `${apiUrl}/api/v1/ameba/`,
  link: createUploadLink({
    uri: `${apiUrl}/api/v1/ameba/`,
    headers: {
      authorization: `JWT ${localStorage.getItem("token")}`,
    },
  }),
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

function App() {
  // isDarkMode ? "dark" : "light",
  // const osDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const dispatch = useDispatch();
  axiosUserContext.dispatch = dispatch;
  // const localStorageDarkMode = localStorage.getItem("darkMode");
  const isDarkMode = useSelector(selectIsDarkMode);

  let theme = createMuiTheme({
    typography: {
      fontFamily: [
        "-apple-system",
        "M PLUS Rounded 1c",
        "Noto Sans JP",
        "sans-serif",
      ].join(","),

      // 時間があれば、以下を編集して、見栄えをよくする
      h1: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      h2: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      h3: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      h4: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      h5: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      h6: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      subtitle1: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      subtitle2: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      body1: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      body2: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      caption: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      button: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
      overline: {
        fontFamily: '"M PLUS Rounded 1c", "sans-serif"',
      },
    },
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
      MuiAppBar: {
        colorDefault: {
          backgroundColor: isDarkMode ? "#555" : indigo[500],
          color: "#eee",
        },
      },
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
      MuiCardHeader: {
        title: {
          fontFamily: "Noto Sans JP",
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);

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
              path="/app/ameba/dashboard"
              render={() => (
                <Layout>
                  <Dashboard />
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
            <Route
              path="/app/ameba/settings"
              render={() => (
                <Layout>
                  <AmebaSettings />
                </Layout>
              )}
            />

            <Route component={NotFound} />
            {/* pathを指定しない場合、404 Page Not Foundに使われる */}
          </Switch>
        </ApolloProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

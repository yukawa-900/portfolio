import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
// import theme from "./theme";
import Layout from "./features/layout/Layout";
import Auth from "./features/auth/Auth";
import SocialAuthWaiting from "./features/auth/SocialAuthWaiting";
import Add from "./features/bookkeeping/pages/Add";
import Edit from "./features/bookkeeping/pages/Edit";
import { changeColorMode, selectIsDarkMode } from "./features/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
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

function App() {
  // isDarkMode ? "dark" : "light",
  // const osDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const dispatch = useDispatch();
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
        <Switch>
          <Route
            exact
            path="/signin"
            render={() => <Auth isSignup={false} />}
          />
          <Route exact path="/signup" render={() => <Auth isSignup={true} />} />
          <Route
            path="/socialauth-waiting"
            render={() => <SocialAuthWaiting />}
          />
          <Route path="/app/edit" render={() => <Layout main="edit" />} />
          <Route path="/app/add" render={() => <Layout main="add" />} />
          <Route path="/app/find" render={() => <Layout main="find" />} />
          <Route /> {/* pathを指定しない場合、404 Page Not Foundに使われる */}
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;

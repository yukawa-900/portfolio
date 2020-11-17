import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "./features/theme";
import Layout from "./features/layout/Layout";
import Auth from "./features/auth/Auth";
import SocialAuthWaiting from "./features/auth/SocialAuthWaiting";
import Add from "./features/bookkeeping/pages/Add";
import Edit from "./features/bookkeeping/pages/Edit";

function App() {
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

import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "./features/theme";
import Layout from "./features/layout/Layout";
import Auth from "./features/auth/Auth";
import SocialAuthWaiting from "./features/auth/SocialAuthWaiting";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Route exact path="/signin" render={() => <Auth isSignup={false} />} />
        <Route exact path="/signup" render={() => <Auth isSignup={true} />} />
        <Route
          path="/socialauth-waiting"
          render={() => <SocialAuthWaiting />}
        />
        <Route exact path="/" render={() => <Layout />} />
      </Router>
    </ThemeProvider>
  );
}

export default App;

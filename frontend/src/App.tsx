import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Auth from "./features/auth/Auth";
import Layout from "./features/layout/Layout";

function App() {
  return (
    <>
      <Router>
        <Route exact path="/signin" render={() => <Auth isSignup={false} />} />
        <Route exact path="/signup" render={() => <Auth isSignup={true} />} />
        <Route exact path="/" render={() => <Layout />} />
      </Router>
    </>
  );
}

export default App;

import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Add from "../bookkeeping/pages/Add";
import Edit from "../bookkeeping/pages/Edit";

import { useSelector, useDispatch } from "react-redux";

// import {} from "../bookkeeping/bookkeepingSlice";

const Main = () => {
  const dispatch = useDispatch();

  return (
    <Router>
      <Route path="/app/edit" component={Edit} />
      <Route path="/app/add" component={Add} />
      <Route path="/app/filter" />
    </Router>
  );
};

export default Main;

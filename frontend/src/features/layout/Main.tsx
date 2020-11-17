import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Add from "../bookkeeping/pages/Add";
import Edit from "../bookkeeping/pages/Edit";

import { useSelector, useDispatch } from "react-redux";

import {
  fetchAccountInfo,
  selectAccountInfo,
} from "../bookkeeping/bookkeepingSlice";

const Main = () => {
  const accountInfo = useSelector(selectAccountInfo);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!accountInfo.length) {
      console.log(accountInfo.length);
      dispatch(fetchAccountInfo());
    }
  }, []);

  return (
    <Router>
      <Route path="/app/edit" component={Edit} />
      <Route path="/app/add" component={Add} />
      <Route path="/app/filter" />
    </Router>
  );
};

export default Main;

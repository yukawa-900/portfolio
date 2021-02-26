import React, { useEffect } from "react";
import Loading from "./Loading";
import { useDispatch } from "react-redux";
import { fetchTwitterAccessToken } from "./authSlice";
import {
  login,
  register,
  startAuth,
  endAuth,
  selectIsAuthLoading,
  selectIsAuthRejected,
  fetchTwitterURL,
} from "./authSlice";
import {
  fetchAccounts,
  fetchCurrencies,
  fetchDepartments,
  fetchTaxes,
} from "../bookkeeping/activeListSlice";
import { fetchAllActiveItems } from "../bookkeeping/settingsSlice";
import { useHistory } from "react-router-dom";

const SocialAuthWaiting = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const f = async () => {
      const queryString = window.location.search;
      const resultLogin: any = await dispatch(
        fetchTwitterAccessToken(queryString)
      );
      if (fetchTwitterAccessToken.fulfilled.match(resultLogin)) {
        window.location.href = "/app/bookkeeping/add";
      }
      await dispatch(endAuth());
    };
    f();
    // history.push("/app/add");
  }, []);

  return (
    <>
      <Loading />
    </>
  );
};

export default SocialAuthWaiting;

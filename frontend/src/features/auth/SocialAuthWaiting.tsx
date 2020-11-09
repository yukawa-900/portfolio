import React, { useEffect } from "react";
import Loading from "../components/Loading";
import { useDispatch } from "react-redux";
import { fetchTwitterAccessToken } from "./authSlice";

const SocialAuthWaiting = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const queryString = window.location.search;
    dispatch(fetchTwitterAccessToken(queryString));
  });

  return (
    <>
      <Loading />
    </>
  );
};

export default SocialAuthWaiting;

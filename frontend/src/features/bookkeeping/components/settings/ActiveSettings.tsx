import React, { useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import ActiveBox from "./ActiveBox";
import { useSelector, useDispatch } from "react-redux";
import {
  selectActiveCurrencies,
  selectInactiveCurrencies,
  fetchActiveItems,
  activate,
  inactivate,
  updateExclusion,
} from "../../settingsSlice";
import SubmitButton from "../utils/SubmitButton";
import { EXCLUSION_OBJECT } from "../../../types";

const ActiveSettings = ({ items, active, inactive }: any) => {
  const dispatch = useDispatch();

  const setActive = (data: any) =>
    dispatch(activate({ target: items, data: data }));

  const setInactive = (data: Array<any>) =>
    dispatch(inactivate({ target: items, data: data }));

  const handleSubmit = () => {
    const sentData: Array<EXCLUSION_OBJECT> = [];
    for (const item of active) {
      sentData.push({ item: item.id || item.code, isActive: true });
    }
    for (const item of inactive) {
      sentData.push({ item: item.id || item.code, isActive: false });
    }

    dispatch(updateExclusion({ items: items, sentData: sentData }));
  };

  return (
    <Grid container direction="column" spacing={2}>
      <ActiveBox
        active={active}
        setActive={setActive}
        inactive={inactive}
        setInactive={setInactive}
      />
      <Grid container xs item justify="center">
        <Grid item>
          <SubmitButton handleSubmit={handleSubmit} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ActiveSettings;

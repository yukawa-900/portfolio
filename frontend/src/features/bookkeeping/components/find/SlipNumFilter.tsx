import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { useDispatch, useSelector } from "react-redux";
import {
  changeFilteringParams,
  selectFilteringParams,
} from "../../filteringSlice";

const SlipNumFilter: React.FC<{ isSlipNum: boolean }> = ({ isSlipNum }) => {
  const dispatch = useDispatch();
  const params = useSelector(selectFilteringParams);
  return (
    <>
      {isSlipNum ? (
        <Grid
          container
          item
          xs
          justify="center"
          alignItems="center"
          spacing={3}
        >
          <Grid item>
            <TextField
              type="number"
              size="small"
              inputProps={{
                style: { textAlign: "center" },
              }}
              label="伝票番号"
              value={params.slipNum}
              onChange={(e) =>
                dispatch(changeFilteringParams({ slipNum: e.target.value }))
              }
            />
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export default SlipNumFilter;

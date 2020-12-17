import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

const slipNumFilter: React.FC<{ isSlipNum: boolean }> = ({ isSlipNum }) => {
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
            />
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export default slipNumFilter;

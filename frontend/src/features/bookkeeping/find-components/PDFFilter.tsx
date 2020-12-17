import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

const PDFFilter: React.FC<{ isPDF: boolean }> = ({ isPDF }) => {
  return (
    <>
      {isPDF ? (
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
              type="text"
              size="small"
              label="PDF名"
              helperText="最大300KB"
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    style={{ marginRight: "1rem" }}
                  >
                    .pdf
                  </InputAdornment>
                ),
              }}
              inputProps={{
                style: { textAlign: "center" },
              }}
            />
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export default PDFFilter;

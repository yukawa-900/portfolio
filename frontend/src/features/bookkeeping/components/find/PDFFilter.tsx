import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { useDispatch, useSelector } from "react-redux";
import {
  changeFilteringParams,
  selectFilteringParams,
} from "../../filteringSlice";

const PDFFilter: React.FC<{ isPDF: boolean }> = ({ isPDF }) => {
  const dispatch = useDispatch();
  const params = useSelector(selectFilteringParams);
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
              id="pdfName"
              value={params.pdfName}
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
              onChange={(e) =>
                dispatch(changeFilteringParams({ pdfName: e.target.value }))
              }
            />
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export default PDFFilter;

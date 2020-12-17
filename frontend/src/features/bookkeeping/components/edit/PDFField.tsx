import React from "react";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import { useDispatch } from "react-redux";
import { changePDF } from "../../bookkeepingSlice";

const useStyles = makeStyles((theme) => ({
  pdfButton: {
    margin: theme.spacing(0, 0, 0, -1.2),
    width: "2.8rem",
    height: "2.8rem",
  },
  pdfIcon: {
    fontSize: "2.2rem",
    cursor: "pointer",
  },
}));

const PDFField: React.FC<{
  PDF: File | null;
  setPDF: React.Dispatch<React.SetStateAction<File | null>>;
}> = ({ PDF, setPDF }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const isError = PDF ? PDF.size > 300000 : false; // 最大300KB

  return (
    <Grid item style={{ alignSelf: "center" }}>
      <Tooltip title="請求書PDF" placement="top">
        <IconButton className={classes.pdfButton}>
          <label htmlFor="pdfInput">
            <PictureAsPdfIcon
              color={!PDF ? "inherit" : isError ? "error" : "primary"}
              className={classes.pdfIcon}
            />
          </label>
        </IconButton>
      </Tooltip>

      <input
        id="pdfInput"
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          setPDF(e.target.files![0]);
        }}
      />
    </Grid>
  );
};

export default PDFField;

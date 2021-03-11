import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Slide from "@material-ui/core/Slide";
import Slider from "@material-ui/core/Slider";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import { TransitionProps } from "@material-ui/core/transitions";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cropperContainer: {
    position: "absolute",
    bottom: 200,
    top: 0,
    left: 0,
    right: 0,
  },
  sliderContainer: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: "100%",
    maxWidth: 600,
    transform: "translateX(-50%)",
    height: 320,
    display: "flex",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    left: "50%",
    transform: "translateX(-50%)",
  },
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CropperDialog = ({
  isDialogOpen,
  handleClose,
  inputImgSrc,
  getBlob,
  handleEndCropping,
  setCroppedImgSrc,
}: any) => {
  const classes = useStyles();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    const croppedImage = await getCroppedImg(inputImgSrc, croppedAreaPixels);
    setCroppedImgSrc(URL.createObjectURL(croppedImage));
    getBlob(croppedImage); // 内部でsetFieldValue(Formik)
  };

  // const imageSrc = useSelector(selectImageSrc);

  // useEffect(() => {
  //   console.log(imageSrc);
  // }, [imageSrc]);

  return (
    <>
      <Dialog
        fullScreen
        open={isDialogOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              画像を切り抜く
            </Typography>
            <Button autoFocus color="inherit" onClick={handleEndCropping}>
              OK
            </Button>
          </Toolbar>
        </AppBar>
        <div className={classes.root}>
          <div className={classes.cropperContainer}>
            <Cropper
              image={inputImgSrc}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className={classes.sliderContainer}>
            <Grid container spacing={3} justify="center">
              <Grid item>
                <ZoomOutIcon style={{ height: "100%" }} />
              </Grid>
              <Grid item xs={6}>
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e, zoom: any) => setZoom(zoom)}
                  // classes={{ container: "slider" }}
                />
              </Grid>
              <Grid item>
                <ZoomInIcon style={{ height: "100%" }} />
              </Grid>
            </Grid>
          </div>
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={handleEndCropping}
            >
              切り抜く
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CropperDialog;

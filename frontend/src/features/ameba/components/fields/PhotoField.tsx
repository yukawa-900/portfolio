import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Grid from "@material-ui/core/Grid";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setState } from "../../amebaSlice";
import CropperDialog from "../photoCrop/CropperDialog";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(16),
    height: theme.spacing(16),
    cursor: "pointer",
    [theme.breakpoints.down("sm")]: {
      width: theme.spacing(14),
      height: theme.spacing(14),
    },
    [theme.breakpoints.down("xs")]: {
      width: theme.spacing(12),
      height: theme.spacing(12),
    },
  },
  undefinedIcon: {
    fontSize: "4.2rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "3.2rem",
    },
  },
  photoIcon: {
    fontSize: "1.5rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.2rem",
    },
  },
  input: {
    display: "none",
    visibility: "hidden",
  },
}));

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 42,
    height: 42,
    border: `2px solid ${theme.palette.background.paper}`,
    cursor: "pointer",
    [theme.breakpoints.down("xs")]: {
      width: 34,
      height: 34,
    },
  },
}))(Avatar);

// const apiUrl = process.env.REACT_APP_API_ENDPOINT!;

const PhotoField = ({
  values,
  yupKey,
  setFieldValue,
  size,
  photoUrl,
  UndefinedAvatar,
}: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down("xs"));
  const dispatch = useDispatch();
  const initialValue = values[yupKey];
  // const [imageSrc, setImageSrc] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [inputImgSrc, setInputImgSrc] = useState<any>("");
  const [croppedImgSrc, setCroppedImgSrc] = useState<any>("");
  const getBlob = (blob: Blob) => {
    // pass blob up from the ImageCropper component

    setBlob(blob);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleEndCropping = () => {
    if (blob) {
      setFieldValue(yupKey, new File([blob], fileName));
    }
    handleClose();
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // setFieldValue(yupKey, e.target.files![0]);
    const file = e.target.files![0];
    const reader = new FileReader();

    // 読み込み成功時に実行されるイベント
    reader.addEventListener(
      "load",
      () => {
        setInputImgSrc(reader.result);
      },
      false
    );

    if (file) {
      // 読み込みの開始
      reader.readAsDataURL(file);
      // MDNより: readAsDataURLについて
      // ファイルのデータを表す、base64 エンコーディングされた data: URL の文字列が格納されます。

      setIsDialogOpen(true);
      setCroppedImgSrc(""); // 初期化
      setFileName(file.name);

      dispatch(setState({ target: "isPhotoEdited", data: true }));
    }
  };

  return (
    <>
      <Grid container justify="center">
        <Grid item>
          <label htmlFor="photo">
            <Badge
              overlap="circle"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              badgeContent={
                <SmallAvatar>
                  <AddAPhotoIcon className={classes.photoIcon} />
                </SmallAvatar>
              }
            >
              <Avatar
                src={croppedImgSrc ? croppedImgSrc : `${photoUrl}`}
                className={classes.avatar}
              >
                <UndefinedAvatar className={classes.undefinedIcon} />
              </Avatar>
            </Badge>
          </label>
          <input
            id="photo"
            type="file"
            accept="image/png,image/jpeg"
            className={classes.input}
            onClick={(e) => {
              e.currentTarget.value = ""; // 同じファイルを2回続けて選んでも、onChangeイベントが発火するために必要
            }}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
      <CropperDialog
        isDialogOpen={isDialogOpen}
        handleClose={handleClose}
        getBlob={getBlob}
        inputImgSrc={inputImgSrc}
        // setFieldValue={setFieldValue}
        setCroppedImgSrc={setCroppedImgSrc}
        handleEndCropping={handleEndCropping}
      />
    </>
  );
};

export default PhotoField;

PhotoField.defaultProps = {
  size: "medium",
};

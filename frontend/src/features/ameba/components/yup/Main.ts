import * as Yup from "yup";

const BLANK_MESSAGE = "空欄です";
const FILE_SIZE = 2048 * 2048;
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

export const yupStringObject = Yup.string()
  .typeError("正しく入力してください")
  .required(BLANK_MESSAGE);

export const yupNumberObject = Yup.number()
  .typeError("数字を入力してください")
  .required(BLANK_MESSAGE);

export const getMaxStringMessage = (limit: number) => {
  return `最大${limit}文字です`;
};

export const yupPhotoObject = Yup.mixed().test(
  "fileSize",
  "ファイルサイズが大きすぎます",
  (value) => {
    if (!value) {
      return true; // ファイルが存在しなくてもOK
    }
    return value.size <= FILE_SIZE;
  } // valueにはファイルオブジェクトが入る
);

// create the image with a src of the base64 string
const createImage = (url) =>
  new Promise((resolve, reject) => {
    // MDNより: It is functionally equivalent to document.createElement('img').
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export const getCroppedImg = async (imageSrc, crop) => {
  const image = await createImage(imageSrc);

  // HTMLで<canvas>要素を作成
  const canvas = document.createElement("canvas");

  // 描画機能を有効にする。 getContextメソッドに指定できる引数は '2d' のみ。
  const ctx = canvas.getContext("2d");

  // バックエンド側でも 500 / 500 に resizeされるが・・
  canvas.width = 500;
  canvas.height = 500;

  // cropデータを元に、画像を描画
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    // canvasの画像をBlobオブジェクトに変換
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

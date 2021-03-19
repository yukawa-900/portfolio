export const numberAccept = /[\d.]+/g;

export const parseNumber = (string: string) => {
  return (string.match(numberAccept) || []).join("");
};

export const formatFloatingPointNumber = (
  value: string,
  maxDigits: number,
  currency: any
) => {
  const parsed = parseNumber(value);

  const [head, tail] = parsed.split(".");
  const scaledTail = tail != null ? tail.slice(0, maxDigits) : "";

  const number = Number.parseFloat(`${head}.${scaledTail}`);

  if (Number.isNaN(number)) {
    return "";
  }

  const formatted = number.toLocaleString("ja-JP", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  });

  if (parsed.includes(".")) {
    const [formattedHead] = formatted.split(".");

    // skip zero at digits position for non fixed floats
    // as at digits 2 for non fixed floats numbers like 1.50 has no sense, just 1.5 allowed
    // but 1.0 has sense as otherwise you will not be able to enter 1.05 for example
    const formattedTail =
      scaledTail !== "" && scaledTail[maxDigits - 1] === "0"
        ? scaledTail.slice(0, -1)
        : scaledTail;

    if (formattedTail) {
      return `${formattedHead}.${formattedTail}`;
    } else {
      return `${formattedHead}`;
    }
  }
  return formatted;
};

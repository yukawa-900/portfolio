import { ValueFormatterParams } from "@material-ui/data-grid";
import { formatFloatingPointNumber } from "../../utils/moneyFormatter";

export const yenFormatter = (params: ValueFormatterParams) =>
  formatFloatingPointNumber(String(params.value), 0, "JPY");

export const hoursFormatter = (params: ValueFormatterParams) =>
  String(params.value) + " 時間";

export const numFormatter = (params: ValueFormatterParams) =>
  String(params.value) + " 個";

export const employeePositionFormatter = (params: ValueFormatterParams) => {
  if (params.value === "A_0") {
    return "正社員";
  } else {
    return "アルバイト";
  }
};

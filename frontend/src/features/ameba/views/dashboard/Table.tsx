import React from "react";
import Table from "../../../bookkeeping/components/read/BaseTable";
import TableRow from "./TableRow";
import { headCells } from "./TableHeadCells";
import TransacTableHead from "../../../bookkeeping/components/utils/TransacTableHead";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Loading from "../../../auth/Loading";
import { selectSelectedDate, selectIsMonth } from "../../amebaSlice";
import { useSelector } from "react-redux";

const TransacTable = ({ data, loading }: any) => {
  const date = useSelector(selectSelectedDate);
  const isMonth = useSelector(selectIsMonth);
  return (
    <Card>
      <CardHeader
        title={"採算表"}
        subheader={isMonth ? date.split("-")[1] + "月" : date}
      />
      <CardContent
        style={{ minHeight: 300, position: "relative", overflow: "scroll" }}
      >
        <Divider />
        {loading ? (
          <Loading size="3rem" />
        ) : (
          data && (
            <Table
              TableHead={TransacTableHead}
              Row={TableRow}
              rows={data.table}
              headCells={headCells(isMonth)}
              isFooter={false}
              elevation={0}
            />
          )
        )}
      </CardContent>
    </Card>
  );
};

export default TransacTable;

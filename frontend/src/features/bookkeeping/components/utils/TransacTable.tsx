import React from "react";
import Table from "../../components/read/BaseTable";
import { headCells } from "../../components/utils/TransacHeadCells";
import TransacRow from "../../components/utils/TransacRow";
import TransacTableHead from "../../components/utils/TransacTableHead";

const TransacTable = ({ rows }: any) => {
  return (
    <Table
      TableHead={TransacTableHead}
      Row={TransacRow}
      rows={rows}
      headCells={headCells}
    />
  );
};

export default TransacTable;

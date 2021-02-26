import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "formik";
import { TextField } from "formik-material-ui";
import MenuItem from "@material-ui/core/MenuItem";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { selectSalesUnits } from "../../../amebaSlice";
import {
  numberAccept,
  parseNumber,
  formatFloatingPointNumber,
} from "../../../../utils/moneyFormatter";

const SalesUnitField = ({ values, setFieldValue }: any) => {
  const salesUnits = useSelector(selectSalesUnits);
  const [selectedName, setSelectedName] = useState("");

  return (
    <Field
      component={TextField}
      select
      autoFocus
      autoComplete="off"
      name="item"
      label="売上項目"
      type="text"
      margin="normal"
      variant="outlined"
      fullWidth
      SelectProps={{
        renderValue: (value: any) => selectedName,
      }}
      value={values.item}
      onChange={(e: any) => setFieldValue("item", e.target.value)}
    >
      {salesUnits?.map((option: any) => (
        <MenuItem
          key={option.node.id}
          value={option.node.id}
          onClick={() => {
            setSelectedName(option.node.name);
          }}
        >
          <>
            <ListItem>
              <ListItemText
                primary={option.node.name}
                secondary={`${formatFloatingPointNumber(
                  String(option.node.unitPrice),
                  0,
                  "JPY"
                )}`}
              />
            </ListItem>
          </>
        </MenuItem>
      ))}
    </Field>
  );
};

export default SalesUnitField;

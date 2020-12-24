import React from "react";
import SwipeableViews from "react-swipeable-views";
import Paper from "@material-ui/core/Paper";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export const a11yProps = (name: string, index: number) => {
  return {
    id: `${name}-tab-${index}`,
    "aria-controls": `${name}-tabpanel-${index}`,
  };
};

const useStyles = makeStyles((theme) => ({
  root: {
    // backgroundColor: theme.palette.b ackground.paper,
  },
}));

export default function CustomTabs({ name, labels, children }: any) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <div className={classes.root}>
      <Paper>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isSmDown ? "fullWidth" : "standard"} // 小さな画面サイズ
          centered={!isSmDown} //大きな画面サイズ
          aria-label="full width tabs example"
        >
          {labels.map((label: string, index: number) => (
            <Tab label={label} {...a11yProps(name, index)} />
          ))}
        </Tabs>
      </Paper>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {children.map((child: any, index: number) => (
          <TabPanel value={value} index={index} dir={theme.direction}>
            {child}
          </TabPanel>
        ))}
      </SwipeableViews>
    </div>
  );
}

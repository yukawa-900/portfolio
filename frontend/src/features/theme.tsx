import { createMuiTheme } from "@material-ui/core/styles";

//TypeScript用
// 参考リンク https://stackoverflow.com/questions/59365396/how-to-use-material-ui-custom-theme-in-react-with-typescript
declare module "@material-ui/core/styles/createPalette" {
  export interface Palette {
    social: {
      github: string;
      twitter: string;
    };
  }
  export interface PaletteOptions {
    social: {
      github: string;
      twitter: string;
    };
  }
}

const theme = createMuiTheme({
  palette: {
    social: { github: "#171515", twitter: "#00aced" },
  },
});

export default theme;

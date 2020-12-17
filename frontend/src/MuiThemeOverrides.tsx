import { MuiPickersOverrides } from "@material-ui/pickers/typings/overrides";

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

type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};

declare module "@material-ui/core/styles/overrides" {
  export interface ComponentNameToClassKey extends overridesNameToClassKey {}
}

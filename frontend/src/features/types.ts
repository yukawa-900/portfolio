/*Auth */

export type PROPS_AUTH_COMPONENT = {
  isSignup: boolean;
};

export type PROPS_AUTH_SIGNIN = {
  email: string;
  password: string;
};

export type PROPS_AUTH_SIGNUP = {
  email: string;
  password1: string;
  password2: string;
};

export type PROPS_BOOKKEEPING_FIELD = {
  index: Number;
};

export type INFO_OBJECT = {
  id: string;
  name: string;
  furigana: string;
  categoryName: string;
  description: string | null;
};

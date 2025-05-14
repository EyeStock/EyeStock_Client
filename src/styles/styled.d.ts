import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    color: {
      primary: string;
      black: string;
      white: string;
    };
    font: {
      regular: string;
    };
  }
}

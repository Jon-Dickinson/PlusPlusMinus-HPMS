// Temporary shim to allow plain JSX intrinsic elements throughout the frontend
// This relaxes strict JSX intrinsic element typing so you can refactor to styled-components later.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

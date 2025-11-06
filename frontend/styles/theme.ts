// The theme system is set up correctly for styled-components usage. 
// If more components start using theme values in the future, 
// this foundation is already in place.

const theme = {
  colors: {
    primary: '#2D6AFC',
    background: '#F6F8FA',
    text: '#0F172A',
    muted: '#6B7280',
  },
  spacing: (n: number) => `${n * 8}px`,
};

export default theme;

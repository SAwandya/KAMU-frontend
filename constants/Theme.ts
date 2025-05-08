const palette = {
  primary: {
    main: "#1F5135", // Elegant deep green
    light: "#3D7B57", // Slightly lighter for hover states
    dark: "#153828", // Very deep for nav, footers
    contrast: "#FFFFFF",
  },

  secondary: {
    main: "#6BA88E", // Soft sage green
    light: "#88BBA1", // Brighter minty-sage
    dark: "#4C8A72", // Muted olive green
    contrast: "#FFFFFF",
  },

  neutral: {
    white: "#FFFFFF",
    background: "#F9F9F7", // Slight off-white with warmth
    lightGrey: "#EAEAE5",
    grey: "#C5C5BD",
    mediumGrey: "#8F8F88",
    darkGrey: "#4A4A44",
    black: "#1A1A1A",
  },

  status: {
    success: "#3D7B57", // Match primary light
    warning: "#A2B78F", // Desaturated green-yellow for softer warning
    error: "#C04040",
    info: "#5B9C8A", // Teal-leaning info tone
  },

  accent: {
    lightGreen: "#D9E7DF", // Soft mint background
    lightSage: "#E5F0EA", // Replacing lightGold
  },
};

// Typography
const typography = {
  fontFamily: {
    regular: "Poppins-Regular",
    medium: "Poppins-Medium",
    semiBold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ...rest of the theme file

// Spacing system
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};

// Shadows - Very subtle for minimalist look
const shadows = {
  sm: {
    shadowColor: palette.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: palette.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Theme object
const theme = {
  palette,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;

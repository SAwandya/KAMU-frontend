import theme from "./Theme";

const tintColorLight = theme.palette.primary.main;
const tintColorDark = theme.palette.primary.light;

export default {
  light: {
    text: theme.palette.neutral.black,
    background: theme.palette.neutral.background,
    tint: tintColorLight,
    tabIconDefault: theme.palette.neutral.mediumGrey,
    tabIconSelected: tintColorLight,
    card: theme.palette.neutral.white,
    border: theme.palette.neutral.lightGrey,
    notification: theme.palette.status.error,
  },
  dark: {
    text: theme.palette.neutral.white,
    background: "#121212",
    tint: tintColorDark,
    tabIconDefault: theme.palette.neutral.grey,
    tabIconSelected: tintColorDark,
    card: "#1E1E1E",
    border: "#2E2E2E",
    notification: theme.palette.status.error,
  },
};

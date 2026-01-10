import { useTheme } from "../../lib/theme/ThemeProvider";

/**
 * Zyncro brand logo.
 *  - light surfaces → logo_color.png
 *  - dark surfaces  → logo_lite.png
 */
export default function BrandLogo({ className = "h-9 w-auto", alt = "Zyncro ERP", forceDark = false }) {
  const { isDark } = useTheme();
  const useLite = forceDark || isDark;

  return (
    <img
      src={useLite ? "/assets/logos/logo_lite.png" : "/assets/logos/logo_color.png"}
      alt={alt}
      className={`${className} object-contain`}
    />
  );
}

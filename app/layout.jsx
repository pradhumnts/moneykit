import { Plus_Jakarta_Sans } from "next/font/google";
import { SyncGate } from "@/providers/SyncGate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import {
  APP_APPLE_TOUCH_ICON,
  APP_DESCRIPTION,
  APP_ICON_SVG,
  APP_NAME,
  BACKGROUND_COLOR,
  THEME_COLOR,
} from "@/constants/branding";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: APP_ICON_SVG, type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: APP_APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }],
    shortcut: APP_ICON_SVG,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
      style={{ ["--font-heading"]: "var(--font-sans)" }}
    >
      <body
        className="min-h-full font-sans text-foreground"
        style={{ backgroundColor: BACKGROUND_COLOR }}
      >
        <TooltipProvider>
          <SyncGate>
            {children}
            <Toaster richColors closeButton position="top-center" />
            <ServiceWorkerRegister />
          </SyncGate>
        </TooltipProvider>
      </body>
    </html>
  );
}

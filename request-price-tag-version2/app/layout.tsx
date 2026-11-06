
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

// Prompt Font
const prompt = localFont({
  src: [
    {
      path: "./fonts/Prompt,Roboto/Prompt/Prompt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Prompt,Roboto/Prompt/Prompt-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Prompt,Roboto/Prompt/Prompt-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Prompt,Roboto/Prompt/Prompt-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-prompt-local",
  display: "swap",
});

// Roboto Font
const roboto = localFont({
  src: "./fonts/Prompt,Roboto/Roboto/Roboto-VariableFont_wdth,wght.ttf",
  variable: "--font-roboto-local",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: "Request Price Tag",
  description: "Request Price Tag System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

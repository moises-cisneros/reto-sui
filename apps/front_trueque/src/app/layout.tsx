import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Centro de Trueque - Sui dApp",
  description: "Intercambia objetos digitales de forma descentralizada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
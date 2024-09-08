import './global.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'NASDAQ Paper Trading App',
  description: 'A paper trading app for the NASDAQ stock exchange.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Header included globally */}
        <Header/>
        {/* Render children */}
        {children}
      </body>
    </html>
  );
}

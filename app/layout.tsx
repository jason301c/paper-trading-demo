import './global.css'
export const metadata = {
  title: 'NASDAQ Paper Trading App',
  description: 'A paper trading app for the NASDAQ stock exchange.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

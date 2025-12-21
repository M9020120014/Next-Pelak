
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Layout ------------------------------------------------ */
export default async function TestLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}


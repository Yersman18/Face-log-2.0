export const metadata = {
  title: "Face Log",
  description: "Sistema de Control de Asistencia con Reconocimiento Facial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Bootstrap Icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}

        {/* Bootstrap JS */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </body>
    </html>
  );
}

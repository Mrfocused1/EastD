export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the main admin layout
  return <>{children}</>;
}

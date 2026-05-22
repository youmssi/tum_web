export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

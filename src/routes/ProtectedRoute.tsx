import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  // TODO: later replace with real auth check (token/session)
  const isAuthed = true;

  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default ProtectedRoute;

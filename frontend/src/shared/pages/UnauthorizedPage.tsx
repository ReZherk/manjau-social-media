import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-wine mb-4">401</h1>
        <p className="text-text-muted mb-6">No autorizado</p>
        <Link to="/login" className="btn-primary">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}

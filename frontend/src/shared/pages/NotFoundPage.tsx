import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-wine mb-4">404</h1>
        <p className="text-text-muted mb-6">Página no encontrada</p>
        <Link to="/login" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

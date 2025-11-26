
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <img 
          src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
          alt="Nueva Generación Logo" 
          className="h-24 w-auto mx-auto mb-6"
          width={96}
          height={96}
          fetchPriority="high"
        />
        <h1 className="text-4xl font-bold mb-4 text-nuevagen-blue">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button asChild className="btn-primary">
          <Link to="/dashboard">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

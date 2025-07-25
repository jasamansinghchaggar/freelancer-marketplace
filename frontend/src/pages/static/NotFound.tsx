import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-3 sm:mb-4">404</div>
        <div className="text-lg sm:text-xl font-medium mb-4 sm:mb-6">Page Not Found</div>
        <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          variant="outline" 
          className="text-sm sm:text-base w-full sm:w-auto" 
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

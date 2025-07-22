import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-[5rem] font-bold mb-2">404</div>
      <div className="text-xl font-medium mb-6">Page Not Found</div>
      <Button variant="outline" className="text-base" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;

import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-[5rem] font-bold mb-2">404</div>
      <div className="text-xl font-medium mb-6">Page Not Found</div>
      <Button variant="outline" className="text-base" onClick={() => window.location.href = '/'}>
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;

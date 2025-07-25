
import React from "react";
import { useAuth } from "../context/AuthContext";
import { RiGoogleFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";

const GoogleSignInButton: React.FC = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <Button
      type="button"
      onClick={loginWithGoogle}
      variant="outline"
      className="w-full mb-5 flex items-center gap-3 bg-background text-foreground border-border font-medium"
      style={{
        // If you want a custom color, use a CSS variable like var(--google-btn-bg)
      }}
    >
      <RiGoogleFill className="h-5 w-5" />
      Continue with Google
    </Button>
  );
};

export default GoogleSignInButton;

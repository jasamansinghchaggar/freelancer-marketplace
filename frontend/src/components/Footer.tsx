import React from 'react';
import { RiCopyrightLine } from '@remixicon/react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full h-[10vh] bg-background border-t border-border py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <RiCopyrightLine />
        <span>{new Date().getFullYear()} Freelancer Marketplace. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;

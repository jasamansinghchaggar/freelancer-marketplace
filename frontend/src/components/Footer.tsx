import React from 'react';
import { RiCopyrightLine, RiGithubLine, RiLinkedinLine, RiTwitterLine } from '@remixicon/react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Freelancer Marketplace
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Connect talented freelancers with clients worldwide. Build your career or find the perfect talent for your next project.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <RiGithubLine className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <RiLinkedinLine className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <RiTwitterLine className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              For Freelancers
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/gigs" className="hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-foreground transition-colors">
                  Join as Freelancer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              For Clients
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/gigs/new" className="hover:text-foreground transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-foreground transition-colors">
                  Hire Freelancers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 md:mb-0">
            <RiCopyrightLine className="w-4 h-4" />
            <span>{currentYear} Freelancer Marketplace. All rights reserved.</span>
          </div>
          
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

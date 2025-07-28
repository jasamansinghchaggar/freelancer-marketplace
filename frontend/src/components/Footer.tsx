import React from 'react';
import { RiCopyrightLine, RiGithubLine, RiLinkedinLine, RiTwitterLine } from '@remixicon/react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth()

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

          {user?.role === "freelancer" && <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              For Freelancers
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/sales" className="hover:text-foreground transition-colors">
                  Sales
                </Link>
              </li>
              <li>
                <Link to="/my-gigs" className="hover:text-foreground transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>}

          {user?.role === "client" && <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              For Clients
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/purchased-gigs" className="hover:text-foreground transition-colors">
                  Purchases
                </Link>
              </li>
              <li>
                <Link to="/gigs" className="hover:text-foreground transition-colors">
                  Hire Freelancers
                </Link>
              </li>
            </ul>
          </div>}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-start pt-6 border-t border-border">
          <div className="hidden sm:flex sm:items-center sm:space-x-2 sm:text-sm sm:text-muted-foreground sm:mb-4 md:mb-0">
            <RiCopyrightLine className="w-4 h-4" />
            <span>{currentYear} Freelancer Marketplace. All rights reserved.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4.5 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-foreground transition-colors">
              Terms and Conditions
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

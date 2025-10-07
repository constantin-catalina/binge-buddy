import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Github, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-white/10 px-6 md:px-16 lg:px-36 py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo + About */}
        <div>
          <h3 className="text-white font-semibold mb-4">About us</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            BingeBuddy is your go-to platform to track your favorite shows, discover new content, and connect with fellow binge watchers. Sync watch history across devices and never miss an episode again.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-white font-semibold mb-4">Explore</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/movies" className="hover:text-white">Movies</Link></li>
            <li><Link to="/series" className="hover:text-white">TV Shows</Link></li>
            <li><Link to="/discover" className="hover:text-white">Discover</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> support@bingebuddy.tv
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +1 (555) 123-4567
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Follow Us</h3>
          <div className="flex gap-4 text-white/70">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <Instagram className="w-5 h-5"/>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <Facebook className="w-5 h-5"/>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-12 border-t border-white/10 pt-6 text-sm text-center text-white/60">
        © {new Date().getFullYear()} BingeBuddy. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

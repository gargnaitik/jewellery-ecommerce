import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './Footer.css';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Jewellery', to: '/products' },
    { label: 'Rings', to: '/products?category=rings' },
    { label: 'Necklaces', to: '/products?category=necklaces' },
    { label: 'Earrings', to: '/products?category=earrings' },
    { label: 'Bangles', to: '/products?category=bangles' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Gold Rate Today', to: '/gold-rate' },
    { label: 'Store Locator', to: '/stores' },
    { label: 'Careers', to: '/careers' },
  ],
  Help: [
    { label: 'Contact Us', to: '/contact' },
    { label: 'Shipping & Returns', to: '/shipping' },
    { label: 'FAQs', to: '/faq' },
    { label: 'Size Guide', to: '/size-guide' },
  ],
};

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Trust strip */}
      <div className="footer-trust">
        <div className="footer-trust__inner">
          {[
            { icon: '🏆', title: 'BIS Hallmarked', sub: '916 Certified Gold' },
            { icon: '🚚', title: 'Free Shipping', sub: 'On orders above ₹10,000' },
            { icon: '🔄', title: 'Easy Returns', sub: '15-day return policy' },
            { icon: '🔒', title: 'Secure Payments', sub: 'Razorpay protected' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="footer-trust__item">
              <span className="footer-trust__icon">{icon}</span>
              <div>
                <span className="footer-trust__title">{title}</span>
                <span className="footer-trust__sub">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-main">
        <div className="footer-main__inner">
          {/* Brand column */}
          <div className="footer-brand">
            <Link to="/" className="footer-brand__logo">
              <span className="footer-brand__name">Kanakam</span>
              <span className="footer-brand__tagline">Fine Jewellery</span>
            </Link>
            <p className="footer-brand__desc">
              Crafting timeless elegance with BIS hallmarked gold and ethically sourced diamonds since 2020.
            </p>
            <div className="footer-brand__contact">
              <a href="mailto:hello@kanakam.com" className="footer-brand__contact-item">
                <Mail size={14} />
                hello@kanakam.com
              </a>
              <a href="tel:+911234567890" className="footer-brand__contact-item">
                <Phone size={14} />
                +91 12345 67890
              </a>
              <span className="footer-brand__contact-item">
                <MapPin size={14} />
                Mumbai, India
              </span>
            </div>
            <div className="footer-brand__socials">
              <a href="#" aria-label="Instagram" className="footer-social-btn"><FaInstagram size={18} /></a>
              <a href="#" aria-label="Facebook" className="footer-social-btn"><FaFacebook size={18} /></a>
              <a href="#" aria-label="Twitter" className="footer-social-btn"><FaTwitter size={18} /></a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <h4 className="footer-col__title">{heading}</h4>
              <ul className="footer-col__list">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="footer-col__link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom__inner">
          <p className="footer-bottom__copy">
            © {new Date().getFullYear()} Kanakam Fine Jewellery. All rights reserved.
          </p>
          <div className="footer-bottom__links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

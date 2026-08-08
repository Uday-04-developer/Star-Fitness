import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            Star <span className={styles.logoAccent}>Fitness</span>
          </Link>
          <p className={styles.tagline}>
            Premium training. Clear memberships. Real results.
          </p>
        </div>

        <div className={styles.contact}>
          <p className={styles.contactLabel}>Visit us</p>
          <p className={styles.contactText}>
            Star Fitness Main Branch, 
            <br />
            Near Old Cresent, Main Road, Sehore
          </p>
          <p className={styles.contactText}>
            <a href="tel:+916263119717" className={styles.contactLink}>
              +91 62631 19717
            </a>
          </p>
        </div>

        <div className={styles.links}>
          <p className={styles.contactLabel}>Explore</p>
          <Link to="/" className={styles.footerLink}>
            Home
          </Link>
          <Link to="/about" className={styles.footerLink}>
            About
          </Link>
          <Link to="/register" className={styles.footerLink}>
            Join Now
          </Link>
          <Link to="/login" className={styles.staffLink}>
            Staff login
          </Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {year} Star Fitness Gym. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

const NavLink = ({ to, children }) => (
  <Link {...{ to }} activeClassName="text-bold" className="btn btn-link">
    {children}
  </Link>
);

const Header = ({ siteTitle }) => (
  <header className="navbar">
    <section className="navbar-section">
      <span className="navbar-brand mr-2">{siteTitle}</span>
      <NavLink to="/">Cooking</NavLink>
      <NavLink to="/chemistry">Chemistry</NavLink>
    </section>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;

import React from 'react';
import './Loader.css';
import logo from '../assets/Logo_LNMIIT2.png';

export default function Loader() {
  return (
    <div className="loader-overlay">
      <img src={logo} alt="LNMIIT Logo" className="loader-logo" />
    </div>
  );
}

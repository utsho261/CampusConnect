import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--page-background)",
        color: "var(--primary-text)",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <Navbar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
};

export default Layout;
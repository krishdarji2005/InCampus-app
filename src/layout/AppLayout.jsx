import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
      <Navbar></Navbar>
      <main style={{ minHeight: "calc(100vh - [footer-height])" }}>
        <Outlet />
      </main>
      <Footer></Footer>
    </>
  );
};

export default AppLayout;

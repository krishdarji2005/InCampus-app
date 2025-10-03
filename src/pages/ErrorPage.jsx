import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import Dock from "../components/Dock/Dock";
import { VscAccount, VscArchive, VscHome, VscSettingsGear } from "react-icons/vsc";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const items = [
    {
      icon: <VscHome size={18} />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      icon: <VscArchive size={18} />,
      label: "Archive",
      onClick: () => navigate("/events"),
    },
    {
      icon: <VscAccount size={18} />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      icon: <VscSettingsGear size={18} />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#18181b",
      }}
    >
      <div
        style={{
          marginTop: "80px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "2rem",
            fontWeight: 500,
            letterSpacing: "1px",
          }}
        >
          {console.log(error)}
          { error?.data}
          {/* {error?.statusText || error?.message || "Something went wrong."} */}
        </span>
        <br></br>
        <br></br>
        <br></br>
        <span
          style={{
            color: "white",
            fontSize: "2rem",
            fontWeight: 200,
            letterSpacing: "1px",
            marginTop:"5em",
            //  display: "inline-block"
          }}
        >
         Go to 
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin : '0 auto'
        }}
      >
        <Dock
          items={items}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    </div>
  );
};

export default ErrorPage;
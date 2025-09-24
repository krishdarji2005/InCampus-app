import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log to an error reporting service here
    // console.error("ErrorBoundary caught", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0C0A09",
          color: "#fff",
          padding: "2rem"
        }}>
          <div style={{
            maxWidth: 560,
            textAlign: "center",
            padding: "2rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💥</div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Something went wrong</h1>
            <p style={{ opacity: 0.85, marginTop: 8 }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() =>window.location.href = "/events"}
              style={{
                marginTop: 16,
                padding: "0.6rem 1rem",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;



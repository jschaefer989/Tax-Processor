import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error });
    console.error(
      "Unhandled UI error captured by ErrorBoundary:",
      error,
      errorInfo,
    );
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      const message =
        this.state.error?.message ?? "An unexpected error occurred.";
      const stack = this.state.error?.stack;
      const isDevelopment = import.meta.env.DEV;
      const name = "jschaefer989";
      const domain = "gmail.com";
      const subject = encodeURIComponent("Tax Clarity Bug Report");
      const body = encodeURIComponent(
        `${message}\n\n${stack ?? ""}\n\n[Please describe what you were doing when the error occurred and any other relevant details.]\n\nThank you!`,
      );

      return (
        this.props.fallback ?? (
          <div
            role="alert"
            style={{
              boxSizing: "border-box",
              maxWidth: "980px",
              margin: "2rem auto",
              padding: "1.25rem",
              border: "1px solid #e5a4a4",
              background: "#fff4f4",
              borderRadius: "10px",
              color: "#2a1010",
              fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
              lineHeight: 1.45,
              boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                color: "#6f1111",
                fontSize: "1.6rem",
              }}
            >
              Something went wrong
            </h2>
            <p style={{ marginTop: 0, marginBottom: "0.9rem", color: "#311515" }}>
              {message}
            </p>
            {isDevelopment && stack ? (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "0.82rem",
                  color: "#1a1a1a",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  overflowX: "auto",
                  fontFamily: "Consolas, Monaco, 'Courier New', monospace",
                }}
              >
                {stack}
              </pre>
            ) : null}
            <a
              className="feature-request-link"
              href={`mailto:${name}@${domain}?subject=${subject}&body=${body}`}
              style={{
                display: "inline-block",
                marginTop: "0.35rem",
                color: "#0b3ea8",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              Report this issue
            </a>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

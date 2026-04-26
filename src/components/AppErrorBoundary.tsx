import React from "react";
import { Button } from "./ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[AppErrorBoundary]", error);
  }

  private reloadPage = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full rounded-2xl border border-border/70 shadow-sm p-6 text-center space-y-3 bg-white">
            <h1 className="text-lg font-semibold text-slate-800">Une erreur est survenue</h1>
            <p className="text-sm text-muted-foreground">
              Une erreur temporaire est apparue. L'application continue de fonctionner, vous pouvez recharger la page.
            </p>
            <Button onClick={this.reloadPage} className="h-10 px-5 rounded-full text-sm">
              Recharger
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

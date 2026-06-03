type AppVideoShellProps = {
  children: React.ReactNode;
};

/** Full-app looping video background (text stays readable on top). */
export default function AppVideoShell({ children }: AppVideoShellProps) {
  return (
    <div className="appShell">
      <video
        className="appShell__video"
        src="/font.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />
      <div className="appShell__ui">{children}</div>
    </div>
  );
}

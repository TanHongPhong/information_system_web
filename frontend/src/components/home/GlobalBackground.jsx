export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-50">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_0%_0%,#eef5ff_0%,transparent_55%),radial-gradient(1200px_800px_at_100%_100%,#eaf2ff_0%,transparent_55%),linear-gradient(to_bottom_right,#ffffff_0%,#f6faff_45%,#eef5ff_100%)]" />
      <div
        className="absolute -top-36 -left-32 w-[720px] h-[720px] rounded-full blur-3xl animate-aurora"
        style={{ background:
          "radial-gradient(circle at 30% 40%, var(--a1), transparent 56%), radial-gradient(circle at 70% 60%, var(--a2), transparent 62%), radial-gradient(circle at 50% 50%, var(--a3), transparent 68%)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[820px] h-[820px] rounded-full blur-3xl animate-aurora [animation-delay:3s]"
        style={{ background:
          "radial-gradient(circle at 40% 50%, var(--a4), transparent 60%), radial-gradient(circle at 60% 50%, var(--a5), transparent 65%), radial-gradient(circle at 50% 50%, rgba(59,130,246,.10), transparent 70%)" }}
      />
      <div className="absolute inset-0 mix-blend-multiply opacity-[.32] bg-grid" />
      <div className="absolute inset-0 opacity-[.22] bg-dots" />
    </div>
  );
}

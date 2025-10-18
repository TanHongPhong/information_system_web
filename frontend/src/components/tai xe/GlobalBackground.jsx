export default function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 -z-50"
      style={{
        background:
          "radial-gradient(1200px 600px at -10% -10%, rgba(37,99,235,.08), transparent 60%)," +
          "radial-gradient(900px 500px at 110% -10%, rgba(37,99,235,.06), transparent 60%)," +
          "#ffffff",
      }}
    />
  );
}

export function ContentPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container section">
      <div className="eyebrow">Electzo</div>
      <h1 className="section-title mt-2">{title}</h1>
      <div className="mt-8 max-w-3xl space-y-5 leading-7 text-gray-600">
        {children}
      </div>
    </div>
  );
}

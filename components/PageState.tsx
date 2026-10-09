import { label } from "../lib/presentation.mjs";
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="header-actions">{actions}</div>
    </header>
  );
}
export function State({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "error" | "success";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`state ${tone}`}
    >
      {children}
    </div>
  );
}
export function Badge({ value }: { value: string }) {
  return <span className={`badge ${value}`}>{label(value)}</span>;
}
export function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (value: number) => void;
}) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        {total} records · Page {page} of {Math.max(pages, 1)}
      </span>
      <div>
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}

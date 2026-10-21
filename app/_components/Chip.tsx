// Chip — Type=benefit | package | sale (Design.md 4장)
type Props = {
  label: string;
  type?: "benefit" | "package" | "sale";
};

const TYPE = {
  benefit: "rounded-4 bg-bg-subtle text-text-secondary text-caption-mini font-semibold px-6 py-2",
  package: "rounded-4 bg-fill-secondary text-text-on-dark text-caption-mini font-semibold px-6 py-2",
  sale: "rounded-6 bg-bg-accent-subtle text-icon-accent text-caption font-bold px-8 py-2",
} as const;

export default function Chip({ label, type = "sale" }: Props) {
  return <span className={`inline-flex shrink-0 items-center ${TYPE[type]}`}>{label}</span>;
}

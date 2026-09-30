/** Minimal styled table. `columns` are header labels; pass rows as children. */
export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold/30 text-left text-[0.65rem] tracking-widest text-ink/55 uppercase">
            {columns.map((column, index) => (
              <th key={column || index} scope="col" className="py-2 pr-4 font-normal">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ className = "", children }) {
  return <tr className={`border-b border-dotted border-gold/30 last:border-none ${className}`}>{children}</tr>;
}

export function Cell({ className = "", children }) {
  return <td className={`py-3 pr-4 ${className}`}>{children}</td>;
}

/** Right-aligned cell for row actions. */
export function ActionsCell({ children }) {
  return (
    <td className="py-3 text-right whitespace-nowrap">
      <div className="inline-flex gap-2">{children}</div>
    </td>
  );
}

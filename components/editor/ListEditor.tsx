interface Props {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}

export default function ListEditor({ items, onChange, placeholder }: Props) {
  function update(index: number, value: string) {
    const next = [...items]
    next[index] = value
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm
                       focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-gray-400 hover:text-red-500 px-1 text-xl leading-none"
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-sm text-brand-700 hover:text-brand-900 font-medium transition-colors"
      >
        + Add
      </button>
    </div>
  )
}

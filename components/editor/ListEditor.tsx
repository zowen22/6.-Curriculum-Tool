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
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        className="text-sm text-indigo-600 hover:text-indigo-500"
      >
        + Add
      </button>
    </div>
  )
}

import NewUnitForm from '@/components/units/NewUnitForm'

export default function NewUnitPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl font-semibold text-gray-900 tracking-tight mb-2">
        Create New Unit
      </h1>
      <p className="text-sm text-gray-500 mb-8">Fill in the details below to generate a new curriculum unit.</p>
      <NewUnitForm />
    </div>
  )
}

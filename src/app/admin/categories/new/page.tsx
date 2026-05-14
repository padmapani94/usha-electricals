import CategoryForm from "@/components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Add Category</h1>
      <p className="text-slate-500 mb-6">Create a new product category.</p>
      <CategoryForm />
    </div>
  );
}

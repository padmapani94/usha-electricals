import ProductForm from "@/components/ProductForm";

export default function NewProductPage({ searchParams }: { searchParams?: { brand?: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Add Product</h1>
      <p className="text-slate-500 mb-6">Create a new product in your catalog.</p>
      <ProductForm initialBrand={searchParams?.brand} />
    </div>
  );
}

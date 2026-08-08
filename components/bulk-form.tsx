"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const s = z.object({
  company: z.string().min(2),
  person: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email(),
  gst: z.string().optional(),
  requirement: z.string().min(5),
  quantity: z.number().positive(),
  date: z.string(),
  city: z.string().min(2),
  notes: z.string().optional(),
});
type F = z.infer<typeof s>;
export function BulkForm() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = useForm<F>({ resolver: zodResolver(s) });
  return (
    <form onSubmit={handleSubmit(() => undefined)} className="card p-6 md:p-8">
      <h2 className="text-2xl font-black">Tell us what you need</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ["company", "Company Name"],
          ["person", "Contact Person"],
          ["mobile", "Mobile"],
          ["email", "Email"],
          ["gst", "GST Number"],
          ["city", "City"],
          ["quantity", "Quantity"],
          ["date", "Expected Delivery Date"],
        ].map((x) => (
          <label key={x[0]}>
            <span className="label">{x[1]}</span>
            <input
              type={
                x[0] === "date"
                  ? "date"
                  : x[0] === "quantity"
                    ? "number"
                    : "text"
              }
              className="field"
                {...register(x[0] as keyof F, x[0] === 'quantity' ? { valueAsNumber: true } : undefined)}
            />
          </label>
        ))}
        <label className="md:col-span-2">
          <span className="label">Product Requirement</span>
          <textarea
            className="field min-h-28"
            placeholder="Products, brands and specifications"
            {...register("requirement")}
          />
        </label>
        <label className="md:col-span-2">
          <span className="label">Notes</span>
          <textarea className="field" {...register("notes")} />
        </label>
        <label className="md:col-span-2 rounded border-2 border-dashed p-6 text-center">
          <span className="font-bold">Upload requirement sheet</span>
          <small className="block mt-1 muted">
            PDF, XLS or CSV up to 10 MB
          </small>
          <input type="file" className="mt-3 text-sm" />
        </label>
      </div>
      <button className="btn btn-yellow mt-6">Submit RFQ</button>
      {isSubmitSuccessful && (
        <p className="mt-4 text-sm font-bold text-green-700">
          Thanks! Our business team will contact you shortly.
        </p>
      )}
    </form>
  );
}

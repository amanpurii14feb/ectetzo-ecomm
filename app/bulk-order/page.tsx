import { BulkForm } from "@/components/bulk-form";
import { BadgeIndianRupee, FileCheck2, Headphones } from "lucide-react";
export default function Page() {
  return (
    <div className="bg-paper">
      <div className="container section">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="eyebrow">Electzo for business</div>
            <h1 className="section-title mt-2">
              Bulk electrical sourcing, made simple.
            </h1>
            <p className="mt-5 leading-7 muted">
              Share your bill of materials and let our electrical sourcing
              specialists build a competitive, GST-ready quote.
            </p>
            <div className="mt-8 grid gap-5">
              {[
                [
                  BadgeIndianRupee,
                  "Volume pricing",
                  "Competitive rates for contractors and procurement teams",
                ],
                [
                  FileCheck2,
                  "One consolidated quote",
                  "Multi-brand requirements in one place",
                ],
                [
                  Headphones,
                  "Dedicated support",
                  "Help with product matching and fulfillment",
                ],
              ].map(([I, t, d]) => {
                const Icon = I as typeof Headphones;
                return (
                  <div className="flex gap-4" key={String(t)}>
                    <Icon className="text-amber-600" />
                    <div>
                      <b>{String(t)}</b>
                      <p className="text-sm muted">{String(d)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <BulkForm />
        </div>
      </div>
    </div>
  );
}

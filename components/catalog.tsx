"use client";

import { useEffect, useMemo, useState } from "react";
import { products as fallbackProducts } from "@/data/products";
import { VirtualProductGrid } from "./virtual-product-grid";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/radix";
import { useStore } from "@/stores/use-store";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Filter,
  Grid2X2,
  List,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Scale,
  X,
} from "lucide-react";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: Low to high" },
  { value: "high", label: "Price: High to low" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Most popular" },
  { value: "discount", label: "Biggest discount" },
];
const dealTypes = ["Best Seller", "New"];

const discount = (product: Product) =>
  Math.round((1 - product.price / product.mrp) * 100);
const toggleValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

export function Catalog({
  initialCategory,
  initialCategoryName,
  query,
  items = fallbackProducts,
}: {
  initialCategory?: string;
  initialCategoryName?: string;
  query?: string;
  items?: Product[];
}) {
  const router = useRouter();
  const products = items;
  const categories = [...new Set(products.map((product) => product.category))];
  const brands = [...new Set(products.map((product) => product.brand))].sort();
  const warranties = [
    ...new Set(
      products.map((product) => product.specs.Warranty).filter(Boolean),
    ),
  ];
  const PRICE_CEILING = Math.max(
    1000,
    Math.ceil(Math.max(0, ...products.map((p) => p.price)) / 1000) * 1000,
  );
  const initialCat =
    categories.find(
      (item) =>
        item.toLowerCase().replaceAll(" ", "-") ===
          initialCategory?.toLowerCase() || item === initialCategoryName,
    ) ?? "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCat ? [initialCat] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(PRICE_CEILING);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [selectedWarranties, setSelectedWarranties] = useState<string[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cats =
      params
        .get("categories")
        ?.split(",")
        .filter((item) => categories.includes(item)) ?? [];
    const selected =
      params
        .get("brands")
        ?.split(",")
        .filter((item) => brands.includes(item)) ?? [];
    const warrantyValues =
      params
        .get("warranty")
        ?.split(",")
        .filter((item) => warranties.includes(item)) ?? [];
    const dealValues =
      params
        .get("deals")
        ?.split(",")
        .filter((item) => dealTypes.includes(item)) ?? [];
    if (cats.length) setSelectedCategories(cats);
    if (selected.length) setSelectedBrands(selected);
    if (warrantyValues.length) setSelectedWarranties(warrantyValues);
    if (dealValues.length) setSelectedDeals(dealValues);
    if (params.has("min"))
      setMinPrice(Math.max(0, Number(params.get("min")) || 0));
    if (params.has("max"))
      setMaxPrice(
        Math.min(PRICE_CEILING, Number(params.get("max")) || PRICE_CEILING),
      );
    if (params.has("rating")) setMinRating(Number(params.get("rating")) || 0);
    if (params.has("discount"))
      setMinDiscount(Number(params.get("discount")) || 0);
    setInStockOnly(params.get("stock") === "1");
    if (sortOptions.some((option) => option.value === params.get("sort")))
      setSort(params.get("sort")!);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key: string, value: string, keep: boolean) =>
      keep ? params.set(key, value) : params.delete(key);
    setOrDelete(
      "categories",
      selectedCategories.join(","),
      selectedCategories.length > 0,
    );
    setOrDelete("brands", selectedBrands.join(","), selectedBrands.length > 0);
    setOrDelete(
      "warranty",
      selectedWarranties.join(","),
      selectedWarranties.length > 0,
    );
    setOrDelete("deals", selectedDeals.join(","), selectedDeals.length > 0);
    setOrDelete("min", String(minPrice), minPrice > 0);
    setOrDelete("max", String(maxPrice), maxPrice < PRICE_CEILING);
    setOrDelete("rating", String(minRating), minRating > 0);
    setOrDelete("discount", String(minDiscount), minDiscount > 0);
    setOrDelete("stock", "1", inStockOnly);
    setOrDelete("sort", sort, sort !== "featured");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
  }, [
    urlReady,
    selectedCategories,
    selectedBrands,
    selectedWarranties,
    selectedDeals,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStockOnly,
    sort,
  ]);

  const matches = (product: Product, ignore?: "category" | "brand") =>
    (ignore === "category" ||
      !selectedCategories.length ||
      selectedCategories.includes(product.category)) &&
    (ignore === "brand" ||
      !selectedBrands.length ||
      selectedBrands.includes(product.brand)) &&
    (!selectedWarranties.length ||
      selectedWarranties.includes(product.specs.Warranty)) &&
    (!selectedDeals.length ||
      Boolean(product.badge && selectedDeals.includes(product.badge))) &&
    product.price >= minPrice &&
    product.price <= maxPrice &&
    (!minRating || product.rating >= minRating) &&
    (!minDiscount || discount(product) >= minDiscount) &&
    (!inStockOnly || product.stock > 0) &&
    (!query ||
      `${product.name} ${product.brand} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase()));

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((item) => [
          item,
          products.filter((p) => p.category === item && matches(p, "category"))
            .length,
        ]),
      ),
    [
      selectedBrands,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      selectedWarranties,
      selectedDeals,
      inStockOnly,
      query,
    ],
  );
  const brandCounts = useMemo(
    () =>
      Object.fromEntries(
        brands.map((item) => [
          item,
          products.filter((p) => p.brand === item && matches(p, "brand"))
            .length,
        ]),
      ),
    [
      selectedCategories,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      selectedWarranties,
      selectedDeals,
      inStockOnly,
      query,
    ],
  );

  const list = useMemo(() => {
    let result = products.filter((product) => matches(product));
    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating")
      result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === "popular")
      result = [...result].sort((a, b) => b.reviews - a.reviews);
    if (sort === "discount")
      result = [...result].sort((a, b) => discount(b) - discount(a));
    return result;
  }, [
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    selectedWarranties,
    selectedDeals,
    inStockOnly,
    sort,
    query,
  ]);

  const changeFilter = (fn: () => void) => {
    fn();
  };
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(PRICE_CEILING);
    setMinRating(0);
    setMinDiscount(0);
    setSelectedWarranties([]);
    setSelectedDeals([]);
    setInStockOnly(false);
    if (initialCategory) router.replace("/shop");
  };
  const filterCount =
    selectedCategories.length +
    selectedBrands.length +
    Number(minPrice > 0) +
    Number(maxPrice < PRICE_CEILING) +
    Number(minRating > 0) +
    Number(minDiscount > 0) +
    selectedWarranties.length +
    selectedDeals.length +
    Number(inStockOnly);
  const filteredBrands = brands.filter((item) =>
    item.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  const checkRow = (
    key: string,
    label: string,
    count: number,
    checked: boolean,
    disabled: boolean,
    onChange: () => void,
  ) => (
    <label
      key={key}
      className={`facet-option ${disabled && !checked ? "disabled" : ""}`}
    >
      <Checkbox
        checked={checked}
        disabled={disabled && !checked}
        onCheckedChange={onChange}
      />
      <span>{label}</span>
      <small>{count}</small>
    </label>
  );

  const sidebar = (
    <aside className="catalog-filter-card">
      <div className="catalog-filter-head">
        <span>
          <SlidersHorizontal size={18} />
        </span>
        <div>
          <b>Filters</b>
          <small>
            {filterCount ? `${filterCount} applied` : "Refine your results"}
          </small>
        </div>
        {filterCount > 0 && <button onClick={clearFilters}>Clear all</button>}
      </div>
      <details className="facet-section" open>
        <summary>
          Category <ChevronDown size={15} />
        </summary>
        <div className="facet-options">
          {categories.map((item) =>
            checkRow(
              `category-${item}`,
              item,
              categoryCounts[item],
              selectedCategories.includes(item),
              categoryCounts[item] === 0,
              () =>
                changeFilter(() =>
                  setSelectedCategories(toggleValue(selectedCategories, item)),
                ),
            ),
          )}
        </div>
      </details>
      <details className="facet-section" open>
        <summary>
          Brand <ChevronDown size={15} />
        </summary>
        <div className="facet-search">
          <Search size={14} />
          <input
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brands"
          />
        </div>
        <div className="facet-options facet-scroll">
          {filteredBrands.map((item) =>
            checkRow(
              `brand-${item}`,
              item,
              brandCounts[item],
              selectedBrands.includes(item),
              brandCounts[item] === 0,
              () =>
                changeFilter(() =>
                  setSelectedBrands(toggleValue(selectedBrands, item)),
                ),
            ),
          )}
        </div>
      </details>
      <details className="facet-section" open>
        <summary>
          Price <ChevronDown size={15} />
        </summary>
        <div className="price-inputs">
          <label>
            <small>Min</small>
            <span>
              ₹
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={minPrice}
                onChange={(e) =>
                  changeFilter(() =>
                    setMinPrice(Math.min(Number(e.target.value), maxPrice)),
                  )
                }
              />
            </span>
          </label>
          <i>—</i>
          <label>
            <small>Max</small>
            <span>
              ₹
              <input
                type="number"
                min={minPrice}
                max={PRICE_CEILING}
                value={maxPrice}
                onChange={(e) =>
                  changeFilter(() =>
                    setMaxPrice(Math.max(Number(e.target.value), minPrice)),
                  )
                }
              />
            </span>
          </label>
        </div>
        <input
          aria-label="Maximum price"
          type="range"
          min="100"
          max={PRICE_CEILING}
          step="100"
          value={maxPrice}
          onChange={(e) =>
            changeFilter(() =>
              setMaxPrice(Math.max(Number(e.target.value), minPrice)),
            )
          }
          className="range facet-range"
        />
        <div className="price-presets">
          {[1000, 2500, 5000].map((price) => (
            <button
              className={maxPrice === price && minPrice === 0 ? "active" : ""}
              key={price}
              onClick={() =>
                changeFilter(() => {
                  setMinPrice(0);
                  setMaxPrice(price);
                })
              }
            >
              Under ₹{price.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </details>
      <details className="facet-section" open>
        <summary>
          Customer rating <ChevronDown size={15} />
        </summary>
        <div className="rating-options">
          {[4, 3].map((rating) => (
            <label key={rating}>
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => changeFilter(() => setMinRating(rating))}
              />
              <span>
                <Star size={14} fill="#f6b800" color="#f6b800" /> {rating} &
                above
              </span>
            </label>
          ))}
          {minRating > 0 && (
            <button onClick={() => changeFilter(() => setMinRating(0))}>
              Any rating
            </button>
          )}
        </div>
      </details>
      <details className="facet-section" open>
        <summary>
          Offers & availability <ChevronDown size={15} />
        </summary>
        <div className="facet-options">
          {checkRow(
            "availability-in-stock",
            "In stock",
            products.filter((p) => p.stock > 0).length,
            inStockOnly,
            false,
            () => changeFilter(() => setInStockOnly(!inStockOnly)),
          )}
          {[10, 20].map((off) =>
            checkRow(
              `discount-${off}`,
              `${off}% off or more`,
              products.filter((p) => discount(p) >= off).length,
              minDiscount === off,
              false,
              () =>
                changeFilter(() =>
                  setMinDiscount(minDiscount === off ? 0 : off),
                ),
            ),
          )}
          {dealTypes.map((deal) =>
            checkRow(
              `deal-${deal}`,
              deal,
              products.filter((product) => product.badge === deal).length,
              selectedDeals.includes(deal),
              false,
              () =>
                changeFilter(() =>
                  setSelectedDeals(toggleValue(selectedDeals, deal)),
                ),
            ),
          )}
        </div>
      </details>
      <details className="facet-section" open>
        <summary>
          Warranty <ChevronDown size={15} />
        </summary>
        <div className="facet-options">
          {warranties.map((warranty) =>
            checkRow(
              `warranty-${warranty}`,
              warranty,
              products.filter((product) => product.specs.Warranty === warranty)
                .length,
              selectedWarranties.includes(warranty),
              false,
              () =>
                changeFilter(() =>
                  setSelectedWarranties(
                    toggleValue(selectedWarranties, warranty),
                  ),
                ),
            ),
          )}
        </div>
      </details>
      <button onClick={clearFilters} className="catalog-reset">
        <RotateCcw size={14} /> Reset all filters
      </button>
      <button
        className="mobile-filter-apply mobile-only"
        onClick={() => setFilters(false)}
      >
        Show {list.length} products
      </button>
    </aside>
  );

  const chips = [
    ...selectedCategories.map((value) => ({
      label: `Category: ${value}`,
      remove: () =>
        setSelectedCategories(
          selectedCategories.filter((item) => item !== value),
        ),
    })),
    ...selectedBrands.map((value) => ({
      label: `Brand: ${value}`,
      remove: () =>
        setSelectedBrands(selectedBrands.filter((item) => item !== value)),
    })),
    ...(minPrice > 0 || maxPrice < PRICE_CEILING
      ? [
          {
            label: `Price: ₹${minPrice.toLocaleString("en-IN")}–₹${maxPrice.toLocaleString("en-IN")}`,
            remove: () => {
              setMinPrice(0);
              setMaxPrice(PRICE_CEILING);
            },
          },
        ]
      : []),
    ...(minRating
      ? [{ label: `Rating: ${minRating}+`, remove: () => setMinRating(0) }]
      : []),
    ...(minDiscount
      ? [
          {
            label: `Discount: ${minDiscount}%+`,
            remove: () => setMinDiscount(0),
          },
        ]
      : []),
    ...(inStockOnly
      ? [
          {
            label: "Availability: In stock",
            remove: () => setInStockOnly(false),
          },
        ]
      : []),
    ...selectedWarranties.map((value) => ({
      label: `Warranty: ${value}`,
      remove: () =>
        setSelectedWarranties(
          selectedWarranties.filter((item) => item !== value),
        ),
    })),
    ...selectedDeals.map((value) => ({
      label: `Deal: ${value}`,
      remove: () =>
        setSelectedDeals(selectedDeals.filter((item) => item !== value)),
    })),
  ];

  const toggleCompare = (id: number) => {
    if (compareIds.includes(id)) {
      const remaining = compareIds.filter((item) => item !== id);
      setCompareIds(remaining);
      if (compareOpen && remaining.length < 2) setCompareOpen(false);
      return;
    }
    if (compareIds.length >= 3) {
      useStore.getState().notify("You can compare up to 3 products");
      return;
    }
    setCompareIds([...compareIds, id]);
  };
  const compareProducts = products.filter((product) =>
    compareIds.includes(product.id),
  );
  const lowestComparePrice = Math.min(
    ...compareProducts.map((product) => product.price),
  );
  const highestCompareRating = Math.max(
    ...compareProducts.map((product) => product.rating),
  );
  const highestCompareDiscount = Math.max(
    ...compareProducts.map((product) => discount(product)),
  );

  const heading = query
    ? `Results for “${query}”`
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : initialCat || "Electrical essentials";

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <div className="catalog-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronDown size={13} />
            <Link href="/shop">Shop</Link>
            {initialCat && (
              <>
                <ChevronDown size={13} />
                <Link
                  className="current"
                  href={`/category/${initialCategory}`}
                  aria-current="page"
                >
                  {initialCat}
                </Link>
              </>
            )}
          </div>
          <div className="catalog-hero-row">
            <div>
              <div className="eyebrow">
                <Sparkles size={13} /> Curated electrical range
              </div>
              <h1>{heading}</h1>
              <p>
                Explore verified products from trusted brands, ready for fast
                dispatch.
              </p>
            </div>
            <div className="catalog-trust">
              <span>
                <ShieldCheck size={19} />
                <b>100% Genuine</b>
                <small>Verified products</small>
              </span>
              <span>
                <ReceiptText size={19} />
                <b>GST Invoice</b>
                <small>On every order</small>
              </span>
              <span>
                <PackageCheck size={19} />
                <b>Fast Dispatch</b>
                <small>Reliable delivery</small>
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="container catalog-body">
        <button
          className="catalog-mobile-filter mobile-only"
          onClick={() => setFilters(!filters)}
          aria-expanded={filters}
        >
          {filters ? <X size={18} /> : <Filter size={18} />}{" "}
          {filters ? "Close filters" : "Show filters"}
          {filterCount > 0 && <b>{filterCount}</b>}
        </button>
        {filters && (
          <div className="catalog-mobile-panel mobile-only">{sidebar}</div>
        )}
        <div className="catalog-layout">
          <div className="desktop-only catalog-sidebar">{sidebar}</div>
          <div className="catalog-results">
            <div className="catalog-toolbar">
              <div className="catalog-result-count">
                <b>{list.length} products</b>
                <span>
                  {filterCount ? "matching your filters" : "ready to order"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={`view-button ${view === "grid" ? "active" : ""}`}
                >
                  <Grid2X2 size={17} />
                </button>
                <button
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={`view-button ${view === "list" ? "active" : ""}`}
                >
                  <List size={17} />
                </button>
              </div>
              <div className="sort-menu">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="sort-trigger"
                  aria-expanded={sortOpen}
                >
                  <span>
                    <small>Sort by</small>
                    <b>{sortOptions.find((o) => o.value === sort)?.label}</b>
                  </span>
                  <ChevronDown size={17} />
                </button>
                {sortOpen && (
                  <div className="sort-options">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSort(option.value);
                          setSortOpen(false);
                        }}
                        className={sort === option.value ? "selected" : ""}
                      >
                        <span>{option.label}</span>
                        {sort === option.value && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {chips.length > 0 && (
              <div className="applied-filter-row">
                <b>Applied filters</b>
                <div>
                  {chips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => {
                        chip.remove();
                      }}
                    >
                      {chip.label}
                      <X size={13} />
                    </button>
                  ))}
                </div>
                <button onClick={clearFilters}>Clear all</button>
              </div>
            )}
            {list.length ? (
              <VirtualProductGrid
                items={list}
                view={view}
                compareIds={compareIds}
                onCompare={toggleCompare}
              />
            ) : (
              <div className="card empty-state">
                <SearchX size={42} />
                <h2>No matching products</h2>
                <p>Remove one or more filters to see compatible products.</p>
                <button className="btn btn-yellow" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {compareIds.length > 0 && (
        <div className="compare-tray">
          <div>
            <Scale size={18} />
            <span>
              <b>Compare products</b>
              <small>{compareIds.length} of 3 selected</small>
            </span>
          </div>
          <div className="compare-tray-items">
            {compareProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => toggleCompare(product.id)}
                title="Remove from comparison"
              >
                <span
                  className="product-visual"
                  style={{ background: product.color }}
                />
                <b>{product.name}</b>
                <X size={13} />
              </button>
            ))}
          </div>
          <button
            className="compare-action"
            disabled={compareIds.length < 2}
            onClick={() => setCompareOpen(true)}
          >
            Compare now
          </button>
        </div>
      )}
      {compareOpen && (
        <div
          className="compare-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Product comparison"
        >
          <button
            className="compare-backdrop"
            onClick={() => setCompareOpen(false)}
            aria-label="Close comparison"
          />
          <div className="compare-dialog">
            <div className="compare-head">
              <div>
                <span className="eyebrow">Side-by-side</span>
                <h2>Compare products</h2>
                <p>Quickly spot the differences that matter.</p>
              </div>
              <button onClick={() => setCompareOpen(false)} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="compare-table">
              <div className="compare-labels">
                <b>
                  Product <small>{compareProducts.length} selected</small>
                </b>
                <span>Price</span>
                <span>Rating</span>
                <span>Warranty</span>
                <span>Availability</span>
                <span>Discount</span>
              </div>
              {compareProducts.map((product) => (
                <div className="compare-column" key={product.id}>
                  <div className="compare-product">
                    <button
                      type="button"
                      onClick={() => toggleCompare(product.id)}
                      aria-label={`Remove ${product.name} from comparison`}
                      title="Remove from comparison"
                    >
                      <X size={13} />
                    </button>
                    <Link href={`/product/${product.slug}`}>
                      <span
                        className="product-visual"
                        style={{ background: product.color }}
                      />
                      <small>{product.brand}</small>
                      <b>{product.name}</b>
                    </Link>
                  </div>
                  <strong
                    className={
                      product.price === lowestComparePrice ? "best-cell" : ""
                    }
                  >
                    ₹{product.price.toLocaleString("en-IN")}
                    <s>₹{product.mrp.toLocaleString("en-IN")}</s>
                    {product.price === lowestComparePrice && (
                      <em>Best price</em>
                    )}
                  </strong>
                  <span
                    className={
                      product.rating === highestCompareRating ? "best-cell" : ""
                    }
                  >
                    <Star size={14} fill="#f6b800" color="#f6b800" />
                    <b>{product.rating}</b>
                    <small>{product.reviews} reviews</small>
                  </span>
                  <span>{product.specs.Warranty}</span>
                  <span className="compare-stock">
                    <i /> In stock
                  </span>
                  <span
                    className={
                      discount(product) === highestCompareDiscount
                        ? "best-cell"
                        : ""
                    }
                  >
                    <b>{discount(product)}% off</b>
                    {discount(product) === highestCompareDiscount && (
                      <em>Best saving</em>
                    )}
                  </span>
                  <Link
                    href={`/product/${product.slug}`}
                    className="btn btn-dark"
                  >
                    View product <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

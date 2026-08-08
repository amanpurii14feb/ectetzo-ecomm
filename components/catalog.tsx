"use client";

import { useEffect, useMemo, useState } from "react";
import { products, categories, brands } from "@/data/products";
import { ProductGrid } from "./product-grid";
import type { Product } from "@/lib/types";
import {
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
  X,
} from "lucide-react";

const PAGE_SIZE = 9;
const PRICE_CEILING =
  Math.ceil(Math.max(...products.map((p) => p.price)) / 1000) * 1000;
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: Low to high" },
  { value: "high", label: "Price: High to low" },
  { value: "rating", label: "Top rated" },
];

const discount = (product: Product) =>
  Math.round((1 - product.price / product.mrp) * 100);
const toggleValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

export function Catalog({
  initialCategory,
  query,
}: {
  initialCategory?: string;
  query?: string;
}) {
  const initialCat =
    categories.find(
      (item) =>
        item.toLowerCase().replaceAll(" ", "-") ===
        initialCategory?.toLowerCase(),
    ) ?? "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCat ? [initialCat] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(PRICE_CEILING);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);

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
    if (cats.length) setSelectedCategories(cats);
    if (selected.length) setSelectedBrands(selected);
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
    return result;
  }, [
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStockOnly,
    sort,
    query,
  ]);

  const pages = Math.ceil(list.length / PAGE_SIZE);
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };
  const clearFilters = () => {
    setSelectedCategories(initialCat ? [initialCat] : []);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(PRICE_CEILING);
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setPage(1);
  };
  const filterCount =
    selectedCategories.length +
    selectedBrands.length +
    Number(minPrice > 0) +
    Number(maxPrice < PRICE_CEILING) +
    Number(minRating > 0) +
    Number(minDiscount > 0) +
    Number(inStockOnly);
  const filteredBrands = brands.filter((item) =>
    item.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  const checkRow = (
    label: string,
    count: number,
    checked: boolean,
    disabled: boolean,
    onChange: () => void,
  ) => (
    <label className={`facet-option ${disabled && !checked ? "disabled" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled && !checked}
        onChange={onChange}
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
            "In stock",
            products.filter((p) => p.stock > 0).length,
            inStockOnly,
            false,
            () => changeFilter(() => setInStockOnly(!inStockOnly)),
          )}
          {[10, 20].map((off) =>
            checkRow(
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
  ];

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
            <span>Home</span>
            <ChevronDown size={13} />
            <span>Shop</span>
            {initialCat && (
              <>
                <ChevronDown size={13} />
                <b>{initialCat}</b>
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
                          setPage(1);
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
                        setPage(1);
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
            {visible.length ? (
              <ProductGrid items={visible} view={view} />
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
            {pages > 1 && (
              <div className="catalog-pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      onClick={() => {
                        setPage(number);
                        window.scrollTo({ top: 320, behavior: "smooth" });
                      }}
                      className={number === page ? "active" : ""}
                      key={number}
                    >
                      {number}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

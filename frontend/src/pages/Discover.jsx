import React, { useMemo, useState, useEffect } from "react";
import { YEARS, QUALITIES, GENRES, COUNTRIES } from "../lib/discoverFilters";
import { Filter as FilterIcon, X } from "lucide-react";
import MovieCard from "../components/MovieCard";
import SeriesCard from "../components/SeriesCard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Segmented = ({ value, onChange, options }) => (
  <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm rounded-full transition ${
            active ? "bg-primary text-white" : "text-gray-300 hover:bg-white/10"
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const RadioPill = ({ name, value, checked, onChange, children }) => (
  <label
    className={`inline-flex items-center gap-2 cursor-pointer rounded-full px-3 py-2 text-sm
                     border transition select-none
                     ${
                       checked
                         ? "bg-primary text-white border-primary"
                         : "bg-white/5 border-white/10 hover:bg-white/10"
                     }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="hidden"
    />
    {children}
  </label>
);

const ChipCheck = ({ label, checked, onChange }) => (
  <label
    className={`inline-flex items-center gap-2 text-sm rounded-md px-3 py-2
                     border cursor-pointer transition
                     ${
                       checked
                         ? "bg-primary/20 border-primary text-white"
                         : "bg-white/5 border-white/10 hover:bg-white/10"
                     }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="hidden"
    />
    <span
      className={`w-4 h-4 grid place-items-center rounded-sm border text-[10px] leading-none
                      ${checked ? "bg-primary border-primary" : "border-white/30"}`}
    >
      {checked ? "✓" : ""}
    </span>
    {label}
  </label>
);

const Section = ({ title, children }) => (
  <div className="py-5 border-t border-white/10 first:border-t-0">
    <h3 className="font-semibold mb-3">{title}</h3>
    <div>{children}</div>
  </div>
);

const Discover = () => {
  const [type, setType] = useState("all");
  const [released, setReleased] = useState("all");
  const [quality, setQuality] = useState("all");
  const [genres, setGenres] = useState(new Set());
  const [countries, setCountries] = useState(new Set());
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);

  const selected = useMemo(
    () => ({
      type,
      released,
      quality,
      genres: Array.from(genres),
      countries: Array.from(countries),
    }),
    [type, released, quality, genres, countries]
  );

  const applyFilters = async () => {
    const params = new URLSearchParams();

    if (type !== "all") params.append("type", type);
    if (released !== "all") params.append("year", released);
    if (quality !== "all") params.append("quality", quality);
    if (genres.size > 0) params.append("genre", Array.from(genres).join(","));
    if (countries.size > 0) params.append("country", Array.from(countries).join(","));

    try {
      const res = await fetch(`${API_BASE}/api/discover?${params.toString()}`);
      const json = await res.json();
      setResults(json.results || []);
      setOpen(false);
    } catch (err) {
      console.error("Failed to fetch discover results:", err);
    }
  };

  const clearFilters = () => {
    setReleased("all");
    setQuality("all");
    setGenres(new Set());
    setCountries(new Set());
  };

  useEffect(() => {
    applyFilters(); // Fetch initial results
  }, [type]);

  return (
    <div className="relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20 overflow-hidden min-h-[80vh]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-semibold">Discover</h1>

          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: "all", label: "All" },
              { value: "movie", label: "Movies" },
              { value: "tv", label: "TV Shows" },
            ]}
          />

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-2"
            onClick={() => setOpen(true)}
          >
            <FilterIcon className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Active Filter Summary */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Type: <b className="ml-1 capitalize">{selected.type}</b>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Released: <b className="ml-1">{selected.released}</b>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            Quality: <b className="ml-1">{selected.quality}</b>
          </span>
          {selected.genres.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Genres:{" "}
              <b className="ml-1">
                {selected.genres.slice(0, 3).join(", ")}
                {selected.genres.length > 3 ? " +" + (selected.genres.length - 3) : ""}
              </b>
            </span>
          )}
          {selected.countries.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Countries:{" "}
              <b className="ml-1">
                {selected.countries.slice(0, 2).join(", ")}
                {selected.countries.length > 2 ? " +" + (selected.countries.length - 2) : ""}
              </b>
            </span>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mt-8">
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm">No results. Try adjusting your filters.</p>
          ) : (
            results.map((item) =>
              item._type === "movie" ? (
                <MovieCard key={item._id} movie={item} />
              ) : (
                <SeriesCard key={item._id} show={item} />
              )
            )
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-14 w-[min(880px,92vw)] rounded-2xl border border-white/10 bg-[#121214] shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 md:px-5 py-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Section title="Type:">
                  <div className="flex flex-wrap gap-2">
                    <RadioPill name="type2" value="all" checked={type === "all"} onChange={setType}>
                      All
                    </RadioPill>
                    <RadioPill name="type2" value="movie" checked={type === "movie"} onChange={setType}>
                      Movies
                    </RadioPill>
                    <RadioPill name="type2" value="tv" checked={type === "tv"} onChange={setType}>
                      TV Shows
                    </RadioPill>
                  </div>
                </Section>

                <Section title="Quality:">
                  <div className="flex flex-wrap gap-2">
                    <RadioPill name="quality" value="all" checked={quality === "all"} onChange={setQuality}>
                      All
                    </RadioPill>
                    {QUALITIES.map((q) => (
                      <RadioPill
                        key={q}
                        name="quality"
                        value={q}
                        checked={quality === q}
                        onChange={setQuality}
                      >
                        {q}
                      </RadioPill>
                    ))}
                  </div>
                </Section>
              </div>

              <Section title="Released:">
                <div className="flex flex-wrap gap-2">
                  <RadioPill
                    name="released"
                    value="all"
                    checked={released === "all"}
                    onChange={setReleased}
                  >
                    All
                  </RadioPill>
                  {YEARS.map((y) => (
                    <RadioPill
                      key={y}
                      name="released"
                      value={y}
                      checked={released === y}
                      onChange={setReleased}
                    >
                      {y}
                    </RadioPill>
                  ))}
                </div>
              </Section>

              <Section title="Genre:">
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <ChipCheck
                      key={g}
                      label={g}
                      checked={genres.has(g)}
                      onChange={() => {
                        const next = new Set(genres);
                        next.has(g) ? next.delete(g) : next.add(g);
                        setGenres(next);
                      }}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Country:">
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((c) => (
                    <ChipCheck
                      key={c}
                      label={c}
                      checked={countries.has(c)}
                      onChange={() => {
                        const next = new Set(countries);
                        next.has(c) ? next.delete(c) : next.add(c);
                        setCountries(next);
                      }}
                    />
                  ))}
                </div>
              </Section>
            </div>

            <div className="px-4 md:px-5 py-3 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dull px-5 py-2.5 text-sm font-medium"
              >
                <FilterIcon className="w-4 h-4" />
                Apply Filters
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 hover:bg-white/15 px-5 py-2.5 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={clearFilters}
                className="ml-auto text-xs opacity-70 hover:opacity-100 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;

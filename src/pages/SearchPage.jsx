import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function SearchPage() {
  const properties = propertiesData.properties;

  const [type, setType] = useState("Any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [postcodeArea, setPostcodeArea] = useState("");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Type
      if (type !== "Any" && p.type !== type) return false;

      // Price
      const minP = minPrice === "" ? null : Number(minPrice);
      const maxP = maxPrice === "" ? null : Number(maxPrice);
      if (minP !== null && Number(p.price) < minP) return false;
      if (maxP !== null && Number(p.price) > maxP) return false;

      // Bedrooms
      const beds = minBeds === "" ? null : Number(minBeds);
      if (beds !== null && Number(p.bedrooms) < beds) return false;

      // Postcode area (e.g., BR5, NW1) - match start of postcode, case-insensitive
      const pc = postcodeArea.trim().toUpperCase();
      if (pc) {
        const loc = String(p.location || "").toUpperCase();

        // Find a token like BR5 / NW1 / etc. in location
        const match = loc.match(/\b[A-Z]{1,2}\d[A-Z0-9]?\b/);
        const outward = match ? match[0] : "";

        if (!outward.startsWith(pc)) return false;
      }

      return true;
    });
  }, [properties, type, minPrice, maxPrice, minBeds, postcodeArea]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Estate Agent</h1>
      <p>Total properties found: {filtered.length}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "white",
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        {/* Type */}
        <label>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            <option value="Any">Any</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
          </select>
        </label>

        {/* Min Price */}
        <label>
          Min Price
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 250000"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Max Price */}
        <label>
          Max Price
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 750000"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Min Bedrooms */}
        <label>
          Min Bedrooms
          <input
            type="number"
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            placeholder="e.g. 2"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Postcode Area */}
        <label>
          Postcode Area
          <input
            type="text"
            value={postcodeArea}
            onChange={(e) => setPostcodeArea(e.target.value)}
            placeholder="e.g. BR5"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            setType("Any");
            setMinPrice("");
            setMaxPrice("");
            setMinBeds("");
            setPostcodeArea("");
          }}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#f6f6f6",
            cursor: "pointer",
            alignSelf: "end",
          }}
        >
          Clear filters
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/property/${p.id}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
                background: "white",
                cursor: "pointer",
              }}
            >
              <img
                src={"/" + (p.picture || "images/placeholder.jpg")}
                alt={p.type}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 10,
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
              />

              <h3 style={{ margin: "12px 0 6px" }}>
                {p.type} • {p.bedrooms} bed
              </h3>

              <div style={{ fontWeight: 700 }}>
                £{Number(p.price).toLocaleString()}
              </div>

              <div style={{ marginTop: 6, color: "#444" }}>{p.location}</div>

              <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
                Added: {p.added?.day} {p.added?.month} {p.added?.year}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
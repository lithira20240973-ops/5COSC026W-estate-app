import { Link } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function SearchPage() {
  const properties = propertiesData.properties;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Estate Agent</h1>
      <p>Total properties loaded: {properties.length}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {properties.map((p) => (
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
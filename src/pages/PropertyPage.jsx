import { useParams, Link } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function PropertyPage() {
  const { id } = useParams();
  const property = propertiesData.properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div style={{ padding: 24 }}>
        <p>Property not found.</p>
        <Link to="/">Back to search</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <Link to="/">← Back</Link>
      <h1 style={{ marginTop: 12 }}>
        {property.type} • {property.bedrooms} bed
      </h1>
      <p>{property.location}</p>
      <p style={{ fontWeight: 700 }}>
        £{Number(property.price).toLocaleString()}
      </p>
    </div>
  );
}
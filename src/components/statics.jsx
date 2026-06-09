import { useState } from "react";
function Statics({ title, value, valueColor }) {
    const [onHover, setOnHover] = useState(false);
    return (
        <div
            onMouseEnter={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "24px",
                width: "33%",
                backgroundColor: "#202020",
                border: "1px solid #333",
                borderRadius: "12px",
                fontFamily: "cairo, sans-serif",
                letterSpacing: "0.5px",
               borderColor: onHover ? "#22c97a" : "#333",
               height: "50px",
            }}
        >
            <h3 style={{ color: "#888", margin: "0", textAlign: "right",fontSize:"14px" }}>{title}</h3>
            <p style={{ color: valueColor || "gray", margin: "0", textAlign: "right" }}>{value}</p>
        </div>)

}
export default Statics
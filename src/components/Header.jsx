import { useState } from "react"
function Header({ title, buttonText, onButtonClick }) {
    const [showModal, setShowModal] = useState(false)
    return (<>
        {/* Header */}
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: "20px 28px", borderBottom: "1px solid #1a1a1a"
        }}>
            <h2 style={{ margin: 0, fontSize: "20px", color: "white", fontFamily: "cairo, sans-serif" }}>{title}</h2>
            {buttonText && <button onClick={onButtonClick} style={{
                backgroundColor: "#22c97a", color: "#000",
                padding: "10px 20px", border: "none", borderRadius: "8px",
                cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "14px", fontWeight: "700"
            }}>

                {buttonText}</button>}
        </div>
    </>
    )
}
export default Header
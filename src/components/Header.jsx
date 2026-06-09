function Header({ title, buttonText, onButtonClick, extraContent }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: "20px 28px", borderBottom: "1px solid #1a1a1a" ,flexDirection: "row-reverse"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {buttonText && <button onClick={onButtonClick} style={{
                    backgroundColor: "#22c97a", color: "#000",
                    padding: "10px 20px", border: "none", borderRadius: "8px",
                    cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "14px", fontWeight: "700"
                }}>{buttonText}</button>}
                {extraContent}
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", color: "white", fontFamily: "cairo, sans-serif" }}>{title}</h2>
        </div>
    )
}
export default Header
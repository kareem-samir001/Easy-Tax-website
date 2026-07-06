import './StatCard.css';

/**
 * StatCard — reusable summary card matching the Dashboard design.
 *
 * Props:
 *   title       {string}  — label shown at top (small, muted)
 *   value       {string|number} — main big number
 *   unit        {string}  — optional unit suffix (e.g. "جنيه")
 *   subtitle    {string|node}  — optional small text below value
 *   valueColor  {string}  — optional CSS color for value (defaults to #fff)
 *   accent      {string}  — "green" | "yellow" | "red" (default "green")
 *                           controls border-top color on hover
 */
function StatCard({ title, value, unit, subtitle, valueColor, accent = 'green' }) {
    return (
        <div className={`stat-card stat-card--${accent}`}>
            <span className="stat-card__title">{title}</span>
            <p className="stat-card__value" style={valueColor ? { color: valueColor } : undefined}>
                {value}
                {unit && <span className="stat-card__unit"> {unit}</span>}
            </p>
            {subtitle != null && (
                <p className="stat-card__subtitle">{subtitle}</p>
            )}
        </div>
    );
}

export default StatCard;

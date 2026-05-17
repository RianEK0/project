const StatCard = ({ icon, label, value, tone = 'default', helper }) => {
  return (
    <div className={`card stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="eyebrow">{label}</div>
        <div className="stat-value">{value}</div>
        {helper ? <div className="muted-text">{helper}</div> : null}
      </div>
    </div>
  );
};

export default StatCard;

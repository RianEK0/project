const SectionHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  );
};

export default SectionHeader;

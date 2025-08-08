import React from 'react';

const RiskBadge = ({ level }) => {
  let color = 'gray';
  if (level === 'low') color = 'green';
  else if (level === 'medium') color = 'orange';
  else if (level === 'high') color = 'red';

  return (
    <span
      style={{
        backgroundColor: color,
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        marginLeft: '8px',
      }}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
};

export default RiskBadge;

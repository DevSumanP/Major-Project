import React from 'react';

const Sectionheading = ({ title = "Section Title", textColor = "text-black", showActionButton = false, buttonTitle = "View All", onPressed = () => {} }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className={`text-lg font-semibold ${textColor}`} title={title}>
        {title}
      </h2>
      {showActionButton && (
        <button onClick={onPressed} className="text-sm text-blue-600">
          {buttonTitle}
        </button>
      )}
    </div>
  );
};

export default Sectionheading;

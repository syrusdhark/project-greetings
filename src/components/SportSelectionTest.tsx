import React from 'react';
import SportSelection from './SportSelection';

// Test component to verify sports display correctly
const SportSelectionTest = () => {
  const [selectedSport, setSelectedSport] = React.useState('');
  
  // Mock available sports (simulate what comes from database)
  const availableSports = ['Surfing', 'Scuba Diving', 'Kitesurfing', 'Kayaking', 'Windsurfing'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Sports Selection Test
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Available Sports from DB:</h2>
          <div className="flex flex-wrap gap-2">
            {availableSports.map(sport => (
              <span key={sport} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                {sport}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <SportSelection
            selectedSport={selectedSport}
            onSportSelect={setSelectedSport}
            userLocation="Chennai"
            availableSports={availableSports}
          />
        </div>
        
        {selectedSport && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Selected Sport:</h3>
            <p className="text-white">{selectedSport}</p>
          </div>
        )}
        
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Expected Behavior:</h3>
          <ul className="text-white space-y-2">
            <li>✅ <strong>Surfing, Scuba Diving, Kitesurfing, Kayaking, Windsurfing</strong> - Should show as available (green, clickable)</li>
            <li>⚠️ <strong>Paddleboarding</strong> - Should show as "Coming Soon" (greyed out, not clickable)</li>
            <li>📱 <strong>Mobile</strong> - Should show 2 columns of square tiles</li>
            <li>💻 <strong>Desktop</strong> - Should show responsive grid: 2 cols (sm) → 3 cols (md) → 4 cols (lg) → 6 cols (xl)</li>
            <li>🖼️ <strong>Images</strong> - Should be square tiles (aspect-square) with object-cover</li>
            <li>📝 <strong>Text</strong> - Sport names should be larger (text-xl on desktop, text-sm on mobile)</li>
            <li>♿ <strong>Accessibility</strong> - Each card should have role="button" and aria-label</li>
            <li>❌ <strong>Descriptions</strong> - Should be removed completely</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SportSelectionTest;

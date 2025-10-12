/**
 * Team Logo Demo Component
 * Shows how to use the new team logo system
 */

import React, { useState } from 'react';
import TeamLogo from '../ui/TeamLogo';
import { useTeamLogos } from '../../hooks/useTeamLogos';
import { PREMIER_LEAGUE_TEAMS } from '../../utils/teamLogos';

const TeamLogoDemo = () => {
  const [selectedTeam, setSelectedTeam] = useState('Arsenal');
  const [logoSize, setLogoSize] = useState(64);
  
  const {
    getLogoSync,
    preloadLogos,
    isPreloading,
    preloadProgress,
    cacheStats,
    clearCache
  } = useTeamLogos({
    preload: false // Don't auto-preload for demo
  });

  const handlePreload = () => {
    preloadLogos();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold mb-2">Team Logo System Demo</h2>
        <p className="text-gray-600">
          Complete Premier League logo management with fallbacks and caching
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Team:</label>
          <select 
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {PREMIER_LEAGUE_TEAMS.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo Size:</label>
          <input
            type="range"
            min="32"
            max="128"
            value={logoSize}
            onChange={(e) => setLogoSize(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{logoSize}px</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cache Actions:</label>
          <div className="space-x-2">
            <button
              onClick={handlePreload}
              disabled={isPreloading}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
            >
              {isPreloading ? `${preloadProgress}%` : 'Preload All'}
            </button>
            <button
              onClick={clearCache}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Selected Team Demo */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Selected Team: {selectedTeam}</h3>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <TeamLogo 
              teamName={selectedTeam} 
              size={logoSize}
              showTeamName={false}
            />
            <p className="text-sm mt-1">Component</p>
          </div>
          
          <div className="text-center">
            <img 
              src={getLogoSync(selectedTeam)} 
              alt={`${selectedTeam} logo`}
              width={logoSize}
              height={logoSize}
              className="rounded"
            />
            <p className="text-sm mt-1">Hook Direct</p>
          </div>
        </div>
      </div>

      {/* All Teams Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-3">All Premier League Teams</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {PREMIER_LEAGUE_TEAMS.map(team => (
            <div 
              key={team} 
              className={`p-3 border rounded-lg text-center cursor-pointer transition-colors ${
                selectedTeam === team ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              <TeamLogo 
                teamName={team} 
                size={48} 
                className="mx-auto mb-2"
              />
              <p className="text-sm font-medium truncate" title={team}>
                {team}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Stats */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Cache Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Cached Logos:</span>
            <span className="ml-2">{cacheStats.size}</span>
          </div>
          <div>
            <span className="font-medium">Coverage:</span>
            <span className="ml-2">{Math.round(cacheStats.coverage)}%</span>
          </div>
          <div>
            <span className="font-medium">Preloading:</span>
            <span className="ml-2">{isPreloading ? `${preloadProgress}%` : 'Complete'}</span>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Usage Examples</h3>
        <div className="space-y-3 text-sm bg-gray-900 text-green-400 p-4 rounded-lg font-mono">
          <div>{`// Basic usage in component`}</div>
          <div>{`<TeamLogo teamName="Arsenal" size={48} />`}</div>
          <div className="pt-2">{`// With team name`}</div>
          <div>{`<TeamLogo teamName="Chelsea" size={64} showTeamName />`}</div>
          <div className="pt-2">{`// Using hook directly`}</div>
          <div>{`const { getLogoSync } = useTeamLogos();`}</div>
          <div>{`const logo = getLogoSync("Liverpool");`}</div>
          <div className="pt-2">{`// Preload for performance`}</div>
          <div>{`const { preloadLogos } = useTeamLogos({ preload: true });`}</div>
        </div>
      </div>
    </div>
  );
};

export default TeamLogoDemo;
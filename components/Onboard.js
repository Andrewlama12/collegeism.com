import { useState } from 'react';

export default function Onboard({ onDone }) {
  const [selectedType, setSelectedType] = useState('');

  const archetypes = [
    { 
      id: 'achiever',
      name: 'The Achiever', 
      description: 'Goal-oriented, disciplined, values structure and productivity.' 
    },
    { 
      id: 'creative',
      name: 'The Creative', 
      description: 'Imaginative, open-minded, values expression and inspiration.' 
    },
    { 
      id: 'caregiver',
      name: 'The Caregiver', 
      description: 'Nurturing, compassionate, values connection and relationships.' 
    },
    { 
      id: 'explorer',
      name: 'The Explorer', 
      description: 'Adventurous, curious, values freedom and new experiences.' 
    },
    { 
      id: 'analyzer',
      name: 'The Analyzer', 
      description: 'Intellectual, objective, values knowledge and understanding.' 
    }
  ];

  const handleComplete = () => {
    if (selectedType) {
      onDone(selectedType);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center font-[Montserrat]">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-semibold mb-8 text-center">Choose Your Type</h1>
        <p className="text-gray-600 mb-8 text-center">
          To personalize your plans, we need to understand your personality type.
          Choose the option that best describes you.
        </p>
        
        <div className="grid gap-4 mb-8">
          {archetypes.map(type => (
            <div 
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`
                p-6 border rounded-xl cursor-pointer transition-all
                ${selectedType === type.id 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <h3 className="font-semibold text-lg">{type.name}</h3>
              <p className="text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleComplete}
          disabled={!selectedType}
          className={`
            w-full py-3 rounded-lg text-lg transition
            ${selectedType 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
} 
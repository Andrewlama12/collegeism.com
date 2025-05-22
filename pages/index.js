import React, { useState } from 'react';
import Head from 'next/head';

export default function LifePlannerForm() {
  const [form, setForm] = useState({
    age: '30',
    occupation: 'Engineer',
    stressLevel: 3,
    caffeine: 'High',
    relationship: 'Strong',
  });

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const result = data.result || '';
      
      // Parse the response into steps or use default steps
      const stepsArray = result && result.trim()
        ? result
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => line)
        : ['Take a walk outside', 'Declutter your workspace', 'Set boundaries at work', 'Try a new hobby', 'Talk to a therapist'];
      
      setSteps(stepsArray);
    } catch (err) {
      console.error(err);
      setSteps(['Error generating plan. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create select with dropdown arrow
  const createSelect = (name, value, onChange, options) => {
    return React.createElement('div', { className: 'relative' },
      React.createElement('select', {
        name,
        value,
        onChange,
        className: 'w-full p-3 border border-gray-300 rounded-lg appearance-none pr-10 bg-white'
      }, options.map(opt => 
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
      )),
      React.createElement('div', {
        className: 'absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'
      }, React.createElement('svg', {
        className: 'w-5 h-5 text-gray-500',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '2',
        d: 'M19 9l-7 7-7-7'
      })))
    );
  };

  // Create form section
  const formSection = React.createElement('div', {
    className: 'w-full md:w-1/2 p-8 md:p-12 md:border-r border-gray-200'
  }, [
    // Title
    React.createElement('h1', { 
      key: 'title',
      className: 'text-4xl font-bold mb-8' 
    }, 'Stress Reduction'),
    
    // Form content
    React.createElement('div', { key: 'form', className: 'space-y-6' }, [
      // Age
      React.createElement('div', { key: 'age-group' }, [
        React.createElement('label', { 
          className: 'block text-xl mb-2' 
        }, 'Age'),
        createSelect('age', form.age, handleChange, [
          { value: '20', label: '20' },
          { value: '30', label: '30' },
          { value: '40', label: '40' },
          { value: '50', label: '50' },
          { value: '60+', label: '60+' }
        ])
      ]),
      
      // Occupation
      React.createElement('div', { key: 'occupation-group' }, [
        React.createElement('label', { 
          className: 'block text-xl mb-2' 
        }, 'Occupation'),
        createSelect('occupation', form.occupation, handleChange, [
          { value: 'Engineer', label: 'Engineer' },
          { value: 'Teacher', label: 'Teacher' },
          { value: 'Healthcare', label: 'Healthcare' },
          { value: 'Business', label: 'Business' },
          { value: 'Student', label: 'Student' },
          { value: 'Other', label: 'Other' }
        ])
      ]),
      
      // Stress Level
      React.createElement('div', { key: 'stress-group' }, [
        React.createElement('label', { 
          className: 'block text-xl mb-2' 
        }, 'Stress Level'),
        React.createElement('div', {
          className: 'flex items-center gap-4'
        }, [
          React.createElement('input', {
            type: 'range',
            min: '1',
            max: '5',
            value: form.stressLevel,
            onChange: (e) => handleSliderChange('stressLevel', e.target.value),
            className: 'w-full h-1 bg-gray-200 rounded appearance-none'
          }),
          React.createElement('span', {
            className: 'text-xl font-medium'
          }, form.stressLevel)
        ])
      ]),
      
      // Caffeine Consumption
      React.createElement('div', { key: 'caffeine-group' }, [
        React.createElement('label', { 
          className: 'block text-xl mb-2' 
        }, 'Caffeine Consumption'),
        createSelect('caffeine', form.caffeine, handleChange, [
          { value: 'None', label: 'None' },
          { value: 'Low', label: 'Low' },
          { value: 'Medium', label: 'Medium' },
          { value: 'High', label: 'High' }
        ])
      ]),
      
      // Relationship Strength
      React.createElement('div', { key: 'relationship-group' }, [
        React.createElement('label', { 
          className: 'block text-xl mb-2' 
        }, 'Relationship Strength'),
        createSelect('relationship', form.relationship, handleChange, [
          { value: 'Single', label: 'Single' },
          { value: 'Weak', label: 'Weak' },
          { value: 'Moderate', label: 'Moderate' },
          { value: 'Strong', label: 'Strong' }
        ])
      ]),
      
      // Generate Button
      React.createElement('button', {
        key: 'generate-btn',
        onClick: handleSubmit,
        disabled: loading,
        className: 'w-full p-3 mt-4 bg-white border border-gray-300 rounded-lg text-lg font-medium hover:bg-gray-50 transition-all'
      }, loading ? 'Generating...' : 'Generate Plan')
    ])
  ]);

  // Create steps section
  const stepsSection = React.createElement('div', {
    className: 'w-full md:w-1/2 p-8 md:p-12 bg-white'
  }, [
    // Title
    React.createElement('h1', { 
      key: 'title',
      className: 'text-4xl font-bold mb-8' 
    }, 'Personalized Steps'),
    
    // Steps content
    React.createElement('div', { 
      key: 'steps-content',
      className: 'space-y-5' 
    }, steps.length > 0 
      ? steps.map((step, index) => 
          React.createElement('div', {
            key: `step-${index}`,
            className: 'p-5 bg-white border border-gray-200 rounded-xl'
          }, React.createElement('p', {
            className: 'text-xl'
          }, step))
        )
      : [React.createElement('p', {
          key: 'placeholder',
          className: 'text-gray-500 text-xl'
        }, 'Generate a plan to see your personalized steps')]
    )
  ]);

  // Main container
  return React.createElement('div', {
    className: 'min-h-screen bg-white text-black font-sans'
  }, React.createElement('div', {
    className: 'flex flex-col md:flex-row min-h-screen'
  }, [formSection, stepsSection]));
}

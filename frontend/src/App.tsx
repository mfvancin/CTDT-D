import { useState } from 'react';
import './App.css';

interface ComponentData {
  name: string;
  type: string;
  consumption: number;
  lifespan: number;
}

interface EvaluationResults {
  final_score: number;
  classification: string;
  detailed_scores: Record<string, number>;
}

function App() {
  const [components, setComponents] = useState<ComponentData[]>([{ name: '', type: '', consumption: 0, lifespan: 0 }]);
  const [results, setResults] = useState<EvaluationResults | null>(null);
  const [history, setHistory] = useState<EvaluationResults[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addComponent = () => {
    setComponents([...components, { name: '', type: '', consumption: 0, lifespan: 0 }]);
  };

  const handleComponentChange = (index: number, key: keyof ComponentData, value: string | number) => {
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], [key]: value };
    setComponents(updatedComponents);
  };

  const evaluateTwin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data: EvaluationResults = await response.json();
      setResults(data);
      setHistory([...history, data]);
    } catch (error) {
      console.error('Error evaluating digital twin:', error);
      alert('Failed to evaluate digital twin. Please check the input and server connection.');
    }
  };

  return (
    <div className="App">
      <header>
      <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '☰' : '☰'}
        </button>
        <h1>Digital Twin Evaluator</h1>
      </header>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>History</h2>
        <ul>
          {history.map((entry, index) => (
            <li key={index}>Score: {entry.final_score} - {entry.classification}</li>
          ))}
        </ul>
      </div>
      <form>
        <h2>Components</h2>
        {components.map((component, index) => (
          <div key={index} className="component-group">
            <h3>#{index + 1}</h3>
            <label>Name:</label>
            <input
              type="text"
              placeholder="Name"
              value={component.name}
              onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
            />
            <label>Type:</label>
            <input
              type="text"
              placeholder="Type"
              value={component.type}
              onChange={(e) => handleComponentChange(index, 'type', e.target.value)}
            />
            <label>Consumption (kWh/day):</label>
            <input
              type="number"
              step="0.5"
              value={component.consumption}
              onChange={(e) => handleComponentChange(index, 'consumption', parseFloat(e.target.value))}
            />
            <label>Lifespan (years):</label>
            <input
              type="number"
              step="1"
              value={component.lifespan}
              onChange={(e) => handleComponentChange(index, 'lifespan', parseFloat(e.target.value))}
            />
          </div>
        ))}
        <button type="button" onClick={addComponent}>Add Component</button>
        <button type="button" onClick={evaluateTwin}>Evaluate</button>
      </form>

      {results && (
        <div className="results">
          <h2>Results</h2>
          <p>Final Score: {results.final_score}</p>
          <p>Classification: {results.classification}</p>
          <h3>Detailed Scores:</h3>
          {Object.entries(results.detailed_scores).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
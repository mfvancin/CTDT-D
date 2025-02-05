import { useState, useEffect, useRef } from 'react';
import { HelpCircle, X } from 'lucide-react';
// import { AuthProvider, useAuth } from './AuthContext';
// import { AuthPage } from './AuthPage';
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

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative inline-flex items-center" ref={tooltipRef}>
      <div className="flex items-center gap-1">
        {children}
        <HelpCircle 
          className="w-4 h-4 cursor-pointer" 
          style={{ color: '#000080' }} 
          onClick={toggleTooltip}
        />
      </div>
      {isVisible && (
        <div className="tooltip-overlay">
          <div className="tooltip-content">
            <X 
              className="absolute top-1 left-1 w-4 h-4 cursor-pointer" 
              style={{ color: '#000080' }} 
              onClick={() => setIsVisible(false)}
            />
            <div className="ml-5 mt-2">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function MainContent() {
  // const { user, logout } = useAuth();
  const [components, setComponents] = useState<ComponentData[]>([{ name: '', type: '', consumption: 0, lifespan: 0 }]);
  const [results, setResults] = useState<EvaluationResults | null>(null);
  const [history, setHistory] = useState<EvaluationResults[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const componentDetails = [
    {
      type: "RoHS (Restriction of Hazardous Substances Directive) - 2011/65/EU",
      description: "Specifies restrictions on the use of specific hazardous materials found in electrical and electronic products."
    },
    {
      type: "WEEE (Waste Electrical and Electronic Equipment Directive) - 2012/19/EU",
      description: "Sets collection, recycling, and recovery targets for electrical goods and is a key piece of legislation that governs the disposal of electronic waste."
    },
    {
      type: "Energy Star Certification",
      description: "A widely recognized standard that signifies energy efficiency in various products including office equipment, heating and cooling systems, and electronics."
    },
    {
      type: "EPEAT (Electronic Product Environmental Assessment Tool)",
      description: "A global rating system for greener electronics, covering a broad range of criteria including energy consumption and material selection."
    },
    {
      type: "REACH (Registration, Evaluation, Authorisation, and Restriction of Chemicals) - EC 1907/2006",
      description: "Aims to improve the protection of human health and the environment through the better and earlier identification of the intrinsic properties of chemical substances."
    },
    {
      type: "Eco-Management and Audit Scheme (EMAS)",
      description: "Voluntary EU initiative designed to improve companies’ environmental performance. Its logo is awarded to companies and other organizations which meet high environmental standards."
    },
    {
      type: "ISO 14001",
      description: "Part of the ISO 14000 family of standards on environmental management, this helps organizations improve their environmental performance through more efficient use of resources and reduction of waste."
    },
    {
      type: "EU Eco-label",
      description: "A label of environmental excellence that is awarded to products and services meeting high environmental standards throughout their life-cycle: from raw material extraction, to production, distribution, and disposal."
    },
    {
      type: "The Blue Angel",
      description: "The German certification for products and services that have environmentally friendly aspects. It is recognized across Europe and globally."
    },
    {
      type: "TCO Certified",
      description: "International sustainability certification for IT products, considering not only energy efficiency and reductions in hazardous materials but also the corporate social responsibility (CSR) performance of the product manufacturers."
    }
  ];

  const tooltips = {
    finalScore: "The algorithm calculates the final score using weighted components: Component Efficiency (20%), Energy Source (25%), Reusability (20%), and Waste Management (20%). Scores range from 0-100, with ≥75 classified as 'Ecologic', ≥50 as 'Moderate', and <50 as 'Not ecologic'.",
    componentEfficiency: "Component efficiency is calculated by summing the energy consumption (kWh/day) of all components and normalizing it per component. The score starts at 100 and decreases based on average consumption, ensuring higher efficiency results in better scores.",
    energySource: "Energy source score directly reflects the percentage of renewable energy used (0-100%). This considers your local energy grid's renewable energy mix, with higher renewable percentages resulting in better scores.",
    reusability: "Reusability is a binary score: 100 points if the components are reusable, 0 if not. This encourages designs that consider end-of-life component recovery and reuse in other applications.",
    waste: "Waste score starts at 100 and decreases by 10 points per kg of waste generated. The algorithm caps the minimum score at 0 and the maximum at 100, encouraging minimal waste production.",
    consumption: "Enter the daily energy consumption in kilowatt-hours (kWh/day). This value directly impacts the component efficiency score - lower consumption leads to higher scores in the final evaluation.",
    lifespan: "Component lifespan in years affects the overall sustainability assessment. Longer lifespans typically indicate better sustainability as they reduce the need for frequent replacements.",
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('evaluationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('evaluationHistory', JSON.stringify(history));
  }, [history]);

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
      const response = await fetch('https://ctdt-d.onrender.com/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application: 'custom',
          components: components,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data: EvaluationResults = await response.json();
      setResults(data);
      const updatedHistory = [...history, data];
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error evaluating digital twin:', error);
      alert('Failed to evaluate digital twin. Please check the input and server connection.');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('evaluationHistory');
  };

  const togglePopup = () => {
    setPopupOpen(!popupOpen);
  };

  return (
    <div className="App">
      <header>
        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <div className="header-content">
          <div className="header-logos">
            <img src="/up2circ.png" alt="Up2Circ Logo" className="up2circ-logo" />
            <img src="/ctdt-c.png" alt="CTDT-C Logo" className="ctdt-logo" />
          </div>
          <h1>Ecological Evaluator</h1>
        </div>
        <div className="header-actions">
          {/* <span className="user-info">Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button> */}
          <button className="info-btn" onClick={togglePopup} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ⓘ</button>
        </div>
      </header>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>History</h2>
        <ul>
          {history.map((entry, index) => (
            <li key={index}>
              Score: {entry.final_score} - {entry.classification}
            </li>
          ))}
        </ul>
        <button onClick={clearHistory}>Clear History</button>
      </div>

      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>European standards considered in the algorithm</h2>
              <button className="close-btn" onClick={togglePopup}>✕</button>
            </div>
            {componentDetails.map((detail, index) => (
              <div key={index}>
                <h3>{detail.type}</h3>
                <p>{detail.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
            <div className="consumption-lifespan">
                <Tooltip content={tooltips.consumption}>
                  <label>Consumption (kWh/day):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={component.consumption}
                    onChange={(e) => handleComponentChange(index, 'consumption', parseFloat(e.target.value))}
                  />
                </Tooltip>

                <Tooltip content={tooltips.lifespan}>
                  <label>Lifespan (years):</label>
                  <input
                    type="number"
                    step="1"
                    value={component.lifespan}
                    onChange={(e) => handleComponentChange(index, 'lifespan', parseFloat(e.target.value))}
                  />
                </Tooltip>
            </div>
          </div>
        ))}
        <button type="button" onClick={addComponent}>Add Component</button>
        <button type="button" onClick={evaluateTwin}>Evaluate</button>
      </form>

      {results && (
        <div className="results">
          <h2>Results</h2>
          <div className="final-score-classification">
            <div className="score-item">
              <Tooltip content={tooltips.finalScore}>
                <label>Final Score:</label>
                <p>{results.final_score}</p>
              </Tooltip>
            </div>
            <div className="score-item">
              <label>Classification:</label>
              <p>{results.classification}</p>
            </div>
          </div>
          <h3>Detailed Scores:</h3>
          <div className="detailed-scores">
            <div className="score-item">
              <Tooltip content={tooltips.componentEfficiency}>
                <label>Component Efficiency:</label>
                <p>{results.detailed_scores['component_efficiency']}</p>
              </Tooltip>
            </div>
            <div className="score-item">
              <Tooltip content={tooltips.energySource}>
                <label>Energy Source:</label>
                <p>{results.detailed_scores['energy_source']}</p>
              </Tooltip>
            </div>
            <div className="score-item">
              <Tooltip content={tooltips.reusability}>
                <label>Reusability:</label>
                <p>{results.detailed_scores['reusability']}</p>
              </Tooltip>
            </div>
            <div className="score-item">
              <Tooltip content={tooltips.waste}>
                <label>Waste:</label>
                <p>{results.detailed_scores['waste']}</p>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      <footer>
        <img src="/eulogo.png" alt="EU Logo" className="eu-logo" />
      </footer>
    </div>
  );
}

function App() {
  return (
    // <AuthProvider>
    //   <AppContent />
    // </AuthProvider>
    <MainContent />
  );
}

// function AppContent() {
//   const { isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <AuthPage />;
//   }

//   return <MainContent />;
// }

export default App;
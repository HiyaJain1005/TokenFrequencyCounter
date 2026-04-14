import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code2, Activity, Table as TableIcon, BarChart2, GitCommit, AlertCircle } from 'lucide-react';
import { analyzeTokenStream } from './tokenizer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './index.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CODE_SAMPLES = {
  c: `// A simple lexical analysis example
int main() {
    float salary = 5000.50;
    string role = "Developer";
    
    if (salary > 3000) {
        salary = salary + 1000;
    }
    
    return 0;
}
`,
  cpp: `// C++ example
#include <iostream>
using namespace std;

int main() {
    int counter = 0;
    for(int i = 0; i < 10; i++) {
        counter += i;
    }
    return 0;
}
`,
  python: `# Python example
def calculate_total(price, tax):
    total = price + (price * tax)
    return total

if __name__ == "__main__":
    current_price = 100.50
    final = calculate_total(current_price, 0.05)
`,
  java: `// Java example
public class Main {
    public static void main(String[] args) {
        int items = 5;
        double cost = 19.99;
        System.out.println("Total: " + (items * cost));
    }
}
`
};

function App() {
  const [editorLang, setEditorLang] = useState('c');
  const [code, setCode] = useState(CODE_SAMPLES['c']);
  const [activeTab, setActiveTab] = useState('stream');
  
  const [tokens, setTokens] = useState([]);
  const [frequencies, setFrequencies] = useState({});
  const [errors, setErrors] = useState([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const editorRef = React.useRef(null);
  const monacoRef = React.useRef(null);
  const decorationsRef = React.useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const highlightToken = (tokenValue) => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Find all occurrences of the exact token
    const matches = model.findMatches(tokenValue, false, false, true, null, true);
    
    const newDecorations = matches.map(match => ({
      range: match.range,
      options: { 
        inlineClassName: 'monaco-token-highlight',
        stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    }));

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
  };

  const handleAnalyze = () => {
    const { tokens, frequencies, errors } = analyzeTokenStream(code);
    setTokens(tokens);
    setFrequencies(frequencies);
    setErrors(errors);
    setHasAnalyzed(true);
  };

  const chartData = {
    labels: Object.keys(frequencies),
    datasets: [
      {
        label: 'Token Frequency',
        data: Object.values(frequencies),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)', // Blue
          'rgba(16, 185, 129, 0.6)',  // Green
          'rgba(239, 68, 68, 0.6)',   // Red
          'rgba(245, 158, 11, 0.6)',  // Orange
          'rgba(139, 92, 246, 0.6)'   // Purple
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Token Distribution',
        color: '#e2e8f0'
      },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  // Group tokens for the table
  const uniqueTokensMap = new Map();
  tokens.forEach(t => {
    if (!uniqueTokensMap.has(t.value)) {
      uniqueTokensMap.set(t.value, { value: t.value, type: t.type, count: 1 });
    } else {
      uniqueTokensMap.get(t.value).count++;
    }
  });
  const tableData = Array.from(uniqueTokensMap.values()).sort((a,b) => b.count - a.count);

  return (
    <div className="app-container">
      <header className="header">
        <div className="title">
          <Activity className="w-8 h-8 text-blue-500" />
          Token Frequency Analyzer
        </div>
        <button className="btn-primary" onClick={handleAnalyze}>
          <Play className="w-5 h-5 fill-current" />
          Analyze Code
        </button>
      </header>

      <main className="main-content">
        {/* Left Panel: Editor */}
        <section className="panel">
          <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Code2 className="w-5 h-5" /> Source Code
            </div>
            <select 
              value={editorLang}
              onChange={(e) => {
                const newLang = e.target.value;
                setEditorLang(newLang);
                setCode(CODE_SAMPLES[newLang]);
                setHasAnalyzed(false); // Reset analysis on code change
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="c" style={{color: '#000'}}>C</option>
              <option value="cpp" style={{color: '#000'}}>C++</option>
              <option value="python" style={{color: '#000'}}>Python</option>
              <option value="java" style={{color: '#000'}}>Java</option>
            </select>
          </div>
          <div className="editor-container">
            <Editor
              height="100%"
              language={editorLang}
              theme="vs-dark"
              value={code}
              onChange={(value) => {
                setCode(value || '');
                // Clear highlights on edit
                if (editorRef.current && decorationsRef.current.length > 0) {
                  decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
                }
              }}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </section>

        {/* Right Panel: Analysis Results */}
        <section className="panel">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'stream' ? 'active' : ''}`}
              onClick={() => setActiveTab('stream')}
            >
              <Activity className="w-4 h-4" /> Token Stream
            </button>
            <button 
              className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              <TableIcon className="w-4 h-4" /> Table
            </button>
            <button 
              className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => setActiveTab('chart')}
            >
              <BarChart2 className="w-4 h-4" /> Chart
            </button>
            <button 
              className={`tab-btn ${activeTab === 'dfa' ? 'active' : ''}`}
              onClick={() => setActiveTab('dfa')}
            >
              <GitCommit className="w-4 h-4" /> DFA Demo
            </button>
          </div>

          <div className="tab-content">
            {!hasAnalyzed ? (
              <div style={{color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem'}}>
                <Activity className="w-16 h-16 mx-auto mb-4" style={{opacity: 0.2}} />
                <p>Click "Analyze Code" to see the lexical analysis results.</p>
              </div>
            ) : (
              <>
                {/* Error Display */}
                {errors.length > 0 && activeTab !== 'dfa' && (
                  <div style={{marginBottom: '1.5rem'}}>
                    {errors.map((err, i) => (
                      <div key={i} className="error-msg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{err.message} at Position {err.position}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stream Tab */}
                {activeTab === 'stream' && (
                  <div className="token-stream">
                    {tokens.map((token, i) => (
                      <span 
                        key={token.id} 
                        className={`token-badge type-${token.type}`}
                        style={{animationDelay: `${i * 0.02}s`}}
                        title={`${token.type}: ${token.value}`}
                      >
                        {token.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Table Tab */}
                {activeTab === 'table' && (
                  <table className="table-wrapper">
                    <thead>
                      <tr>
                        <th>Token Value</th>
                        <th>Type Classification</th>
                        <th>Frequency (Count)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr 
                          key={i} 
                          onClick={() => highlightToken(row.value)}
                          style={{cursor: 'pointer'}}
                          title="Click to highlight occurrences"
                        >
                          <td style={{fontFamily: 'monospace'}}>{row.value}</td>
                          <td>
                            <span className={`token-badge type-${row.type}`}>{row.type}</span>
                          </td>
                          <td>{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Chart Tab */}
                {activeTab === 'chart' && (
                  <div style={{ height: '300px', width: '100%' }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                )}

                {/* DFA Tab */}
                {activeTab === 'dfa' && (
                  <div>
                    <h3 style={{marginBottom: '1rem', color: 'var(--text-primary)'}}>Simplified Identifier FSM</h3>
                    <div className="fsm-diagram">
                      <div className="fsm-node">START</div>
                      <div className="fsm-edge">
                        <span className="fsm-label">[a-zA-Z_]</span>
                      </div>
                      <div className="fsm-node">ID</div>
                      <div className="fsm-edge">
                        <span className="fsm-label">[a-zA-Z0-9_]</span>
                      </div>
                      <div className="fsm-node accept">ACCEPT</div>
                    </div>
                    
                    <h3 style={{marginBottom: '1rem', color: 'var(--text-primary)'}}>Simplified Number FSM</h3>
                    <div className="fsm-diagram">
                      <div className="fsm-node">START</div>
                      <div className="fsm-edge">
                        <span className="fsm-label">[0-9]</span>
                      </div>
                      <div className="fsm-node">NUM</div>
                      <div className="fsm-edge">
                        <span className="fsm-label">[0-9]</span>
                      </div>
                      <div className="fsm-node accept">ACCEPT</div>
                    </div>

                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center'}}>
                      These diagrams visualize the internal logic used by the Tokenizer string scanner.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

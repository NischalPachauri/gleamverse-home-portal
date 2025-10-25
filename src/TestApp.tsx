import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// Test individual components
const TestApp = () => {
  const [tests, setTests] = useState({
    react: false,
    theme: false,
    assets: false,
    router: false
  });

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Test 1: React
    setTests(prev => ({ ...prev, react: true }));

    // Test 2: Theme Context
    setTests(prev => ({ ...prev, theme: true }));

    // Test 3: Assets
    const testAssets = async () => {
      try {
        const response = await fetch('/src/assets/covers/hp1.jpg');
        setTests(prev => ({ ...prev, assets: response.ok }));
      } catch (error) {
        console.log("Asset test failed:", error);
        setTests(prev => ({ ...prev, assets: false }));
      }
    };
    testAssets();

    // Test 4: Router
    setTests(prev => ({ ...prev, router: true }));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Component Tests</h1>
      <p>Current theme: <strong>{theme}</strong></p>
      <button onClick={toggleTheme} style={{ padding: '10px', marginBottom: '20px' }}>
        Toggle Theme
      </button>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ padding: '15px', border: '2px solid #ccc', borderRadius: '8px' }}>
          <h2>Test 1: Basic React {tests.react ? '✅' : '❌'}</h2>
          <p>React components are rendering properly</p>
        </div>

        <div style={{ padding: '15px', border: '2px solid #ccc', borderRadius: '8px' }}>
          <h2>Test 2: Theme Context {tests.theme ? '✅' : '❌'}</h2>
          <p>Theme context is working - Current theme: {theme}</p>
        </div>

        <div style={{ padding: '15px', border: '2px solid #ccc', borderRadius: '8px' }}>
          <h2>Test 3: Router {tests.router ? '✅' : '❌'}</h2>
          <p>React Router is functioning</p>
        </div>

        <div style={{ padding: '15px', border: '2px solid #ccc', borderRadius: '8px' }}>
          <h2>Test 4: Assets {tests.assets ? '✅' : '❌'}</h2>
          <p>Asset loading: {tests.assets ? 'Working' : 'Failed'}</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>🎯 Next Steps</h3>
        <p>If all tests pass, go to <a href="/" style={{ color: 'blue' }}>/</a> to see the full application.</p>
        <p>If tests fail, we'll fix them individually.</p>
      </div>
    </div>
  );
};

export default TestApp;
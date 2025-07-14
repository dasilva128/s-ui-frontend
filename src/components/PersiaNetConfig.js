import React, { useState } from 'react';

const PersiaNetConfig = () => {
  const [protocol, setProtocol] = useState('quic');
  const [fallback, setFallback] = useState('http2');

  const handleSave = async () => {
    const config = {
      type: 'persianet',
      protocol,
      listen: '::',
      port: 443,
      settings: {
        encryption: 'chacha20-poly1305',
        obfuscation: 'https',
        fragmentation: { enabled: true, size: '100-200' },
      },
      fallback: fallback === 'http2' ? { type: 'http', transport: 'h2', port: 443 } : null,
      tls: { enabled: true, server_name: 'example.com', alpn: ['h2', 'http/1.1'] },
    };
    try {
      await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      alert('PersiaNet config saved!');
    } catch (error) {
      alert('Error saving config: ' + error);
    }
  };

  return (
    <div>
      <h2>PersiaNet Configuration</h2>
      <label>
        Protocol:
        <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
          <option value="quic">QUIC (UDP)</option>
          <option value="tcp">TCP</option>
        </select>
      </label>
      <label>
        Fallback:
        <select value={fallback} onChange={(e) => setFallback(e.target.value)}>
          <option value="http2">HTTP/2</option>
          <option value="none">None</option>
        </select>
      </label>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default PersiaNetConfig;

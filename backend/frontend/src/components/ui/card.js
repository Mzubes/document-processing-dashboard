document-processing-dashboard/
├── backend/
│   └── fastapi_colab_setup.py
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── card.js
│   │   │   │   ├── button.js
│   │   │   │   ├── table.js
│   │   ├── Dashboard.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
import React from 'react';

export function Card({ children }) {
  return (
    <div className="border rounded shadow p-4">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}import React from 'react';

export function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded">
      {children}
    </button>
  );
}import React from 'react';

export function Table({ children, className }) {
  return (
    <table className={`min-w-full ${className}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-gray-200">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return (
    <tbody className="bg-white">
      {children}
    </tbody>
  );
}

export function TableRow({ children }) {
  return (
    <tr className="border-b">
      {children}
    </tr>
  );
}

export function TableCell({ children }) {
  return (
    <td className="p-4">
      {children}
    </td>
  );
}import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "./components/ui/table";
import { Line } from "react-chartjs-2";
import axios from "axios";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ processed: 0, failed: 0 });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("YOUR_PUBLIC_NGROK_URL/api/documents");
      setDocuments(response.data.documents);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching documents", error);
    }
  };

  const processDocument = async (id) => {
    try {
      await axios.post(`YOUR_PUBLIC_NGROK_URL/api/process/${id}`);
      fetchDocuments();
    } catch (error) {
      console.error("Error processing document", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Document Processing Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <CardContent>
            <h2 className="text-lg">Processed Documents</h2>
            <p className="text-2xl">{stats.processed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg">Failed Documents</h2>
            <p className="text-2xl text-red-500">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableCell>Document</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.name}</TableCell>
              <TableCell>{doc.status}</TableCell>
              <TableCell>
                {doc.status !== "Processed" && (
                  <Button onClick={() => processDocument(doc.id)}>Process</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-6">
        <h2 className="text-lg">Processing Trends</h2>
        <Line
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May"],
            datasets: [
              {
                label: "Processed Documents",
                data: [5, 10, 15, 20, 25],
                borderColor: "#4CAF50",
                fill: false,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}import React from 'react';
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();

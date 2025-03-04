import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {Toaster} from "./components/ui/sonner"
import { SocketProvider } from './context/SocketContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SocketProvider>
    <App />
    <Toaster closeButton />
  </SocketProvider>
);

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
                success: {
                    style: { background: '#b45309' },
                },
            }}
        />
    </BrowserRouter>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { Web3Provider } from './contexts/Web3Context';

// 自定义主题
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    culture: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#8B5CF6',
      background: '#F9FAFB',
      text: '#1F2937',
    },
  },
  fonts: {
    heading: '"Noto Sans SC", sans-serif',
    body: '"Noto Sans SC", sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'culture.background',
        color: 'culture.text',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'culture.primary',
          color: 'white',
          _hover: {
            bg: 'blue.500',
          },
        },
        outline: {
          borderColor: 'culture.primary',
          color: 'culture.primary',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Router>
        <Web3Provider>
          <App />
        </Web3Provider>
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);

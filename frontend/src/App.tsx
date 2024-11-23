import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import theme from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import GenPodcast from './pages/GenPodcast';
import BuyCredits from './pages/BuyCredits';
import LeftSidebar from './components/LeftSidebar';
import Sketch from 'react-p5';
import p5Types from 'p5';

// Create a wrapper component for the routes
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === '/login' ||
                      location.pathname === '/register' ||
                      location.pathname === '/reset-password';

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const token = localStorage.getItem('token');
    if (!token && !isAuthRoute) {
      navigate('/login');
    }

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [navigate, location.pathname, isAuthRoute]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB, 360, 100, 100, 100);
  };

  const draw = (p5: p5Types) => {
    p5.background(255);
    p5.noFill();

    const time = p5.millis() * 0.0003;
    const numWaves = 8;

    for (let i = 0; i < numWaves; i++) {
      const hue = (160 + i * 20) % 360;
      p5.strokeWeight(3);
      p5.stroke(hue, 80, 90, 20);
      p5.beginShape();
      for (let x = 0; x < p5.width; x += 10) {
        const y = p5.sin(x * 0.003 + time + i * 0.7) * 150 + p5.height / 2;
        const amplitude = p5.noise(x * 0.005, time + i) * 100;
        const yOffset = p5.sin(x * 0.01 + time * 2 + i) * amplitude;
        const alpha = p5.map(p5.sin(x * 0.005 + time * 1.5 + i), -1, 1, 10, 30);
        p5.stroke(hue, 80, 90, alpha);
        p5.vertex(x, y + yOffset);
      }
      p5.endShape();
    }

    for (let i = 0; i < 50; i++) {
      const x = p5.noise(i, time * 0.1) * p5.width;
      const y = p5.noise(i + 100, time * 0.1) * p5.height;
      const size = p5.noise(i + 200, time * 0.1) * 5 + 2;
      p5.fill(160, 80, 100, 10);
      p5.noStroke();
      p5.ellipse(x, y, size, size);
    }
  };

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} overflow="hidden">
      <Sketch setup={setup} draw={draw} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
      <Flex position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1}>
        {!isAuthRoute && <LeftSidebar />}
        <Box flex={1} ml={isAuthRoute ? 0 : "240px"} overflowY="auto">
          <Routes>
            <Route path="/" element={<GenPodcast />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/buy-credits" element={<BuyCredits />} />
          </Routes>
        </Box>
      </Flex>
    </Box>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ChakraProvider>
  );
};

export default App;
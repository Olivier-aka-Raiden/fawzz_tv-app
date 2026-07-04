import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './components/home/Home';
import Adventures from './components/adventures/Adventures';
import AdventureDetail from './components/adventures/AdventureDetail';
import Clips from './components/clips/Clips';
import Live from './components/live/Live';
import Sponsors from './components/sponsors/Sponsors';
import About from './components/about/About';
import NotFound from './components/shared/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="aventures" element={<Adventures />} />
          <Route path="aventures/:id" element={<AdventureDetail />} />
          <Route path="clips" element={<Clips />} />
          <Route path="live" element={<Live />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="a-propos" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";

import DocumentationView from "./views/DocumentationView";
import TimersView from "./views/TimersView";
import TimersQueue from "./views/TimersQueue";

const Container = styled.div`
  background: #f0f6fb;
  height: 100vh;
  overflow: auto;
`;

const Nav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Timers</Link>
        </li>
        <li>
          <Link to="/add">Add</Link>
        </li>
        <li>
          <Link to="/docs">Documentation</Link>
        </li>
      </ul>
    </nav>
  );
};
const NoMatch = () => {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/add">Go to the home page</Link>
      </p>
    </div>
  );
}
const App = () => {
  return (
    <Container>
      <Router>
        <Nav />
        <Routes>
          <Route path="/docs" element={<DocumentationView />} />
          <Route path="/" element={<TimersView />} />
          <Route path="/add" element={<TimersQueue />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </Router>
    </Container>
  );
};

export default App;

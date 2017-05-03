import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './containers/Home';
import About from './containers/About';

import MainNav from './components/MainNav';

export default () => (
  <Router>
    <div>
      <MainNav />
      <div className="container">
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About}/>
      </div>
    </div>
  </Router>
);

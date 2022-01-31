import logo from './logo.svg';
import './App.css';
import AddShelf from './components/AddShelf';
import { BrowserRouter, Routes, Route, Switch, Link } from 'react-router-dom';
import ListShelf from './components/ListShelf';
import EditShelf from './components/EditShelf';

function App() {
  return (
    <div className="container">
      <Switch>
        <Route path='/' exact>
          <ListShelf />
        </Route>
        <Route path='/add'>
          <AddShelf />
        </Route>
        <Route path='/edit'>
          <EditShelf />
        </Route>
      </Switch>
    </div>
  );
}

export default App;

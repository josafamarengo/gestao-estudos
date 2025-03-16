import { Route, Switch } from "wouter";

import "./style/App.css";

import { Home } from "./pages/Home";
import { AddSubject } from "./pages/AddSubject";

function App() {
  return (
    <main class="container absolute">
      <h1>Gestão de Estudos</h1>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/subjects" component={AddSubject} />
      </Switch>
    </main>
  );
}

export default App;

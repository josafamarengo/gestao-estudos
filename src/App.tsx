import { Route, Switch } from "wouter";

import "./style/App.css";

import { Home } from "./pages/Home";
import { AddSubject } from "./pages/AddSubject";
import { ThemeToggle } from "./components/elements/ThemeToggle";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <MainLayout>
      <h1>Gestão de Estudos</h1>
      <ThemeToggle/>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/subjects" component={AddSubject} />
      </Switch>
    </MainLayout>
  );
}

export default App;

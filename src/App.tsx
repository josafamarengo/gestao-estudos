import { useState, useEffect } from "preact/hooks";
import { Route, Switch, Link } from "wouter";
import { invoke } from "@tauri-apps/api/core";
import "./style/App.css";
import { FormComponent } from "./components/FormComponent";
import { inputsAddSubject } from "./config/config";
import { Home } from "./pages/Home";
import { Subject } from "./pages/Subject";

interface Subject {
  id: number;
  name: string;
  number_of_questions: number;
  points_per_question: number;
  number_of_lessons: number;
}

function App() {
  const [name, setName] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(0.0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(1);

  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<Record<string, string | number>>({
    name: "",
    number_of_questions: 0,
    points_per_question: 0.0,
  });

  const handleChange = (e: Event) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));

    switch (name) {
      case "name":
        setName(value);
        break;
      case "number_of_questions":
        setNumberOfQuestions(Number(value));
        break;
      case "points_per_question":
        setPointsPerQuestion(Number(value));
        break;
      default:
        return;
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    console.log(formData);

    console.log(errorMessage)

    try {
      if (name.length < 3) throw new Error("Nome deve ter ao menos 3 caracteres");
      if (numberOfQuestions <= 0) throw new Error("Deve ter pelo menos uma questão");
      if (pointsPerQuestion < 0.1) throw new Error("Pontos por questão inválidos");

      await invoke("insert_subject", {
        name,
        numberOfQuestions,
        pointsPerQuestion,
      });

      setSubjects(prevSubjects => [
        ...prevSubjects,
        {
          id: Date.now(),
          name,
          number_of_questions: numberOfQuestions,
          points_per_question: pointsPerQuestion,
          number_of_lessons: 0,
        },
      ]);

      setName("");
      setNumberOfQuestions(0);
      setPointsPerQuestion(0.0);
    } catch (error) {
      console.error("Erro ao adicionar disciplina: " + error);

      let message = "Erro desconhecido";

      if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000)
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await invoke("delete_subject", { id });

      // Remove a disciplina do estado
      setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== id));
    } catch (error) {
      console.error("Erro ao excluir disciplina:", error);
      let message = "Erro desconhecido";

      if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000)
    }
  };

  const pageSize = 5;

  const fetchSubjects = async (page: number) => {
    try {
      console.log("Buscando dados...")
      const data = await invoke<Subject[]>("get_subjects_paginated", { page, pageSize });
      console.log("Data: ", JSON.stringify(data, null, 2))

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      setSubjects(data);

      const nextData = await invoke<Subject[]>("get_subjects_paginated", { page: page + 1, pageSize });
      console.log("Dados da próxima página: ", JSON.stringify(nextData, null, 2))
      setHasMore(nextData.length > 0);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
    }
  };

  useEffect(() => {
    fetchSubjects(page);
  }, [page]);

  return (
    <main class="container absolute">
      <h1>Gestão de Estudos</h1>

      <FormComponent
        inputs={inputsAddSubject}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <div>
        <h1>Lista de Disciplinas</h1>
        <ul>
          {subjects.map(subject => (
            <li key={subject.id} className="flex justify-between items-center">
              <span>{subject.name} - {subject.number_of_lessons} aulas</span>
              <button
                onClick={() => handleDelete(subject.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Deletar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-4 py-2">Página {page}</span>
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={!hasMore}
          className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {/* Exibição da mensagem de erro */}
      {errorMessage && (
        <div className="error-message">
          <div className="px-4 py-2">
            <div className="mx-3">
              <span className="font-semibold text-red-500 dark:text-red-400">Error</span>
              <p className="text-sm text-gray-600 dark:text-gray-200">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <nav>
        <Link href="/">Início</Link>
        <Link href="/subjects">Disciplinas</Link>
      </nav>

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/subjects" component={Subject} />
      </Switch>

    </main>
  );
}

export default App;

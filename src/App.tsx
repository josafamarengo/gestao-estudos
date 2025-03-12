import { useState, useEffect } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import "./style/App.css";
import { FormComponent } from "./components/FormComponent";

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

  const [errorMessage, setErrorMessage] = useState("");

  const inputs = [
    { name: "name", type: "text", placeholder: "Nome da Disciplina" },
    { name: "number_of_questions", type: "number", placeholder: "Número de Questões" },
    { name: "points_per_question", type: "number", placeholder: "Pontos por Questão", step: "0.1" },
  ];

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

    console.log({ name, numberOfQuestions, pointsPerQuestion });

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
      if (error instanceof Error) {
        setErrorMessage(error.message);
        setTimeout(() => setErrorMessage(""), 5000)
      } else {
        setErrorMessage("Erro desconhecido");
        setTimeout(() => setErrorMessage(""), 5000)
      }
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const data = await invoke<Subject[]>("get_all_subjects");
      setSubjects(data);
    };

    fetchSubjects();
  }, []);

  return (
    <main class="container absolute">
      <h1>Gestão de Estudos</h1>

      <FormComponent
        inputs={inputs}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <div>
        <h1>Lista de Disciplinas</h1>
        <ul>
          {subjects.map(subject => (
            <li key={subject.id}>
              {subject.name} - {subject.number_of_lessons} aulas
            </li>
          ))}
        </ul>
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

    </main>
  );
}

export default App;

import { useState, useEffect } from "preact/hooks";
import { useLocation } from "wouter";
import { invoke } from "@tauri-apps/api/core";

import { Subject } from "../types";

export const Home = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [location, setLocation] = useLocation();

    const [errorMessage, setErrorMessage] = useState("");

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
        <div>
            <header>
                <h1>Lista de Disciplinas</h1>
                <button onClick={() => setLocation("/subjects")}>Adicionar Matéria</button>
            </header>
            <div>
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
        </div>
    )
}

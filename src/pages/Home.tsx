import { useLocation } from "wouter";

import { useSubject } from "../hooks/useSubject";
import TableRow from "../components/elements/TableRow";

export const Home = () => {
    const [location, setLocation] = useLocation();
    const [subjects, setSubjects, hasMore, setHasMore, page, setPage] = useSubject();

    return (
        <div>
            <header>
                <h1>Lista de Disciplinas</h1>
                <button onClick={() => setLocation("/subjects")}>Adicionar Matéria</button>
            </header>
            <section className="container px-4 mx-auto">
                <div className="flex items-center gap-x-3">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">Team members</h2>

                    <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">100 users</span>
                </div>

                <div className="flex flex-col mt-6">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-x-3">
                                                   <span>Matéria</span>
                                                </div>
                                            </th>

                                            <th scope="col" className="px-12 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <button className="flex items-center gap-x-2">
                                                    <span>Peso</span>
                                                </button>
                                            </th>

                                            <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <button className="flex items-center gap-x-2">
                                                    <span>Progresso</span>
                                                </button>
                                            </th>

                                            <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">Percentual Acerto</th>

                                            <th scope="col" className="relative py-3.5 px-4">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                                        {subjects.map(subject => 
                                            <TableRow 
                                                subject={subject.name} 
                                                weight={subject.number_of_questions * subject.points_per_question} 
                                                progress={subject.number_of_lessons} 
                                                rightPercent={subject.number_of_questions}
                                                id={subject.id}
                                            />
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
            </section>
        </div>
    )
}

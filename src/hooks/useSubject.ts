import { useState, useEffect } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import { Subject } from "../types";

export const useSubject = () => {
       const [subjects, setSubjects] = useState<Subject[]>([]);
       const [hasMore, setHasMore] = useState(true);
       const [page, setPage] = useState(1);

     const pageSize = 5;

     const fetchSubjects = async (page: number) => {
       try {
         console.log("Buscando dados...");
         const data = await invoke<Subject[]>("get_subjects_paginated", {
           page,
           pageSize,
         });
         console.log("Data: ", JSON.stringify(data, null, 2));

         if (!data || data.length === 0) {
           setHasMore(false);
           return;
         }

         setSubjects(data);

         const nextData = await invoke<Subject[]>("get_subjects_paginated", {
           page: page + 1,
           pageSize,
         });
         console.log(
           "Dados da próxima página: ",
           JSON.stringify(nextData, null, 2)
         );
         setHasMore(nextData.length > 0);
       } catch (error) {
         console.error("Erro ao buscar disciplinas:", error);
       }
     };

     useEffect(() => {
       fetchSubjects(page);
     }, [page]);
  return [subjects, setSubjects, hasMore, setHasMore, page, setPage] as const;
};

import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { onSnapshot, collection } from "firebase/firestore";

export const useCollection = (c) => {
  const [documents, setDocuments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    let ref = collection(db, c);

    const unsub = onSnapshot(
      ref,
      (snapshot) => {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });
        setDocuments(results);
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        console.log(error);
        setError("could not fetch the data");
      }
    );
    return () => unsub();
  }, [c]);

  return { documents, error, isLoading };
};

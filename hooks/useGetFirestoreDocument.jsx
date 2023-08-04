import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

 const useGetFirestoreDocument = (db, collection, documentId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const docRef = doc(db, collection, documentId);
        const docSnap = await getDoc(docRef)
         if (docSnap.exists) {
          setData(docSnap.data());
        } else {
          console.log('Document not found');
        }
        setIsLoading(false);
      } catch (error) {
        setError(error)
      }
    };
     fetchData();
  }, [db, collection, documentId]);
  
  return { data, isLoading, error };
};

 export default useGetFirestoreDocument;
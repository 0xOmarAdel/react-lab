import { useCallback, useEffect, useRef, useState } from "react";
import {
  doc,
  getDocs,
  collection,
  where,
  query,
  limit,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const useGetFirestoreData = (
  c,
  documentId,
  whereStatement,
  orderBy_,
  orderType,
  limit_
) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const whereStatementRef = useRef(whereStatement);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (documentId) {
        const docRef = doc(db, c, documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          onSnapshot(
            docRef,
            (doc) => {
              if (doc.exists()) {
                setData({ ...doc.data(), documentId });
                setError(null);
              } else {
                console.log("Document does not exist");
              }
            },
            (error) => {
              console.error("Error fetching document:", error);
            }
          );
        }
      } else {
        let queryCollection = collection(db, c);

        let queryWhere;
        if (whereStatementRef.current) {
          queryWhere =
            whereStatementRef.current?.lhs &&
            whereStatementRef.current?.op &&
            whereStatementRef.current?.rhs &&
            where(
              whereStatementRef.current.lhs,
              whereStatementRef.current.op,
              whereStatementRef.current.rhs
            );
        }

        let queryOrderBy = orderBy_ && orderBy(orderBy_, orderType || "asc");
        let queryLimit = limit_ && limit(limit_);

        const queryConstraints = { queryWhere, queryOrderBy, queryLimit };
        const filteredQueryConstraints = Object.entries(
          queryConstraints
        ).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});
        const filteredQueryConstraintsArray = Object.values(
          filteredQueryConstraints
        );

        let result = [];

        const querySnapshot = await getDocs(
          filteredQueryConstraintsArray
            ? query(queryCollection, ...filteredQueryConstraintsArray)
            : queryCollection
        );

        querySnapshot.forEach((doc) => {
          result.push({ ...doc.data(), id: doc.id });
        });

        setData(result);
      }
      setIsLoading(false);
    } catch (error) {
      setError(error);
    }
  }, [c, documentId, limit_, orderBy_, orderType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    whereStatementRef.current = whereStatement;
  }, [whereStatement]);

  return { data, isLoading, error };
};

export default useGetFirestoreData;

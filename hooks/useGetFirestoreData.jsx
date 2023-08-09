import { useCallback, useEffect, useRef, useState } from "react";
import {
  doc,
  collection,
  where,
  query,
  limit,
  orderBy,
  onSnapshot,
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
    setIsLoading(true);
    try {
      if (documentId) {
        onSnapshot(doc(db, c, documentId), 
          (docSnap) => {
            if (docSnap.exists()) {
              setData({ ...docSnap.data(), documentId });
            } else {
              setError('Document does not exist');
            }
            setIsLoading(false);
          },
          (error) => {
            setError(error)
            setIsLoading(false);
          }
        );
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

        const q = filteredQueryConstraintsArray ?
          query(queryCollection, ...filteredQueryConstraintsArray)
        :
          queryCollection

        onSnapshot(q,
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              result.push({ ...doc.data(), id: doc.id });
            });
            setData(result);
            setIsLoading(false);
          },
          (error) => {
            setError(error)
            setIsLoading(false);
          }
        );
      }
    } catch (error) {
      setError(error);
    }
  }, [c, documentId, whereStatementRef.current?.lhs, whereStatementRef.current?.op, whereStatementRef.current?.rhs, orderBy_, orderType, limit_]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    whereStatementRef.current = whereStatement;
  }, [whereStatement]);

  return { data, isLoading, error };
};

export default useGetFirestoreData;

/**
 * useFirestoreCollection
 *
 * Reads a Firestore collection in real time.
 *
 * IMPORTANT:
 * - Never writes to Firestore.
 * - Never replaces real Firestore data with fallback data.
 * - Empty Firestore collections remain empty.
 * - Fallback is only retained for backwards compatibility.
 */

import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit as fsLimit,
} from "firebase/firestore";

import { db } from "@/firebase/config";


export default function useFirestoreCollection({
  name,
  where: whereClauses = [],
  orderBy: orderByField,
  limit,
  fallback = [],
  transform,
  enabled = true,
}) {
  const [data, setData] = useState([]);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);


  useEffect(() => {

    // =======================================================
    // DISABLED / INVALID COLLECTION
    // =======================================================

    if (!enabled || !name) {
      setData([]);
      setSource("loading");
      setError(null);
      setLoaded(false);

      return;
    }


    let unsubscribe = () => {};


    // =======================================================
    // RESET STATE
    // =======================================================

    setData([]);
    setSource("loading");
    setError(null);
    setLoaded(false);


    try {

      // =====================================================
      // COLLECTION REFERENCE
      // =====================================================

      const collectionRef = collection(db, name);

      const queryParts = [collectionRef];


      // =====================================================
      // WHERE
      // =====================================================

      if (
        Array.isArray(whereClauses) &&
        whereClauses.length > 0
      ) {
        for (const clause of whereClauses) {

          if (
            Array.isArray(clause) &&
            clause.length >= 3
          ) {
            queryParts.push(
              where(...clause)
            );
          }

        }
      }


      // =====================================================
      // ORDER BY
      // =====================================================

      if (orderByField) {

        let field;
        let direction = "desc";

        if (Array.isArray(orderByField)) {
          field = orderByField[0];
          direction =
            orderByField[1] || "desc";
        } else {
          field = orderByField;
        }

        if (field) {
          queryParts.push(
            orderBy(field, direction)
          );
        }
      }


      // =====================================================
      // LIMIT
      // =====================================================

      if (
        typeof limit === "number" &&
        limit > 0
      ) {
        queryParts.push(
          fsLimit(limit)
        );
      }


      // =====================================================
      // CREATE QUERY
      // =====================================================

      const firestoreQuery =
        query(...queryParts);


      // =====================================================
      // REAL-TIME LISTENER
      // =====================================================

      unsubscribe = onSnapshot(

        firestoreQuery,

        // ---------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------

        (snapshot) => {

          const documents = snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          );


          // -------------------------------------------------
          // TRANSFORM DATA
          // -------------------------------------------------

          let finalData = documents;

          if (typeof transform === "function") {
            try {
              finalData = transform(documents);
            } catch (transformError) {

              console.error(
                `[firestore:${name}] transform failed:`,
                transformError
              );

              setError(transformError);
              setData([]);
              setSource("error");
              setLoaded(true);

              return;
            }
          }


          // -------------------------------------------------
          // FIRESTORE SUCCESS
          // -------------------------------------------------

          setData(
            Array.isArray(finalData)
              ? finalData
              : []
          );

          setSource("firestore");
          setError(null);
          setLoaded(true);


          console.log(
            `[firestore:${name}] loaded ${documents.length} document(s)`
          );
        },


        // ---------------------------------------------------
        // ERROR
        // ---------------------------------------------------

        (err) => {

          console.error(
            `[firestore:${name}] read failed:`,
            err
          );

          setError(err);

          // IMPORTANT:
          // Never use fallback data automatically.
          //
          // An error must remain an error so that
          // user-owned Firestore data cannot accidentally
          // be replaced by mock/fallback data.

          setData([]);
          setSource("error");
          setLoaded(true);
        }
      );

    } catch (err) {

      // =====================================================
      // QUERY SETUP ERROR
      // =====================================================

      console.error(
        `[firestore:${name}] setup failed:`,
        err
      );

      setError(err);
      setData([]);
      setSource("error");
      setLoaded(true);
    }


    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      unsubscribe();
    };


    // We intentionally stringify arrays/objects because
    // callers may create them inline.
    // =======================================================

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name,
    JSON.stringify(whereClauses),
    JSON.stringify(orderByField),
    limit,
    enabled,
  ]);


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // Firestore documents
    data,

    // loading / firestore / error
    source,

    // Firestore error object
    error,

    // Whether initial loading has completed
    loaded,


    // -------------------------------------------------------
    // FIRESTORE STATUS
    // -------------------------------------------------------

    isFirestore:
      source === "firestore",


    // -------------------------------------------------------
    // MOCK STATUS
    //
    // Kept for compatibility with existing components.
    // -------------------------------------------------------

    isMock: false,


    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    isLoading:
      source === "loading" && !loaded,


    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    isError:
      source === "error",
  };
}
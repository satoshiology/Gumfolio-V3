import * as React from "react";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Product, Sale } from "../types";

export function useLiveSalesData() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const userId = auth.currentUser.uid;
    const salesQuery = query(
      collection(db, "users", userId, "sales"),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Sale[];
        setSales(salesData);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Sales Error:", err);
        setError("Failed to stream live sales data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { sales, loading, error };
}

export function useLiveProductsData() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth.currentUser) {
        setLoading(false);
        return;
    }

    const userId = auth.currentUser.uid;
    const productsQuery = collection(db, "users", userId, "products");

    const unsubscribe = onSnapshot(
        productsQuery,
        (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
            setLoading(false);
        },
        (err) => {
            console.error("Firestore Products Error:", err);
            setLoading(false);
        }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading };
}

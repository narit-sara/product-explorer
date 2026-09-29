"use client";

import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductSearchForm from "./ProductSearchForm";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";

// ตัด 'idle' ออกตามส่วนที่ 4.1
type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  
  // เพิ่ม State สำหรับเก็บสินค้าที่กำลังแก้ไข
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
    console.log(`พบสินค้า ${list.total} รายการ`, list.products);
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  // ฟังก์ชันบันทึกสินค้า (รองรับทั้ง เพิ่มใหม่ และ แก้ไข)
  function saveProduct(draft: ProductDraft) {
    if (editingProduct) {
      setProducts(
        products.map((item) =>
          item.id === editingProduct.id ? { ...draft, id: item.id } : item
        )
      );
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...draft, id: Date.now() }]);
    }
  }

  // ฟังก์ชันลบสินค้า
  function removeProduct(id: number) {
    setProducts(products.filter((item) => item.id !== id));
    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
  }

  return (
    <main>
      <h1>รายการสินค้า</h1>

      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
      </button>

      <ProductSearchForm onSearch={loadProducts} />

      <section aria-live="polite">
        {status === "loading" && <p>กำลังโหลดข้อมูล...</p>}

        {status === "error" && <p role="alert">{errorMessage}</p>}

        {status === "ready" && products.length === 0 && (
          <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}

        {status === "ready" && products.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>รูปภาพ</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>คงเหลือ</th>
                <th>หมวดหมู่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.category}</td>
                  <td>
                    <button type="button" onClick={() => setEditingProduct(item)}>
                      แก้ไข
                    </button>
                    <button type="button" onClick={() => removeProduct(item.id)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div>
        <ProductForm
          key={editingProduct ? editingProduct.id : "new"}
          editing={editingProduct}
          onSave={saveProduct}
          onCancel={() => setEditingProduct(null)}
        />
      </div>
    </main>
  );
}
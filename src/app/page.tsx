"use client";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { useState } from "react";

export default function Home() {
  const [country, setCountry] = useState("");
  const [product, setProduct] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productsData, setProductsData] = useState<
    Array<{
      link: string;
      price: string;
      currency: string;
      productName: string;
    }>
  >([]);

  const isDisabled = product === "" || country === "";

  const fetchPrices = async () => {
    setCountry("");
    setProduct("");
    setProductsData([]);
    setIsLoading(true);
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Fetch links for ${product} in ${country} country. 
              Find the best possible deals, give the response in below format,sort the prices in ascending order,your knowledge cutoff is january 2025 and consider the product is released
              "
              {
                "link":"",
                "price":"",
                "currency":"",
                "productName":""
              }
              "
              `,
            },
          ],
        },
      ],
    };
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": `${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const responseJSON = await response.json();
    const finalData = JSON.parse(
      responseJSON.candidates[0].content.parts[0].text
        .split("json")[1]
        .replaceAll("```", "")
    );
    setIsLoading(false);
    setProductsData(finalData);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-white items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col align-items-center">
        <label>Enter Country</label>
        <input
          type="text"
          className="py-1"
          placeholder="Country"
          value={country || ""}
          onChange={(event) => setCountry(event.target.value)}
        />
        <label>Enter Product</label>
        <input
          type="text"
          className="py-1"
          placeholder="Product"
          value={product}
          onChange={(event) => setProduct(event.target.value)}
        />
        <button
          onClick={fetchPrices}
          className={`${isDisabled ? "cursor-not-allowed" : "cursor-pointer"} ${
            isDisabled ? "bg-red-100" : "bg-green-100"
          } rounded-2xl mt-10`}
          type="button"
        >
          Search
        </button>
      </div>
      <div className="mt-10">
        {isLoading ? (
          <p> Loading ...</p>
        ) : productsData.length === 0 ? null : (
          <JsonView data={productsData} />
        )}
      </div>
    </div>
  );
}

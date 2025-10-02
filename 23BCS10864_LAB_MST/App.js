import React from "react";

const ProductCard = ({ name, price, description, instock }) => {
  return (
    <div className="bg-white text-black p-6 m-4 rounded-2xl w-72 border-2 border-gray-300 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-2 text-center">{name}</h2>
      <p className="mb-2 text-center">{description}</p>
      <p className="font-semibold mb-4 text-center">₹ {price}</p>
      {instock ? (
        <button className="px-4 py-2 bg-gray-800 text-white font-bold rounded">
          Buy Now
        </button>
      ) : (
        <span className="text-red-500 font-bold">Out of Stock</span>
      )}
    </div>
  );
};

const App = () => {
  const products = [
    { name: "Headphones", price: 1999, description: "High-quality headphones", instock: true },
    { name: "Futuristic Keyboard", price: 1299, description: "RGB mechanical keyboard", instock: false },
    { name: "VR Glasses", price: 2999, description: "virtual reality headset", instock: true },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-10">
      {products.map((p, i) => (
        <ProductCard key={i} {...p} />
      ))}
    </div>
  );
};

export default App;

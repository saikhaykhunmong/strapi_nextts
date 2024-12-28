"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const items = [
  {
    title: "Food",
    href: "food",
  },
  {
    title: "Dry Food",
    href: "dry-food",
  },
  {
    title: "Drinks",
    href: "drinks",
  },
];

const Home = () => {
  const [homeBackground, setHomeBackground] = useState<string>("");

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/global?populate=*`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch global data");
        }

        const data = await response.json();
        console.log(data)
        const backgroundUrl = data.data.homeBackground?.url;

        if (backgroundUrl) {
          setHomeBackground(`${process.env.NEXT_PUBLIC_STRAPI_URL}${backgroundUrl}`);
        }
      } catch (error) {
        console.error("Error fetching global data:", error);
      }
    };

    fetchGlobalData();
  }, []);

  return (
    <main
      className="w-screen h-screen flex justify-center items-center"
      style={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ul className="flex gap-7 bg-opacity-75 backdrop-blur-md p-4 rounded-lg">
        {items.map((item) => {
          return (
            <li
              key={item.href}
              className="bg-primary-green text-sm text-white p-4 rounded-lg hover:shadow-md hover:bg-primary-green2"
            >
              <Link href={`/explore/${item.href}`}>{item.title}</Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
};

export default Home;

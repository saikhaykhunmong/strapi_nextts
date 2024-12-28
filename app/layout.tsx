"use client";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// 1) Import the AuthProvider
import { AuthProvider } from "./providers/AuthContext"; // Update this path!

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/global?populate=*`);
        const data = await res.json();

        // Extract favicon URL
        const favicon = data?.data?.favicon?.url;
        if (favicon) {
          setFaviconUrl(`${process.env.NEXT_PUBLIC_STRAPI_URL}${favicon}`);
        } else {
          console.warn("Favicon URL not found in the API response.");
        }

        // Extract site title
        const siteName = data?.data?.siteName;
        if (siteName) {
          setSiteTitle(siteName);
        } else {
          console.warn("Site name not found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching global data:", error);
      }
    };

    fetchGlobalData();
  }, []);

  useEffect(() => {
    if (faviconUrl) {
      let linkElement = document.querySelector("link[rel='icon']") as HTMLLinkElement;

      if (!linkElement) {
        linkElement = document.createElement("link") as HTMLLinkElement;
        linkElement.rel = "icon";
        document.head.appendChild(linkElement);
      }

      linkElement.href = faviconUrl;
    }
  }, [faviconUrl]);

  useEffect(() => {
    if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle]);

  return (
    <html lang="en">
      <head>
        <title>{siteTitle || "My App"}</title>
        <link
          rel="icon"
          href={faviconUrl || undefined}
          type="image/x-icon"
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {/* 2) Wrap children in AuthProvider */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

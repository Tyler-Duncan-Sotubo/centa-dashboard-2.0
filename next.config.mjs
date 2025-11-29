/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "centa-hr.s3.eu-west-3.amazonaws.com",
      "centa-hr.s3.amazonaws.com",
      "res.cloudinary.com",
    ], // ✅ Add your image hostname here
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  assetPrefix:
    process.env.NODE_ENV === "development"
      ? `${process.env.NEXT_PUBLIC_CLIENT_URL}`
      : "",

  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

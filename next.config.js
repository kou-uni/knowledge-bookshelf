/** @type {import('next').NextConfig} */
// Force restart
const nextConfig = {
    experimental: {
        serverActions: true,
    },
};

module.exports = nextConfig;

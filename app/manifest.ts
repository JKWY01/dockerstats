import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DockerStats — Docker Official Image Stats',
    short_name: 'DockerStats',
    description: 'Pull counts, tags, and update times for every official Docker image.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f9fd',
    theme_color: '#0d6efd',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}

// Single place that reads Vite's build-time env. In tests this module is
// replaced by a Jest mock (see jest.config.cjs moduleNameMapper) so that
// import.meta never reaches Jest's CommonJS runtime.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050';

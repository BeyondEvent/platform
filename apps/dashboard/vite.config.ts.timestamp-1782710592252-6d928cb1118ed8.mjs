// vite.config.ts
import { resolve } from "node:path";
import tailwindcss from "file:///C:/Users/mobas/projects/beyondevent/node_modules/.pnpm/@tailwindcss+vite@4.3.1_vit_4f4f4a2e16ff985d7caec8ce174c62af/node_modules/@tailwindcss/vite/dist/index.mjs";
import { TanStackRouterVite } from "file:///C:/Users/mobas/projects/beyondevent/node_modules/.pnpm/@tanstack+router-plugin@1.1_4f1ddf57f3eb15d995f71934af47b991/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import react from "file:///C:/Users/mobas/projects/beyondevent/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__7025509c8d8733bf52a54f0dcc5724e2/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///C:/Users/mobas/projects/beyondevent/node_modules/.pnpm/vite@5.4.21_@types+node@22.20.0_lightningcss@1.32.0/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\mobas\\projects\\beyondevent\\apps\\dashboard";
var vite_config_default = defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts"
    }),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:3000", changeOrigin: true },
      "/socket.io": { target: "http://127.0.0.1:3000", ws: true }
    }
  },
  build: {
    target: "esnext",
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtb2Jhc1xcXFxwcm9qZWN0c1xcXFxiZXlvbmRldmVudFxcXFxhcHBzXFxcXGRhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbW9iYXNcXFxccHJvamVjdHNcXFxcYmV5b25kZXZlbnRcXFxcYXBwc1xcXFxkYXNoYm9hcmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21vYmFzL3Byb2plY3RzL2JleW9uZGV2ZW50L2FwcHMvZGFzaGJvYXJkL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHsgVGFuU3RhY2tSb3V0ZXJWaXRlIH0gZnJvbSAnQHRhbnN0YWNrL3JvdXRlci1wbHVnaW4vdml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBUYW5TdGFja1JvdXRlclZpdGUoe1xuICAgICAgcm91dGVzRGlyZWN0b3J5OiAnLi9zcmMvcm91dGVzJyxcbiAgICAgIGdlbmVyYXRlZFJvdXRlVHJlZTogJy4vc3JjL3JvdXRlVHJlZS5nZW4udHMnLFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gICAgdGFpbHdpbmRjc3MoKSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgJy4vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7IHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMCcsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgICAgJy9zb2NrZXQuaW8nOiB7IHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMCcsIHdzOiB0cnVlIH0sXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVixTQUFTLGVBQWU7QUFDOVcsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUywwQkFBMEI7QUFDbkMsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBSjdCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLG1CQUFtQjtBQUFBLE1BQ2pCLGlCQUFpQjtBQUFBLE1BQ2pCLG9CQUFvQjtBQUFBLElBQ3RCLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQXFCLE9BQU87QUFBQSxJQUMzQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVEsRUFBRSxRQUFRLHlCQUF5QixjQUFjLEtBQUs7QUFBQSxNQUM5RCxjQUFjLEVBQUUsUUFBUSx5QkFBeUIsSUFBSSxLQUFLO0FBQUEsSUFDNUQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

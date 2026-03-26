import { ProjectConfig } from '../types';

export function getGoMain(config: ProjectConfig): string {
  const { backendFramework } = config;

  if (backendFramework === 'Gin') {
    return `package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok", "message": "🧭 Navi Gin is running!"})
    })
    r.Run(":8080")
}
`;
  }

  if (backendFramework === 'Echo') {
    return `package main

import (
    "net/http"
    "github.com/labstack/echo/v4"
)

func main() {
    e := echo.New()
    e.GET("/health", func(c echo.Context) error {
        return c.JSON(http.StatusOK, map[string]string{"status": "ok", "message": "🧭 Navi Echo is running!"})
    })
    e.Logger.Fatal(e.Start(":8080"))
}
`;
  }

  if (backendFramework === 'Fiber') {
    return `package main

import (
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"status": "ok", "message": "🧭 Navi Fiber is running!"})
    })
    app.Listen(":3000")
}
`;
  }

  // Fallback Go stdlib
  return `package main

import (
    "encoding/json"
    "net/http"
)

func main() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "message": "🧭 Navi Go is running!"})
    })
    http.ListenAndServe(":8080", nil)
}
`;
}

export function getGoMod(config: ProjectConfig): string {
  const modPath = `github.com/amanblaze/${config.projectName.toLowerCase().replace(/\\s+/g, '-')}`;
  
  let deps = '';
  if (config.backendFramework === 'Gin') deps = 'require github.com/gin-gonic/gin v1.9.1';
  if (config.backendFramework === 'Echo') deps = 'require github.com/labstack/echo/v4 v4.11.3';
  if (config.backendFramework === 'Fiber') deps = 'require github.com/gofiber/fiber/v2 v2.51.0';

  return `module ${modPath}

go 1.21

${deps}
`;
}

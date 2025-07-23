// server.js

const http = require("http");
const fs = require("fs");
const path = require("path");

// --- CONFIGURAÇÃO ---
const PORT = 8081; // Porta em que o servidor irá rodar
const DATA_FILE = path.join(__dirname, "chamada_dados.json"); // Arquivo de dados

// --- DADOS INICIAIS (caso o arquivo não exista) ---
const initialCadets = [
  "ANA CAROLINA",
  "VIEIRA",
  "MEDINA",
  "ARNON",
  "BRUNO DANTAS",
  "CARLOS LANA",
  "NESTOR",
  "DINEY",
  "VICTOR",
  "EDER MONTEIRO",
  "SOARES",
  "DORNELAS",
  "EDUARDO DIAS",
  "EDUARDO",
  "MARQUES",
  "FELIPE",
  "AMORIM",
  "OLIVEIRA LOPES",
  "HELOYANA",
  "IGOR",
  "BARCELOS",
  "RENATO",
  "LEANDRO",
  "LUAN",
  "PAULO PIMENTA",
  "OLIVEIRA COSTA",
  "MAURO",
  "NÚBIA",
  "NAZARIO",
  "HORTA",
  "GUIMARÃES",
  "FELICIA",
  "SARA",
  "LINHARES",
];
const getInitialData = () => {
  return {
    cadetData: initialCadets.map((name) => ({
      name: name,
      rollCalls: {
        chamada: { status: "nao_preenchido", reason: "" },
        almoco: { status: "nao_preenchido", reason: "" },
        tarde: { status: "nao_preenchido", reason: "" },
        liberacao: { status: "nao_preenchido", reason: "" },
      },
    })),
    activeRollCall: "chamada",
  };
};

// --- FUNÇÃO PARA LIDAR COM AS REQUISIÇÕES ---
const requestListener = (req, res) => {
  // Habilita o CORS para a API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde a requisições OPTIONS (necessário para o CORS)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Servir arquivos estáticos (.js, .css, .png, .jpg, .ico)
  if (
    req.method === "GET" &&
    (req.url.endsWith(".js") ||
      req.url.endsWith(".css") ||
      req.url.endsWith(".png") ||
      req.url.endsWith(".jpg") ||
      req.url.endsWith(".ico"))
  ) {
    const filePath = path.join(__dirname, req.url);
    const ext = path.extname(req.url);
    const mimeTypes = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".ico": "image/x-icon",
    };
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
        res.end(data);
      }
    });
  }
  // 2. Servir o index.html na raiz "/"
  else if (req.url === "/" && req.method === "GET") {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro ao carregar a página.");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }
  // 3. API: Obter dados
  else if (req.url === "/api/data" && req.method === "GET") {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          const initialData = getInitialData();
          fs.writeFile(
            DATA_FILE,
            JSON.stringify(initialData, null, 2),
            (writeErr) => {
              if (writeErr) {
                res.writeHead(500);
                res.end(
                  JSON.stringify({
                    message: "Erro ao criar o arquivo de dados.",
                  })
                );
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(initialData));
            }
          );
        } else {
          res.writeHead(500);
          res.end(
            JSON.stringify({ message: "Erro ao ler o arquivo de dados." })
          );
        }
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      }
    });
  }
  // 4. API: Salvar dados
  else if (req.url === "/api/data" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      fs.writeFile(DATA_FILE, body, "utf8", (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ message: "Erro ao salvar os dados." }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ message: "Dados salvos com sucesso!" }));
        }
      });
    });
  }
  // 5. API: Resetar dados
  else if (req.url === "/api/reset" && req.method === "POST") {
    const initialData = getInitialData();
    fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), (err) => {
      if (err) {
        res.writeHead(500);
        res.end(
          JSON.stringify({ message: "Erro ao resetar o arquivo de dados." })
        );
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ message: "Dados resetados com sucesso!" }));
      }
    });
  }
  // 6. Rota não encontrada
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Rota não encontrada." }));
  }
};

// --- INICIA O SERVIDOR ---
const server = http.createServer(requestListener);
server.listen(PORT, () => {
  console.log(`Servidor da Chamada PMMG a rodar em http://localhost:${PORT}`);
  if (!fs.existsSync(DATA_FILE)) {
    console.log("Arquivo de dados não encontrado. A criar um novo...");
    fs.writeFileSync(DATA_FILE, JSON.stringify(getInitialData(), null, 2));
  }
});

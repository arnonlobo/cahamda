// server.js

// Importa os módulos necessários
const http = require("http");
const fs = require("fs");
const path = require("path");

// --- CONFIGURAÇÃO ---
const PORT = 8081; // Porta em que o servidor irá rodar. Pode ser alterada.
const DATA_FILE = path.join(__dirname, "chamada_dados.json"); // Nome do arquivo para salvar os dados.

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
  // Habilita o CORS para permitir que a página HTML acesse o servidor
  res.setHeader("Access-Control-Allow-Origin", "*"); // Em produção, restrinja para o seu domínio
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde a requisições OPTIONS (necessário para o CORS)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rota para obter os dados
  if (req.url === "/api/data" && req.method === "GET") {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) {
        // Se o arquivo não existe, cria com os dados iniciais
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
  // Rota para salvar os dados
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
  // Rota para resetar os dados
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
  // Rota não encontrada
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Rota não encontrada." }));
  }
};

// --- INICIA O SERVIDOR ---
const server = http.createServer(requestListener);
server.listen(PORT, () => {
  console.log(`Servidor da Chamada PMMG a rodar em http://localhost:${PORT}`);
  // Verifica se o arquivo de dados existe, se não, cria.
  if (!fs.existsSync(DATA_FILE)) {
    console.log("Arquivo de dados não encontrado. A criar um novo...");
    fs.writeFileSync(DATA_FILE, JSON.stringify(getInitialData(), null, 2));
  }
});

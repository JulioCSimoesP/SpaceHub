# 🚀 SpaceHub | Conectando Lugares e Pessoas

O **SpaceHub** é uma plataforma web full-stack desenvolvida para facilitar a descoberta, locação e gestão de espaços e acomodações. A aplicação conecta anfitriões que desejam anunciar seus imóveis a hóspedes em busca de estadias completas, oferecendo busca geoespacial inteligente com Google Maps, galeria interativa de fotos, controle de reservas sem conflito de datas e persistência de snapshots imutáveis para proteção contratual.

🔗 **Deploy da Aplicação:** [https://space-hub-one-liart.vercel.app/](https://space-hub-one-liart.vercel.app/)

---

## 📌 Links de Planejamento e Documentação Técnica

Os documentos e diagramas que guiaram a arquitetura e desenvolvimento do projeto estão organizados na pasta `/public/assets/docs/`:

* 🎯 [Visão Geral do Projeto](https://space-hub-one-liart.vercel.app/assets/docs/visao_do_projeto_spacehub.docx)
* 📐 [Requisitos Funcionais e Não Funcionais](https://space-hub-one-liart.vercel.app/assets/docs/requisitos_spacehub.docx)
* 🧠 [Registro de Decisões Técnicas (ADR)](https://space-hub-one-liart.vercel.app/assets/docs/registro_de_decisoes_tecnicas-spacehub.docx)
* 🗄️ [Modelagem de Dados (MongoDB / Mongoose)](https://space-hub-one-liart.vercel.app/assets/docs/modelagem-dados-spacehub.drawio.png)
* 🔄 [Diagrama de Casos de Uso](https://space-hub-one-liart.vercel.app/assets/docs/diagrama-casos-uso-spacehub.drawio.png)
* 🎨 [Wireframe e Design no Figma](https://www.figma.com/design/uNBEFoyU2BdNwkrWh13Fb8/SpaceHub?node-id=0-1&t=bNqnbochYabxiNrm-1)
* 📋 [Quadro de Tarefas](https://trello.com/invite/b/6a36f7ca8cdfc38f305e3814/ATTIa1e47d1ed4ff0a6f6774508f5c8329dfB72BEBCA/projeto-spacehub)

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
* **Arquitetura SPA:** Vanilla JavaScript modular (ES Modules), SPA Router nativo com histórico da History API.
* **Estilização:** CSS3 customizado com design responsivo e acessibilidade (WAI-ARIA).
* **Bibliotecas e APIs:**
  * **Axios** (via Import Maps para requisições HTTP RESTful).
  * **Google Maps JavaScript API** (Markers e Autocomplete de Geolocation).
  * **Fancybox v6** (Visualização e carrossel interativo de galerias de imagem).

### **Backend & Infraestrutura**
* **Runtime:** Node.js (v18+) com framework **Express.js** estruturado no padrão MVC.
* **Banco de Dados:** **MongoDB Atlas** gerenciado via **Mongoose ODM**.
* **Autenticação:** JSON Web Tokens (**JWT**) com hashing seguro de senhas via **Bcrypt.js**.
* **Upload e Mídia:** **Multer** e integração com **Cloudinary SDK**.
* **Deploy & Hosting:** **Vercel** (Serverless Functions e entrega de ativos estáticos).

---

## 📂 Estrutura de Arquivos

```text
Projeto SpaceHub/
├── api/
│   └── index.js                      # Ponto de entrada Serverless da Vercel
├── public/
│   ├── assets/
│   │   ├── docs/                     # Diagramas e documentação de planejamento
│   │   ├── favicon/                  # Favicons e manifest
│   │   ├── images/                   # Imagens institucionais e OpenGraph
│   │   └── svg/                      # Ícones vetoriais
│   ├── css/
│   │   └── main.css                  # Estilos globais e componentes visuais
│   ├── js/
│   │   ├── core/
│   │   │   ├── auth.js               # Gestão de tokens, papéis e sessão
│   │   │   └── router.js             # Roteador SPA do frontend
│   │   ├── pages/                    # Controladores de visualização (Pages)
│   │   │   ├── authPage.js
│   │   │   ├── bookingDashboardPage.js
│   │   │   ├── bookingDetailsPage.js
│   │   │   ├── explorePage.js
│   │   │   ├── headerPage.js
│   │   │   ├── spaceDashboardPage.js
│   │   │   ├── spaceDetailsPage.js
│   │   │   └── spaceFormPage.js
│   │   ├── services/                 # Clientes de API e comunicação HTTP
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── spaceService.js
│   │   │   └── uploadService.js
│   │   ├── utils/
│   │   │   ├── formatters.js         # Utilitários de moeda, datas e valores
│   │   │   └── map.js                # Helpers para inicialização do Google Maps
│   │   └── main.js                   # Bootstrap do frontend
│   ├── views/                        # Templates parciais em HTML da SPA
│   │   ├── auth/
│   │   │   └── auth.html
│   │   ├── client/
│   │   │   └── explore.html
│   │   ├── host/
│   │   │   ├── space-dashboard.html
│   │   │   └── space-form.html
│   │   ├── partials/
│   │   │   └── header.html
│   │   └── shared/
│   │       ├── booking-dashboard.html
│   │       ├── booking-details.html
│   │       ├── not-found.html
│   │       └── space-details.html
│   └── index.html                    # Layout base da Single Page Application
├── src/
│   ├── config/
│   │   ├── cloudinary.js             # Configuração da SDK do Cloudinary
│   │   └── db.js                     # Conexão Mongoose com MongoDB Atlas
│   ├── constants/
│   │   └── spaceOptions.js           # Comodidades, regras e opções fixas
│   ├── controllers/                  # Controladores REST da API
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── spaceController.js
│   │   └── uploadController.js
│   ├── database/
│   │   └── seed.js                   # Script de população inicial do banco
│   ├── middlewares/
│   │   ├── authMiddleware.js         # Proteção de rotas JWT e validação de papéis
│   │   ├── errorMiddleware.js        # Tratamento global de erros HTTP
│   │   └── uploadMiddleware.js       # Middleware de processamento com Multer
│   ├── models/                       # Schemas do Mongoose
│   │   ├── Booking.js
│   │   ├── Space.js
│   │   └── User.js
│   ├── routes/                       # Rotas da API REST
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── spaceRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   └── dateUtils.js              # Helpers de comparação e sobreposição de datas
│   ├── app.js                        # Configuração dos middlewares Express
│   └── server.js                     # Inicialização do servidor local
├── example.env                       # Exemplo de variáveis de ambiente
├── package.json
└── vercel.json                       # Configuração de rewrites e runtime na Vercel
```

## ⚙️ Instruções para Execução Local
### Pré-requisitos
* Node.js versão 18 ou superior instalada.

* Conta e cluster ativo no MongoDB Atlas.

* Conta no Cloudinary para armazenamento de imagens.

* Chave de API da Google Maps Platform.

### Passo a Passo
1. Clone o repositório:

```
git clone [https://github.com/seu-usuario/spacehub.git](https://github.com/seu-usuario/spacehub.git)
cd spacehub
```

2. Instale as dependências:

```
npm install
```

3. Configure as Variáveis de Ambiente:

Crie um arquivo .env na raiz do projeto com base no example.env:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/spacehub?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_super_segura
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

4. (Opcional) Popule o banco de dados com dados iniciais:

```
npm run seed
```

5. Inicie o servidor em modo de desenvolvimento:

```
npm run dev
```

6. Acesse no navegador:

Abra http://localhost:3000 para interagir com o projeto.

## 👨‍💻 Autor

Desenvolvido por Júlio Simões.

LinkedIn: [https://www.linkedin.com/in/julio-simoes](https://www.linkedin.com/in/julio-simoes-dev/)

GitHub: [@JulioCSimoesP](https://github.com/JulioCSimoesP)

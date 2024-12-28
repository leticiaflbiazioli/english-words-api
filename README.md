# 📖 Sistema de Gerenciamento de Palavras em inglês

## 📝 Descrição

Este projeto é uma API desenvolvida para gerenciar informações sobre palavras em inglês (pronúncia, significado, sinônimos, etc) através da [Free Dictionary API](https://dictionaryapi.dev/). Ele permite funcionalidades como registro e autenticação de usuários, busca por palavras, adição de favoritos e consulta ao histórico.
Esse projeto possui uma aplicação front-end respectiva que pode ser consultada [nesse link](https://github.com/leticiaflbiazioli/english-words-app).
Além disso, na pasta _scripts_ você vai encontrar um script para baixar uma lista de palavras desse [repositório](https://github.com/dwyl/english-words/blob/master/words_dictionary.json) e importar elas para o banco de dados.

---

## 🛠️ Stack

- **Linguagem**: TypeScript
- **Framework**: NestJS
- **Banco de Dados**: MongoDB
- **Autenticação**: JSON Web Tokens (JWT)
- **Testes**: Jest
- **Cache**: Redis

---

## 🌐 Endpoints

### **Autenticação**

#### 1. **POST /auth/signup**

- **Descrição**: Registra um novo usuário.
- **Request**:
  ```json
  {
    "name": "Usuário Exemplo",
    "email": "usuario@exemplo.com",
    "password": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "id": "63f23e7b1234567890abcd",
    "name": "Usuário Exemplo",
    "token": "jwt_token_aqui"
  }
  ```

#### 2. **POST /auth/signin**

- **Descrição**: Realiza o login de um usuário.
- **Request**:
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "id": "63f23e7b1234567890abcd",
    "name": "Usuário Exemplo",
    "token": "jwt_token_aqui"
  }
  ```

### **Palavras**

#### 3. **GET /entries/en**

- **Descrição**: Lista palavras com paginação.
- **Query Params**:
  - _search_: Termo para busca.
  - _limit_ (opcional): Limite de resultados (padrão: 10).
  - _page_ (opcional): Página atual (padrão: 1).
- **Response**:
  ```json
  {
    "results": ["word1", "word2"],
    "totalDocs": 2,
    "page": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
  ```

#### 4. **GET /entries/en/:word**

- **Descrição**: Busca uma palavra específica.
- **Path Params**:
  - _word_: Palavra para busca.
- **Response**:
  ```json
  {
    "word": "example",
    "data": {}
  }
  ```
  Os dados contidos no campo "data" pode ser consultado nessa [documentação do Free Dictionary API](https://dictionaryapi.dev/).

#### 5. **POST /entries/en/:word/favorite**

- **Descrição**: Adiciona uma palavra à lista de favoritos.
- **Path Params**:
  - _word_: Palavra para busca.
- **Response**:
  ```json
  {
    "message": "Palavra 'word' adicionada aos favoritos"
  }
  ```

#### 6. **DELETE /entries/en/:word/unfavorite**

- **Descrição**: Remove uma palavra da lista de favoritos.
- **Path Params**:
  - _word_: Palavra para busca.
- **Response**:
  ```json
  {
    "message": "Palavra 'word' removida dos favoritos"
  }
  ```

### **Usuário**

#### 7. **GET /user/me**

- **Descrição**: Retorna o perfil do usuário autenticado.
- **Response**:
  ```json
  {
    "name": "Usuário Exemplo",
    "email": "usuario@exemplo.com",
    "history": [{ "word": "example", "searchedAt": "2024-01-01T00:00:00Z" }],
    "favorites": [{ "word": "example", "favoritedAt": "2024-01-01T00:00:00Z" }]
  }
  ```
  Os campos _history_ e _favorites_ são limitados a 10 itens.

#### 8. **GET /user/me/history**

- **Descrição**: Lista o histórico de buscas do usuário.
- **Response**:
  ```json
  {
    "results": [{ "word": "example", "added": "2024-01-01T00:00:00Z" }],
    "totalDocs": 1,
    "page": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
  ```

#### 9. **GET /user/me/favorites**

- **Descrição**: Lista as palavras favoritas do usuário.
- **Response**:
  ```json
  {
    "results": [{ "word": "example", "added": "2024-01-01T00:00:00Z" }],
    "totalDocs": 1,
    "page": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
  ```

---

## 🚀 Como subir a aplicação

### **1. Pré-requisitos**

- Node.js (versão 16 ou superior)
- MongoDB (local ou em nuvem)
- Gerenciador de pacotes: NPM

### **2. Instalação**

Clone o repositório e instale as dependências:

`npm install`

### **3. Configuração**

Crie um arquivo _.env_ com as variáveis de ambiente necessárias.

### **4. Inicialização**

Inicie a aplicação:

`npm run start:dev`

A API estará disponível em: http://localhost:3000

### **5. Utilize o script**

Na pasta _scripts_, crie um arquivo _.env_ com as variáveis de ambiente necessárias e rode o script para alimentar as palavras no banco de dados:

`cd src/scripts`
`npm install`
`node create-database.js`

### **6. Teste a API via Swagger**

Acesse o Swagger para testar os endpoints da API através do link http://localhost:3000/api.

### **7. Consulte os endpoints**

Na pasta _collection_ está disponível também uma collection do Insomnia para teste dos endpoints, caso prefira.

---

## 🧪 Como rodar os testes

### **1. Rodar todos os testes**

`npm run test`

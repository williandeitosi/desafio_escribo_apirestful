# Desafio Escribo API RESTful

Este é um projeto que contém uma API RESTful para gerenciamento de usuários usando Node.js, Express e MongoDB.

## Configuração

Antes de executar o projeto, é necessário configurar algumas variáveis de ambiente.




### Instalação

Para instalar as dependências do projeto, execute:

npm install

### Variáveis de Ambiente

Certifique-se de criar um arquivo `.env` na raiz do projeto com as seguintes variáveis:

MONGODB_URI=URI_do_seu_Banco_de_Dados_MongoDB

JWT_SECRET=Sua_chave_secreta_para_gerar_tokens_JWT

TOKEN_EXPIRATION=Tempo_de_expiração_para_o_token_em_segundos

PORT=Porta_do_servidor_express


### Execução

Para iniciar o servidor localmente, utilize o comando:

npm start



## Uso
recomendo utilizar o postman ou insomnia

A API possui os seguintes endpoints:

- `POST /auth/signup`: Cria um novo usuário.
  - Body:
   ```json
    {
      "nome": "Nome do Usuário",
      "email": "usuario@email.com",
      "senha": "suaSenhaSegura",
      "telefone": [{ "numero": "123456789", "ddd": "11" }]
    }
    ````

- `POST /auth/signin`: Autentica um usuário existente.
  - Body: 
  ```json
    {
      "email": "usuario@email.com",
      "senha": "suaSenhaSegura"
    }

- `GET /auth/users`: Retorna as informações do usuário autenticado.
  - Header: `Authorization: Bearer Seu_Token_JWT`
  - Forneça um token de autorização no cabeçalho da requisição (Bearer Token).

Certifique-se de substituir as informações acima pelos valores apropriados.


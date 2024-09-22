# Use uma imagem base oficial do Node.js LTS
FROM node:18-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências da aplicação
RUN npm install --production

# Copie o restante do código da aplicação para o container
COPY . .

# Compile o código NestJS para produção
RUN npm run build

# Exponha a porta 5000
EXPOSE 5000

# Defina as variáveis de ambiente
ENV PORT 5000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:dev"]

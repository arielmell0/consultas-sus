# Sistema Único de Saúde (SUS) - Projeto Acadêmico

Este é um projeto acadêmico desenvolvido para simular um sistema de cadastro de usuários do SUS (Sistema Único de Saúde) utilizando tecnologias modernas de desenvolvimento web.

## 🚀 Tecnologias Utilizadas

- **Next.js 15.3.3** - Framework React para desenvolvimento web
- **TypeScript** - Linguagem de programação com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **React Hooks** - Para gerenciamento de estado
- **localStorage** - Para persistência de dados local

## 📋 Funcionalidades

### ✅ Implementadas
- **Página Inicial**: Interface de apresentação do sistema
- **Cadastro de Usuários**: Formulário completo com validações
- **Visualização de Usuários**: Lista de usuários cadastrados
- **Validações**: CPF, email, telefone e senha
- **Armazenamento Local**: Dados salvos no localStorage do navegador
- **Design Responsivo**: Interface adaptável para diferentes dispositivos
- **Máscaras de Entrada**: Formatação automática para CPF e telefone

### 🔒 Segurança e Privacidade
- Mascaramento de dados sensíveis (CPF e email) na visualização
- Validação de CPF com algoritmo oficial
- Verificação de duplicatas por email e CPF
- Validação de formato de email

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── cadastro/
│   │   └── page.tsx          # Página de cadastro
│   ├── usuarios/
│   │   └── page.tsx          # Página de visualização de usuários
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página inicial
├── hooks/
│   └── useLocalStorage.ts    # Hook personalizado para localStorage
└── components/               # Componentes reutilizáveis (futuro)
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18.18.0 ou superior
- npm ou yarn

### Instalação e Execução

1. **Clone o repositório** (se aplicável):
   ```bash
   git clone [url-do-repositorio]
   cd ulbra-sus-project
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📱 Páginas Disponíveis

- **/** - Página inicial com apresentação do sistema
- **/cadastro** - Formulário de cadastro de usuários
- **/usuarios** - Lista de usuários cadastrados (para demonstração)

## 🎯 Funcionalidades Detalhadas

### Cadastro de Usuários
- **Campos obrigatórios**: Email, Senha, CPF, Telefone
- **Validações em tempo real**:
  - Email: Formato válido
  - Senha: Mínimo 6 caracteres
  - CPF: Validação com algoritmo oficial brasileiro
  - Telefone: Mínimo 10 dígitos
- **Formatação automática**: CPF e telefone são formatados durante a digitação
- **Verificação de duplicatas**: Impede cadastro de email ou CPF já existentes

### Visualização de Usuários
- **Lista completa** de usuários cadastrados
- **Dados mascarados** por segurança (CPF e email parcialmente ocultos)
- **Informações exibidas**: ID, Email, CPF, Telefone, Data de Cadastro
- **Funcionalidade de limpeza**: Botão para remover todos os usuários

### Armazenamento de Dados
- **localStorage**: Dados persistem entre sessões do navegador
- **Estrutura JSON**: Dados organizados e facilmente manipuláveis
- **IDs únicos**: Cada usuário recebe um ID único baseado em timestamp + random

## 🎨 Design e UX

- **Interface moderna**: Design limpo e profissional
- **Cores institucionais**: Paleta baseada nas cores do SUS
- **Responsividade**: Funciona em desktop, tablet e mobile
- **Feedback visual**: Estados de loading, erro e sucesso
- **Acessibilidade**: Labels apropriados e navegação por teclado

## 📊 Estrutura de Dados

### Modelo de Usuário
```typescript
interface User {
  id: string;           // ID único gerado automaticamente
  email: string;        // Email do usuário
  password: string;     // Senha (em produção seria hasheada)
  cpf: string;          // CPF sem formatação
  phone: string;        // Telefone com formatação
  createdAt: string;    // Data de criação em ISO string
}
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa verificação de código

## 📝 Considerações Acadêmicas

Este projeto foi desenvolvido com foco educacional e demonstra:

1. **Desenvolvimento Frontend Moderno**: Uso de React, Next.js e TypeScript
2. **Gerenciamento de Estado**: Hooks personalizados e useState
3. **Validação de Dados**: Implementação de validações robustas
4. **UX/UI Design**: Interface intuitiva e responsiva
5. **Persistência de Dados**: Uso do localStorage para simulação de banco de dados
6. **Boas Práticas**: Código limpo, componentização e tipagem

## ⚠️ Limitações e Melhorias Futuras

### Limitações Atuais
- Dados armazenados apenas localmente (localStorage)
- Senhas não são criptografadas
- Não há autenticação real
- Sem integração com APIs externas

### Melhorias Propostas
- Integração com banco de dados real
- Sistema de autenticação JWT
- Criptografia de senhas
- API REST para operações CRUD
- Testes automatizados
- Deploy em produção

## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido como parte do curso de ADS na ULBRA, demonstrando conhecimentos em:

- Desenvolvimento web moderno
- React e Next.js
- TypeScript
- Design responsivo
- Validação de dados
- Experiência do usuário (UX)

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos e educacionais.

---

**Desenvolvido para ULBRA - Universidade Luterana do Brasil**  
*Projeto Acadêmico - Sistema de Cadastro SUS*

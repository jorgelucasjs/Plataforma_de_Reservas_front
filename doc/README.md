# 📚 Documentação do Projeto

Esta pasta contém a documentação técnica do projeto AgendaSmart.

## 📄 Documentos Disponíveis

### [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
**Guia completo da API para desenvolvedores frontend**

Conteúdo:
- Visão geral da API
- Sistema de autenticação JWT
- Endpoints disponíveis
- Exemplos de requisições
- Códigos de erro
- Exemplos de implementação
- Boas práticas

**Quando usar**: Ao integrar com a API backend, implementar novas features que consomem a API, ou debugar problemas de comunicação.

### [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md)
**Guia de desenvolvimento e padrões de código**

Conteúdo:
- Convenções gerais
- Estrutura de pastas
- Padrão DAO (Data Access Object)
- Padrão Repository
- Stores com Zustand
- Diretrizes Chakra UI v3
- Fluxo de desenvolvimento
- Tratamento de erros
- Testes
- Exemplos práticos

**Quando usar**: Ao criar novos recursos, refatorar código existente, ou revisar código de outros desenvolvedores.

### [OBJECTIVO.MD](OBJECTIVO.MD)
**Objetivos e requisitos originais do projeto**

Conteúdo:
- Objetivos do projeto
- Requisitos funcionais
- Requisitos técnicos
- Critérios de avaliação

**Quando usar**: Para entender o contexto e objetivos originais do projeto.

## 🎯 Guia de Uso

### Para Novos Desenvolvedores

1. **Primeiro**: Leia [OBJECTIVO.MD](OBJECTIVO.MD) para entender o contexto
2. **Segundo**: Estude [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md) para aprender os padrões
3. **Terceiro**: Consulte [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) quando trabalhar com a API

### Para Desenvolvedores Experientes

- Use [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md) como referência rápida
- Consulte [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) para detalhes de endpoints
- Revise [OBJECTIVO.MD](OBJECTIVO.MD) quando precisar validar requisitos

### Para Code Review

1. Verifique se o código segue [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md)
2. Valide se a integração com API está conforme [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
3. Confirme que atende aos requisitos de [OBJECTIVO.MD](OBJECTIVO.MD)

## 🔗 Links Relacionados

### Documentação Principal
- [../README.md](../README.md) - Visão geral do projeto
- [../QUICK_START.md](../QUICK_START.md) - Guia de início rápido
- [../REFATORACAO_COMPLETA.md](../REFATORACAO_COMPLETA.md) - Detalhes da arquitetura

### Código Fonte
- [../src/dao/](../src/dao/) - Implementação dos DAOs
- [../src/repositories/](../src/repositories/) - Implementação dos repositories
- [../src/stores/](../src/stores/) - Implementação dos stores

## 📝 Convenções de Documentação

### Formato
- Markdown (.md)
- Títulos em português
- Código em inglês
- Exemplos práticos

### Estrutura
1. Título e descrição
2. Índice (se necessário)
3. Conteúdo principal
4. Exemplos
5. Referências

### Atualização
- Manter sincronizado com o código
- Revisar em cada release
- Adicionar exemplos quando necessário

## 🆕 Adicionando Nova Documentação

Ao adicionar novos documentos:

1. **Crie o arquivo** na pasta `doc/`
2. **Use formato Markdown** (.md)
3. **Adicione ao índice** deste README
4. **Atualize links** em outros documentos
5. **Adicione ao** [../INDEX.md](../INDEX.md)

### Template Básico

```markdown
# Título do Documento

## Visão Geral
Breve descrição do conteúdo.

## Conteúdo Principal
Detalhes...

## Exemplos
```typescript
// Código de exemplo
```

## Referências
- Link 1
- Link 2
```

## 🔍 Busca Rápida

### Autenticação
- API: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md#autenticação)
- Padrões: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md)

### Serviços
- API: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md#gestão-de-serviços)
- Padrões: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md)

### Reservas
- API: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md#gestão-de-reservas)
- Padrões: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md)

### Padrões de Código
- DAO: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md#dao)
- Repository: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md#repository)
- Store: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md#stores)

## 📊 Estatísticas

- **Total de documentos**: 3
- **Páginas estimadas**: ~50
- **Última atualização**: 19/10/2025

## 🎯 Próximos Passos

Documentação futura a considerar:
- [ ] Guia de testes
- [ ] Guia de deploy
- [ ] Guia de troubleshooting
- [ ] API de componentes UI
- [ ] Guia de performance

## 💡 Dicas

1. **Mantenha atualizado**: Documente mudanças importantes
2. **Seja claro**: Use exemplos práticos
3. **Seja conciso**: Evite informação redundante
4. **Use links**: Conecte documentos relacionados
5. **Revise regularmente**: Garanta que está correto

## 🆘 Precisa de Ajuda?

- Dúvidas sobre API: [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
- Dúvidas sobre código: [LLM_DEVELOPMENT_GUIDE.md](LLM_DEVELOPMENT_GUIDE.md)
- Dúvidas gerais: [../README.md](../README.md)

---

**Mantenha esta documentação atualizada!**
